```{eval-rst}
.. tutorials-set-document-price:
```

# Set a document price

In this tutorial, we will list a document for direct purchase by setting its price. The example uses
a DPNS name, but pricing is available to any document type whose data contract enables direct
purchases with `tradeMode: 1`.

## Prerequisites

- [General prerequisites](../../tutorials/introduction.md#prerequisites) (Node.js / Dash SDK installed)
- A platform address with a balance: [Tutorial: Create and Fund a Wallet](../../tutorials/create-and-fund-a-wallet.md)
- A configured client: [Setup SDK Client](../setup-sdk-client.md)
- A Dash Platform identity: [Tutorial: Register an Identity](../../tutorials/identities-and-names/register-an-identity.md)
- A DPNS name owned by that identity: [Tutorial: Register a Name](../../tutorials/identities-and-names/register-a-name-for-an-identity.md)

Set `NAME_LABEL` to the name without `.dash`. Set `DOCUMENT_PRICE` to the desired price in Platform
credits; the example defaults to 100,000,000 credits.

## Code

```{code-block} javascript
:caption: document-set-price.mjs

import { setupDashClient } from '../setupDashClient.mjs';

const { sdk, keyManager } = await setupDashClient();
const { identity, identityKey, signer } = await keyManager.getAuth();

// Pricing works with any document type whose contract enables `tradeMode`.
// This tutorial lists the `domain` document behind a DPNS name.
const DPNS_CONTRACT_ID = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';
const NAME_LABEL = process.env.NAME_LABEL || 'alice';

// Price in credits. A price of 0 removes the document from sale.
const PRICE = BigInt(process.env.DOCUMENT_PRICE || 100_000_000);

try {
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

  // Only the current owner can change a document's sale price
  if (document.ownerId.toString() !== identity.id.toString()) {
    throw new Error(
      `"${NAME_LABEL}.dash" is owned by ${document.ownerId}, not ${identity.id}`,
    );
  }

  document.revision = BigInt(document.revision ?? 0) + 1n;

  await sdk.documents.setPrice({
    document,
    price: PRICE,
    identityKey,
    signer,
  });

  console.log(
    PRICE === 0n
      ? `Document for "${NAME_LABEL}.dash" removed from sale.`
      : `Document for "${NAME_LABEL}.dash" listed for ${PRICE} credits.`,
  );
} catch (e) {
  console.error('Something went wrong:\n', e.message);
}
```

## What's happening

The code fetches the current DPNS document, verifies ownership, and increments its revision. It then
calls `sdk.documents.setPrice()` with a `bigint` price and the owner's signing credentials. Only the
current owner can add, change, or remove a listing.

Set `DOCUMENT_PRICE=0` and run the tutorial again to remove the document from sale. Setting a price
does not transfer ownership; another identity completes that step with the
[Purchase documents](purchase-documents.md) tutorial.

See [Name transfers and sales](../../explanations/dpns.md#name-transfers-and-sales),
[NFT transfer and trade](../../explanations/nft.md#transfer-and-trade), and the
[document update-price protocol reference](../../protocol-ref/document.md#document-update-price-transition).

:::{tip}
See this in an example app: [DashMint Lab — Set or remove a sale price](../example-apps/dashmint-lab.md#set-or-remove-a-sale-price).
:::
