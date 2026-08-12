```{eval-rst}
.. tutorials-purchase-documents:
```

# Purchase documents

In this tutorial, we will purchase a document that its owner listed for sale. The example purchases
the DPNS `domain` document behind a `.dash` name. The same API works with any document type whose
data contract enables direct purchases with `tradeMode: 1`.

## Prerequisites

- [General prerequisites](../../tutorials/introduction.md#prerequisites) (Node.js / Dash SDK installed)
- A configured client: [Setup SDK Client](../setup-sdk-client.md)
- A second identity for the buyer with enough credits to cover the price: [Tutorial: Register an Identity](../../tutorials/identities-and-names/register-an-identity.md)
- A document listed for sale by its owner: [Set a document price](set-a-document-price.md)

## Switch from the seller to the buyer

This workflow requires two identities: the **seller** lists the document with the [Set a document
price](set-a-document-price.md) tutorial, and the **buyer** purchases it with the code below.
Because the tutorials share a single client configuration, switch it to the buyer before running
this one:

1. Configure the [SDK client](../setup-sdk-client.md#code) with the **buyer's** mnemonic.
2. Run [`document-purchase.mjs`](#code).
3. Restore the SDK client's configuration to use the original mnemonic when finished with the
   tutorial.

## Code

```{code-block} javascript
:caption: document-purchase.mjs

import { setupDashClient } from '../setupDashClient.mjs';

const { sdk, keyManager } = await setupDashClient();
const { identity, identityKey, signer } = await keyManager.getAuth();

// Purchase works with any document type whose contract enables `tradeMode`.
// Here the purchased document is the `domain` behind a DPNS name.
const DPNS_CONTRACT_ID = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';
const NAME_LABEL = process.env.NAME_LABEL || 'alice';

try {
  // Fetch immediately before purchase so the revision, owner, and price are
  // current. Platform rejects the purchase if the listing changes meanwhile.
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

  // Buying your own listing is rejected by the platform
  if (document.ownerId.toString() === identity.id.toString()) {
    throw new Error(`"${NAME_LABEL}.dash" is already owned by ${identity.id}`);
  }

  // Read the native bigint directly. toJSON() cannot safely represent every
  // possible unsigned 64-bit credit value.
  const price = document.properties?.['$price'];
  if (typeof price !== 'bigint' || price <= 0n) {
    throw new Error(`Name "${NAME_LABEL}.dash" is not currently for sale`);
  }

  document.revision = BigInt(document.revision ?? 0) + 1n;

  await sdk.documents.purchase({
    document,
    buyerId: identity.id,
    price,
    identityKey,
    signer,
  });

  console.log(
    `Document for "${NAME_LABEL}.dash" purchased for ${price} credits.`,
  );
} catch (e) {
  console.error('Something went wrong:\n', e.message);
}
```

## What's happening

The buyer queries the document immediately before purchase so its revision, owner, and price are
current. The price is read directly from `document.properties['$price']` as a `bigint`; converting
the document to JSON could lose precision for unsigned 64-bit credit values. After incrementing the
revision, the code supplies that exact price to `sdk.documents.purchase()` as the buyer's agreed
price.

Platform rejects the purchase if the seller changes or removes the listing first, if the supplied
price no longer matches, or if the authenticated identity already owns the document. On success,
Platform transfers the credits and ownership atomically and clears the sale price. For DPNS names,
name resolution follows the buyer immediately.

See [Name transfers and sales](../../explanations/dpns.md#name-transfers-and-sales),
[NFT transfer and trade](../../explanations/nft.md#transfer-and-trade), and the
[document purchase protocol reference](../../protocol-ref/document.md#document-purchase-transition).

:::{tip}
See this in an example app: [DashMint Lab — Purchase a card](../example-apps/dashmint-lab.md#purchase-a-card).
:::
