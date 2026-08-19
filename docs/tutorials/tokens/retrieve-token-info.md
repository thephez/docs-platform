```{eval-rst}
.. tutorials-retrieve-token-info:
```

# Retrieve token info

The purpose of this tutorial is to walk through the steps necessary to retrieve information about a [token](../../explanations/tokens.md), including its contract details, total supply, status, and identity balances.

## Overview

Once a token contract is registered, its metadata and balances can be queried without submitting a state transition. This tutorial retrieves the token's contract info, total supply, status, and the token balances held by two identities. Additional details are available in the [tokens explanation](../../explanations/tokens.md) and the [token protocol reference](../../protocol-ref/token.md).

## Prerequisites

- [General prerequisites](../../tutorials/introduction.md#prerequisites) (Node.js / Dash SDK installed)
- A configured client: [Setup SDK Client](../setup-sdk-client.md)
- A registered token contract: [Tutorial: Register a token contract](register-a-token-contract.md). Set the resulting contract ID as the `TOKEN_CONTRACT_ID` environment variable.

## Code

```{code-block} javascript
:caption: token-info.mjs

import { setupDashClient } from '../setupDashClient.mjs';

const { sdk, keyManager } = await setupDashClient();

// TOKEN_CONTRACT_ID comes from token-register.mjs.
const dataContractId = process.env.TOKEN_CONTRACT_ID;
const tokenPosition = 0;

// Default recipient (testnet). Replace or override via RECIPIENT_ID.
const recipientId =
  process.env.RECIPIENT_ID || '7XcruVSsGQVSgTcmPewaE4tXLutnW1F6PXxwMbo8GYQC';

try {
  if (!dataContractId) {
    throw new Error(
      'Set TOKEN_CONTRACT_ID in .env from token-register.mjs output.',
    );
  }

  const tokenId = await sdk.tokens.calculateId(dataContractId, tokenPosition);
  const contractInfo = await sdk.tokens.contractInfo(tokenId);
  const totalSupply = await sdk.tokens.totalSupply(tokenId);
  const statuses = await sdk.tokens.statuses([tokenId]);
  const identityBalances = await sdk.tokens.identityBalances(
    keyManager.identityId,
    [tokenId],
  );
  const recipientBalances = await sdk.tokens.identityBalances(recipientId, [
    tokenId,
  ]);

  // A token only has a status record once one is published on-chain (e.g. via
  // an emergency pause), so the Map is empty for a freshly registered token.
  const status = statuses.get(tokenId);

  console.log('Token ID:', tokenId);
  console.log('Token contract info:\n', contractInfo?.toJSON());
  console.log(
    'Token status:',
    status ? status.isPaused : '(no status published)',
  );
  console.log('Total token supply:', totalSupply?.totalSupply ?? 0n);
  console.log(`Identity token balance: ${identityBalances.get(tokenId) ?? 0n}`);
  console.log(
    `Recipient token balance: ${recipientBalances.get(tokenId) ?? 0n}`,
  );
} catch (e) {
  console.error('Something went wrong:\n', e.message);
}
```

```{raw} html
<div class="interactive-tutorial interactive-tutorial--integrated" data-operation="token-info" data-network="testnet" data-renderer="token">
  <div class="interactive-tutorial__toolbar">
    <strong>Run this example on testnet</strong>
    <span class="interactive-tutorial__connection" data-role="connection"></span>
  </div>
  <div class="interactive-tutorial__controls">
    <div class="interactive-tutorial__field interactive-tutorial__field--wide">
      <label class="interactive-tutorial__label" for="token-contract-id">Token contract ID</label>
      <input id="token-contract-id" class="interactive-tutorial__input"
        data-param="dataContractId" data-label="a token contract ID"
        data-default-value="CWmut7sha5Eweckmr7ouiXWCm3x2H5a2cXRFG7yJzjFw"
        type="text" spellcheck="false" autocomplete="off" required>
    </div>
    <div class="interactive-tutorial__field interactive-tutorial__field--small">
      <label class="interactive-tutorial__label" for="token-position">Position</label>
      <input id="token-position" class="interactive-tutorial__input"
        data-param="tokenPosition" data-label="a token position" data-default-value="0"
        type="number" min="0" max="65535" required>
    </div>
  </div>
  <div class="interactive-tutorial__controls interactive-tutorial__controls--secondary">
    <div class="interactive-tutorial__field">
      <label class="interactive-tutorial__label" for="token-identity-id">Identity ID</label>
      <input id="token-identity-id" class="interactive-tutorial__input"
        data-param="identityId" data-label="an identity ID"
        data-default-value="FKZZFDTfGdSWUmL2g7H9e46pMJMPQp9DHQcvjrsS6884"
        type="text" spellcheck="false" autocomplete="off" required>
    </div>
    <div class="interactive-tutorial__field">
      <label class="interactive-tutorial__label" for="token-recipient-id">Recipient ID</label>
      <input id="token-recipient-id" class="interactive-tutorial__input"
        data-param="recipientId" data-label="a recipient identity ID"
        data-default-value="7XcruVSsGQVSgTcmPewaE4tXLutnW1F6PXxwMbo8GYQC"
        type="text" spellcheck="false" autocomplete="off" required>
    </div>
  </div>
  <div class="interactive-tutorial__actions">
    <button class="interactive-tutorial__button" data-role="run" type="button">Run query</button>
    <button class="interactive-tutorial__button interactive-tutorial__button--text" data-role="reset" type="button">Reset</button>
  </div>
  <details class="interactive-tutorial__source">
    <summary>View browser code</summary>
    <pre><code data-role="source"></code></pre>
  </details>
  <div class="interactive-tutorial__result" data-role="result" aria-live="polite">
    <div class="interactive-tutorial__empty">Run the query to inspect token information and balances.</div>
  </div>
</div>
```

## What's Happening

After connecting to the client, we derive the token ID from the contract ID and token position with `sdk.tokens.calculateId()`. We then query several pieces of information:

- `sdk.tokens.contractInfo()` returns the token's contract metadata.
- `sdk.tokens.totalSupply()` returns the number of tokens currently in circulation.
- `sdk.tokens.statuses()` returns a Map of token statuses. A status record only exists once one is published on-chain (for example, after an emergency pause), so the Map is empty for a freshly registered token. We fall back to `(no status published)` in that case.
- `sdk.tokens.identityBalances()` returns each identity's token balance, keyed by token ID.

The recipient defaults to a demo testnet identity so the script can run without extra setup. Set `RECIPIENT_ID` in the .env file to your own second identity when you want the recipient balance check to reflect an identity you control.

:::{tip}
See this in an example app: [DashMint Lab — DashMint token flow](../example-apps/dashmint-lab.md#dashmint-token-flow) reads the signed-in identity's token balance to display remaining mint capacity.
:::
