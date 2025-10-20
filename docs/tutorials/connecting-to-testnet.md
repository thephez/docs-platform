```{eval-rst}
.. tutorials-connect-to-network:
```

# Connect to a network

The purpose of this tutorial is to walk through the steps necessary to access the network.

## Overview

Platform services are provided via a combination of HTTP and gRPC connections to DAPI. Although you
could interact with DAPI by connecting to these directly, the easiest approach is to use a
JavaScript SDK.

## Prerequisites

- An installation of [NodeJS v20 or higher](https://nodejs.org/en/download/)

## SDK options

Two JavaScript SDK packages are available from [npmjs.com](https://www.npmjs.com/). The [Evo
SDK](https://www.npmjs.com/package/@dashevo/evo-sdk) is taking the place of the older [Dash
SDK](https://www.npmjs.com/package/dash), although currently neither one supports all functionality.
The Evo SDK is recommended since it is newer and provides proof verification. The following table
compares the significant differences between the two:

| Feature | Evo SDK | Dash SDK |
| - | - | - |
| Platform support | Full | Partial (no NFT/token support) |
| Platform proofs | Fully validated | Unsupported |
| Identity create/topup | Limited support - requires external creation of layer 1 transactions | Supported |

## Connect via Dash SDK

### 1. Install an SDK

The Evo SDK is recommended since it supports Platform proofs and all current Platform features. SDKs
can be installed using a package manager like npm:

:::::{tab-set}
::::{tab-item} Evo SDK
:sync: evo-sdk
```shell
npm install @dashevo/evo-sdk
```
::::

::::{tab-item} Dash SDK
:sync: dash-sdk

:::{warning}
Only use this SDK if you have a use case that absolutely requires it. We recommend using the Evo SDK in most situations.
:::
```shell
# Note: This is an outdated SDK
# Although it includes wallet capabilities, it lacks support for data proofs
# and other Platform features including tokens and NFTs
npm install dash
```
::::
:::::

### 2. Connect to Dash Platform

:::::{tab-set}
::::{tab-item} Evo SDK
:sync: evo-sdk

Create a file named `evoConnect.mjs` with the following contents. Then run it by typing `node
evoConnect.mjs` from the command line:

```javascript
import { EvoSDK } from '@dashevo/evo-sdk';

(async () => {
  const sdk = EvoSDK.testnetTrusted();
  await sdk.connect();

  // Get best block hash
  const blockHash = (await sdk.system.status()).chain.latestBlockHash;
  console.log('Connected. Best block hash:\n', blockHash);
})();
```

::::

::::{tab-item} Dash SDK
:sync: dash-sdk

:::{tip}
The JavaScript Dash SDK connects to mainnet by default. To connect to other networks,
set the `network` option when instantiating the client as shown in the following example.
:::

Create a file named `dashConnect.js` with the following contents. Then run it by typing `node dashConnect.js` from the command line:

```javascript dashConnect.js
const Dash = require('dash');

const client = new Dash.Client({ network: 'testnet' });

async function connect() {
  return await client.getDAPIClient().core.getBestBlockHash();
}

connect()
  .then((d) => console.log('Connected. Best block hash:\n', d))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());
```
::::
:::::

Once this returns successfully, you're ready to begin developing! See the [Quickstart](../tutorials/introduction.md#quickstart) for recommended next steps. For details on all SDK options and methods, please refer to the [SDK documentation](../sdk-js/overview.md).

## Connect to a Devnet

The Dash SDK also supports connecting to development networks (devnets). Since devnets can be created by anyone, the client library will be unaware of them unless connection information is provided using one of the options described below.

### Connect via Seed

Using a seed node is the preferred method in most cases. The client uses the provided seed node to a retrieve a list of available masternodes on the network so requests can be spread across the entire network.

::::{tab-set}
:::{tab-item} Evo SDK
:sync: evo-sdk

```text
The Evo SDK does not currently support configuring a custom seed.
```

:::

:::{tab-item} Dash SDK
:sync: dash-sdk

```javascript
const Dash = require('dash');

const client = new Dash.Client({
  network: 'testnet',
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org:1443',
  }],
});

async function connect() {
  return await client.getDAPIClient().core.getBestBlockHash();
}

connect()
  .then((d) => console.log('Connected. Best block hash:\n', d))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());
```
:::
::::

### Connect via Address

::::{tab-set}
:::{tab-item} Evo SDK
:sync: evo-sdk

```text
The Evo SDK does not currently support connecting to a custom address list.
```

:::

:::{tab-item} Dash SDK
:sync: dash-sdk
Custom addresses may be directly specified via `dapiAddresses` in cases where it is beneficial to know exactly what node(s) are being accessed (e.g. debugging, local development, etc.).

```javascript
const Dash = require('dash');

const client = new Dash.Client({
  dapiAddresses: [
    '127.0.0.1:3000:3010',
    '127.0.0.2:3000:3010',
  ],
});

async function connect() {
  return await client.getDAPIClient().core.getBestBlockHash();
}

connect()
  .then((d) => console.log('Connected. Best block hash:\n', d))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());
```
:::
::::

## Connect Directly to DAPI (Optional)

:::{attention}
Normally, the Dash SDK, dapi-client, or another library should be used to interact with DAPI. Connecting directly may be helpful for debugging in some cases, but generally is not required.
:::

The example below demonstrates retrieving the hash of the best block hash directly from a DAPI node via command line and several languages:

::::{tab-set}
:::{tab-item} Curl
```shell
curl --request POST \
  --url https://seed-1.testnet.networks.dash.org:1443/ \
  --header 'content-type: application/json' \
  --data '{"method":"getBlockHash","id":1,"jsonrpc":"2.0","params":{"height": 100 }}'
```
:::

:::{tab-item} Python
```python
import requests

url = "https://seed-1.testnet.networks.dash.org:1443/"

payload = "{\"method\":\"getBlockHash\",\"id\":1,\"jsonrpc\":\"2.0\",\"params\":{\"height\":100}}"
headers = {'content-type': 'application/json'}

response = requests.request("POST", url, data=payload, headers=headers)

print(response.text)
```
:::

:::{tab-item} Ruby
```ruby
require 'uri'
require 'net/http'

url = URI("https://seed-1.testnet.networks.dash.org:1443/")

http = Net::HTTP.new(url.host, url.port)

request = Net::HTTP::Post.new(url)
request["content-type"] = 'application/json'
request.body = "{\"method\":\"getBlockHash\",\"id\":1,\"jsonrpc\":\"2.0\",\"params\":{\"height\":100}}"

response = http.request(request)
puts response.read_body
```
:::
::::
