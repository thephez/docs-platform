```{eval-rst}
.. tutorials-send-funds:
```

# Send funds

The purpose of this tutorial is to walk through the steps necessary to transfer credits from one platform address to another. Platform addresses are bech32m-encoded addresses used for Dash Platform operations.

## Prerequisites

- [General prerequisites](../tutorials/introduction.md#prerequisites) (Node.js / Dash SDK installed)
- A platform address with a balance: [Tutorial: Create and Fund a Wallet](../tutorials/create-and-fund-a-wallet.md)
- A configured client: [Setup SDK Client](./setup-sdk-client.md)

## Code

```{code-block} javascript
:caption: send-funds.mjs

import { setupDashClient } from './setupDashClient.mjs';

const { sdk, addressKeyManager } = await setupDashClient();
const signer = addressKeyManager.getSigner();

const recipient =
  process.env.RECIPIENT_PLATFORM_ADDRESS ||
  'tdash1kr2ygqnqvsms509f78t4v3uqmce2re22jqycaxh4';
const amount = 500000n; // 0.000005 DASH

try {
  const result = await sdk.addresses.transfer({
    inputs: [
      {
        address: addressKeyManager.primaryAddress.bech32m,
        amount,
      },
    ],
    outputs: [
      {
        address: recipient,
        amount,
      },
    ],
    signer,
  });
  console.log(`Transaction broadcast! Sent ${amount} credits to ${recipient}`);
  for (const [address, info] of result) {
    const addr =
      typeof address === 'string' ? address : address.toBech32m('testnet');
    console.log(`  ${addr}: ${info.balance} credits (nonce: ${info.nonce})`);
  }
} catch (e) {
  console.error('Something went wrong:\n', e.message);
}
```

## What's Happening

After we initialize the Client via `setupDashClient()`, we get a signer from the `addressKeyManager`. We then call `sdk.addresses.transfer()` with `inputs` (the sender's address and amount to debit) and `outputs` (the recipient's address and amount to credit), along with the signer.
