# Update a data contract

Since Dash Platform v0.22, it is possible to update existing data contracts in certain backwards-compatible ways. This includes:

- Adding new documents
- Adding new optional properties to existing documents
- Adding _non-unique_ indices for properties added in the update.

In this tutorial we will update an existing data contract. 

## Prerequisites

- [General prerequisites](tutorials-introduction#prerequisites) (Node.js / Dash SDK installed)
- A wallet mnemonic with some funds in it: [Tutorial: Create and Fund a Wallet](tutorial-create-and-fund-a-wallet)
- A Dash Platform Identity: [Tutorial: Register an Identity](tutorial-register-an-identity)
- A Dash Platform Contract ID: [Tutorial: Register a Data Contract](tutorial-register-a-data-contract) 

# Code

The following example demonstrates updating an existing contract to add a new property to an existing document:

```javascript
const Dash = require('dash');

const clientOpts = {
  network: 'testnet',
  wallet: {
    mnemonic: 'a Dash wallet mnemonic with funds goes here',
    unsafeOptions: {
      skipSynchronizationBeforeHeight: 650000, // only sync from early-2022
    },    
  },
};
const client = new Dash.Client(clientOpts);

const updateContract = async () => {
  const { platform } = client;
  const identity = await platform.identities.get('an identity ID goes here');

  const existingDataContract = await platform.contracts.get('a contract ID goes here');
  const documents = existingDataContract.getDocuments();

  documents.note.properties.author = {
    type: 'string',
  };

  existingDataContract.setDocuments(documents);

  // Make sure contract passes validation checks
  const validationResult = await platform.dpp.dataContract.validate(
    existingDataContract,
  );

  if (validationResult.isValid()) {
    console.log('Validation passed, broadcasting contract..');
    // Sign and submit the data contract
    return platform.contracts.update(existingDataContract, identity);
  }
  console.error(validationResult); // An array of detailed validation errors
  throw validationResult.errors[0];
};

updateContract()
  .then((d) => console.log('Contract updated:\n', d.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());
```



> 📘 
> 
> Please refer to the [data contract reference page](reference-data-contracts) for more comprehensive details related to contracts and documents.

# What's Happening

After we initialize the Client, we retrieve an existing contract owned by our identity. We then get the contract's documents and modify a document (adding an `author` property to the `note` document in the example).The `setDocuments` method takes one argument: the object containing the updated document types.

Once the data contract has been updated, we still need to submit it to DAPI. The `platform.contracts.update` method takes a data contract and an identity parameter. Internally, it creates a State Transition containing the updated contract, signs the state transition, and submits the signed state transition to DAPI. A response will only be returned if an error is encountered.

> 📘 Wallet Operations
> 
> The JavaScript SDK does not cache wallet information. It re-syncs the entire Core chain for some wallet operations (e.g. `client.getWalletAccount()`) which can result in wait times of  5+ minutes. 
> 
> A future release will add caching so that access is much faster after the initial sync. For now, the `skipSynchronizationBeforeHeight` option can be used to sync the wallet starting at a certain block height.