# Retrieve a data contract

In this tutorial we will retrieve the data contract created in the [Register a Data Contract tutorial](tutorial-register-a-data-contract).

## Prerequisites
- [General prerequisites](tutorials-introduction#prerequisites) (Node.js / Dash SDK installed)
- A Dash Platform Contract ID: [Tutorial: Register a Data Contract](tutorial-register-a-data-contract) 

# Code

## Retrieving a data contract

```javascript
const Dash = require('dash');

const client = new Dash.Client({ network: 'testnet' });

const retrieveContract = async () => {
  const contractId = '3iaEhdyAVbmSjd59CT6SCrqPjfAfMdPTc8ksydgqSaWE';
  return client.platform.contracts.get(contractId);
};

retrieveContract()
  .then((d) => console.dir(d.toJSON(), { depth: 5 }))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());
``` 

## Updating the client app list

> 📘
>
> In many cases it may be desirable to work with a newly retrieved data contract using the `<contract name>.<contract document>` syntax (e.g. `dpns.domain`). Data contracts that were created after the client was initialized or not included in the initial client options can be added via `client.getApps().set(...)`.

```javascript
const Dash = require('dash');
const { PlatformProtocol: { Identifier } } = Dash;

const myContractId = 'a contract ID';
const client = new Dash.Client();

client.platform.contracts.get(myContractId)
  .then((myContract) => {
    client.getApps().set('myNewContract', {
      contractId: Identifier.from(myContractId),
      contract: myContract,
    });
  });
``` 

# Example Data Contract

The following example response shows a retrieved contract:

```json
{
  "protocolVersion":1,
  "$id":"G1FVmxxrnbT6CiQU7w2xgY9oMMqkkZb7vS6fkeRrSTXG",
  "$schema":"https://schema.dash.org/dpp-0-4-0/meta/data-contract",
  "version":2,
  "ownerId":"8uFQj2ptknrcwykhQbTzQatoQUyxn4VJQn1J25fxeDvk",
  "documents":{
    "note":{
      "type":"object",
      "properties":{
        "author":{
          "type":"string"
        },
        "message":{
          "type":"string"
        }
      },
      "additionalProperties":false
    }
  }
}
``` 

> 📘
>
> Please refer to the [data contract reference page](reference-data-contracts) for more comprehensive details related to contracts and documents.

# What's Happening

After we initialize the Client, we request a contract. The `platform.contracts.get` method takes a single argument: a contract ID. After the contract is retrieved, it is displayed on the console.

The second code example shows how the contract could be assigned a name to make it easily accessible without initializing an additional client.