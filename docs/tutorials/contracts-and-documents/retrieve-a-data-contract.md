```{eval-rst}
.. tutorials-retrieve-data-contract:
```

# Retrieve a data contract

In this tutorial we will retrieve the data contract created in the [Register a Data Contract tutorial](../../tutorials/contracts-and-documents/register-a-data-contract.md).

## Prerequisites

- [General prerequisites](../../tutorials/introduction.md#prerequisites) (Node.js / Dash SDK installed)
- A configured client: [Setup SDK Client](../setup-sdk-client.md)
- A Dash Platform Contract ID: [Tutorial: Register a Data Contract](../../tutorials/contracts-and-documents/register-a-data-contract.md)

## Code

```{code-block} javascript
:caption: contract-retrieve.mjs

import { setupDashClient } from '../setupDashClient.mjs';

const { sdk } = await setupDashClient();

// Default tutorial contract (testnet). Replace or override via DATA_CONTRACT_ID.
const DATA_CONTRACT_ID =
  process.env.DATA_CONTRACT_ID ||
  'FW3DHrQiG24VqzPY4ARenMgjEPpBNuEQTZckV8hbVCG4';

try {
  const contract = await sdk.contracts.fetch(DATA_CONTRACT_ID);
  console.log('Contract retrieved:\n', contract.toJSON());
} catch (e) {
  console.error('Something went wrong:\n', e.message);
}
```

## Try it

Retrieve a contract from testnet without configuring a wallet or identity.

```{raw} html
<div class="interactive-tutorial" data-network="testnet" data-renderer="contract">
  <div class="interactive-tutorial__header">
    <strong>Retrieve a data contract from testnet</strong>
    <span class="interactive-tutorial__connection" data-role="connection">Not connected</span>
  </div>
  <label class="interactive-tutorial__label" for="contract-lookup-id">Data contract ID</label>
  <div class="interactive-tutorial__controls">
    <input id="contract-lookup-id" class="interactive-tutorial__input"
      data-param="dataContractId" data-label="a data contract ID"
      data-default-value="FW3DHrQiG24VqzPY4ARenMgjEPpBNuEQTZckV8hbVCG4"
      type="text" spellcheck="false" autocomplete="off" required>
    <button class="interactive-tutorial__button" data-role="run" type="button">Run query</button>
    <button class="interactive-tutorial__button interactive-tutorial__button--secondary" data-role="reset" type="button">Reset</button>
  </div>
  <details class="interactive-tutorial__source">
    <summary>Code being run</summary>
    <pre><code data-role="source">const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const contract = await sdk.contracts.fetch(dataContractId);
return contract?.toJSON() ?? null;</code></pre>
  </details>
  <div class="interactive-tutorial__result" data-role="result" aria-live="polite">
    <div class="interactive-tutorial__empty">Run the query to inspect the contract.</div>
  </div>
</div>
```

## Example Data Contract

The following example response shows a retrieved contract:

```json
{
  "$format_version": "1",
  "id": "FW3DHrQiG24VqzPY4ARenMgjEPpBNuEQTZckV8hbVCG4",
  "config": {
    "$format_version": "0",
    "canBeDeleted": false,
    "readonly": false,
    "keepsHistory": false,
    "documentsKeepHistoryContractDefault": false,
    "documentsMutableContractDefault": true,
    "documentsCanBeDeletedContractDefault": true,
    "requiresIdentityEncryptionBoundedKey": null,
    "requiresIdentityDecryptionBoundedKey": null
  },
  "version": 2,
  "ownerId": "CtnBVhWjGhtPihUHKS132b9f9zSKMxRHDA6wSDtjRofy",
  "schemaDefs": null,
  "documentSchemas": {
    "note": {
      "type": "object",
      "properties": ["Object"],
      "additionalProperties": false
    }
  },
  "createdAt": null,
  "updatedAt": null,
  "createdAtBlockHeight": null,
  "updatedAtBlockHeight": null,
  "createdAtEpoch": null,
  "updatedAtEpoch": null,
  "groups": {},
  "tokens": {},
  "keywords": [],
  "description": null
}
```

:::{note}
Please refer to the [data contract reference page](../../reference/data-contracts.md) for more comprehensive details related to contracts and documents.
:::

## What's Happening

After we initialize the client, we call `sdk.contracts.fetch()` with a contract ID. After the contract is retrieved, it is displayed on the console.
