```{eval-rst}
.. tutorials-transfer-documents:
```

# Transfer documents

In this tutorial, we will transfer ownership of a document directly to another identity. The example
uses the DPNS `domain` document behind a `.dash` name, but the same API works with any document type
whose data contract enables transfers with `transferable: 1`.

## Prerequisites

- [General prerequisites](../../tutorials/introduction.md#prerequisites) (Node.js / Dash SDK installed)
- A platform address with a balance: [Tutorial: Create and Fund a Wallet](../../tutorials/create-and-fund-a-wallet.md)
- A configured client: [Setup SDK Client](../setup-sdk-client.md)
- A Dash Platform identity: [Tutorial: Register an Identity](../../tutorials/identities-and-names/register-an-identity.md)
- A DPNS name owned by that identity: [Tutorial: Register a Name](../../tutorials/identities-and-names/register-a-name-for-an-identity.md)
- The recipient's identity ID, set as `DOCUMENT_RECIPIENT_ID`

Set `NAME_LABEL` to the name without its `.dash` suffix. Transferring the name changes its owner, so
use a name you intend to give to the recipient.

## Code

```{code-block} javascript
:caption: document-transfer.mjs

import { setupDashClient } from '../setupDashClient.mjs';

const { sdk, keyManager } = await setupDashClient();
const { identity, identityKey, signer } = await keyManager.getAuth();

// Transfer works with any document type whose contract enables `transferable`.
// This tutorial uses a DPNS name because names are familiar transferable documents.
const DPNS_CONTRACT_ID = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';
const NAME_LABEL = process.env.NAME_LABEL || 'alice';
const DOCUMENT_RECIPIENT_ID =
  process.env.DOCUMENT_RECIPIENT_ID || 'YOUR_DOCUMENT_RECIPIENT_ID';

try {
  // Check configuration before spending a network round-trip on the query
  if (DOCUMENT_RECIPIENT_ID === 'YOUR_DOCUMENT_RECIPIENT_ID') {
    throw new Error('Set DOCUMENT_RECIPIENT_ID to the new owner identity ID');
  }

  const documents = await sdk.documents.query({
    dataContractId: DPNS_CONTRACT_ID,
    documentTypeName: 'domain',
    where: [
      ['normalizedParentDomainName', '==', 'dash'],
      ['normalizedLabel', '==', NAME_LABEL.toLowerCase()],
    ],
  });
  const document = [...documents.values()][0];

  if (!document) {
    throw new Error(`Name "${NAME_LABEL}.dash" was not found`);
  }

  // Only the current owner can transfer a document
  if (document.ownerId.toString() !== identity.id.toString()) {
    throw new Error(
      `"${NAME_LABEL}.dash" is owned by ${document.ownerId}, not ${identity.id}`,
    );
  }

  document.revision = BigInt(document.revision ?? 0) + 1n;

  // A successful transfer also clears any active sale price
  await sdk.documents.transfer({
    document,
    recipientId: DOCUMENT_RECIPIENT_ID,
    identityKey,
    signer,
  });

  console.log(
    `Document for "${NAME_LABEL}.dash" transferred to ${DOCUMENT_RECIPIENT_ID}.`,
  );
} catch (e) {
  console.error('Something went wrong:\n', e.message);
}
```

## What's happening

After connecting, we query the DPNS contract for the selected name and confirm that the authenticated
identity owns it. Mutating an existing document requires its current revision plus one, so the code
increments `document.revision` before calling `sdk.documents.transfer()` with the recipient ID and
signing credentials.

Only the current owner can transfer a document. A successful transfer clears any active sale price,
and the recipient becomes the owner immediately. For DPNS names, name resolution follows the new
owner.

:::{note}
Document transfers use the authentication key returned by `keyManager.getAuth()`. The identity key
whose purpose is `TRANSFER` is for credit transfers and withdrawals, not document ownership changes.
:::

See [Name transfers and sales](../../explanations/dpns.md#name-transfers-and-sales),
[NFT transfer and trade](../../explanations/nft.md#transfer-and-trade), and the
[document transfer protocol reference](../../protocol-ref/document.md#document-transfer-transition).

:::{tip}
See this in an example app: [DashMint Lab — Transfer a card](../example-apps/dashmint-lab.md#transfer-a-card).
:::
