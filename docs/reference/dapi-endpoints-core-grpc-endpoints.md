```{eval-rst}
.. _reference-dapi-endpoints-core-grpc:
```

# Core gRPC Endpoints

Please refer to the [gRPC Overview](../reference/dapi-endpoints-grpc-overview.md) for details regarding running the examples shown below, encoding/decoding the request/response data, and clients available for several languages.

## Endpoint Details

### broadcastTransaction

**Returns**: The transaction id (TXID) if successful  
**Parameters**:

| Name              | Type    | Required | Description                          |
| ----------------- | ------- | -------- | ------------------------------------ |
| `transaction`     | Bytes   | Yes      | A raw transaction                    |
| `allow_high_fees` | Boolean | No       | Enables bypassing the high fee check |
| `bypass_limits`   | Boolean | No       |                                      |

#### Example Request and Response

::::{tab-set}
:::{tab-item} JavaScript (dapi-client)
:sync: js-dapi-client
```javascript
const DAPIClient = require('@dashevo/dapi-client');
const { Transaction } = require('@dashevo/dashcore-lib');

const client = new DAPIClient({
  network: 'testnet',
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org',
    port: 1443,
  }],
});

// Replace the transaction hex below with your own transaction prior to running
const tx = Transaction('02000000022fd1c4583099109524b8216d712373bd837d24a502414fcadd8ae94753c3d87e010000006a47304402202cbdc560898ad389005fbe231fb345da503d838cfadab738a7d2f57bdd7ff77c02206e02b9f05c3dfb380d158949407372f26fa8ecc66956297792509c2f700723d1012103422fa857d5049000c22c3188e84557da5b783c2ef54b83a76a2933a0564c22dafeffffff07e987f3bb114c4370b937915e980657e2706135e21fbd8972a5534c804d5495000000006a473044022041a69c058035a2a8c88715c018efcb77a9ee3a08b72fd24afe8591364cee8dc002203026f115ac9c7206a985f71422ac38d451bde092d708bfb81ef35b2968f4ee34012102f0ce58f50515d04d4ff01a550a4d3246fbdc9d27031ef7d883e845b6b41f0e4efeffffff0269440f00000000001976a91465f6a3d634ba58247825c6fd55174ca72fdcdbd988ac00e1f505000000001976a9144139b147b5cef5fef5bcdb02fcdf55e426f74dbb88ac4d5b0600');

client.core.broadcastTransaction(tx.toBuffer())
  .then((response) => console.log(response));
```
:::

:::{tab-item} JavaScript (dapi-grpc)
:sync: js-dapi-gprc
```javascript
const {
  v0: {
    CorePromiseClient,
  },
} = require('@dashevo/dapi-grpc');
const { Transaction } = require('@dashevo/dashcore-lib');

const corePromiseClient = new CorePromiseClient('https://seed-1.testnet.networks.dash.org:1443');

// Replace the transaction hex below with your own transaction prior to running
const tx = Transaction('02000000022fd1c4583099109524b8216d712373bd837d24a502414fcadd8ae94753c3d87e010000006a47304402202cbdc560898ad389005fbe231fb345da503d838cfadab738a7d2f57bdd7ff77c02206e02b9f05c3dfb380d158949407372f26fa8ecc66956297792509c2f700723d1012103422fa857d5049000c22c3188e84557da5b783c2ef54b83a76a2933a0564c22dafeffffff07e987f3bb114c4370b937915e980657e2706135e21fbd8972a5534c804d5495000000006a473044022041a69c058035a2a8c88715c018efcb77a9ee3a08b72fd24afe8591364cee8dc002203026f115ac9c7206a985f71422ac38d451bde092d708bfb81ef35b2968f4ee34012102f0ce58f50515d04d4ff01a550a4d3246fbdc9d27031ef7d883e845b6b41f0e4efeffffff0269440f00000000001976a91465f6a3d634ba58247825c6fd55174ca72fdcdbd988ac00e1f505000000001976a9144139b147b5cef5fef5bcdb02fcdf55e426f74dbb88ac4d5b0600');

corePromiseClient.client.broadcastTransaction({ transaction: tx.toBuffer() })
  .then((response) => console.log(response));
```
:::
::::

::::{tab-set}
:::{tab-item} Response (JavaScript)
:sync: js-dapi-client
```json
{
  "transactionId": "552eaf24a60014edcbbb253dbc4dd68766532cab3854b44face051cedcfd578f"
}
```
:::
::::

### getBestBlockHeight

**Returns**: The height of the best block in the chain

**Parameters**: None

#### Example Request and Response

::::{tab-set}
:::{tab-item} JavaScript (dapi-client)
:sync: js-dapi-client
```javascript
const DAPIClient = require('@dashevo/dapi-client');

const client = new DAPIClient({
  network: 'testnet',
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org',
    port: 1443,
  }],
});

client.core.getBestBlockHeight()
  .then((response) => console.log(response));
```
:::

:::{tab-item} JavaScript (dapi-grpc)
:sync: js-dapi-gprc
```javascript
const {
  v0: {
    CorePromiseClient,
    GetBestBlockHeightRequest,
  },
} = require('@dashevo/dapi-grpc');

const corePromiseClient = new CorePromiseClient('https://seed-1.testnet.networks.dash.org:1443');

corePromiseClient.client.getBestBlockHeight(new GetBestBlockHeightRequest())
  .then((response) => console.log(response.height));
```
:::

:::{tab-item} Shell (gRPCurl)
:sync: grpcurl
```shell
grpcurl -proto protos/core/v0/core.proto \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/getBestBlockHeight
```
:::
::::

::::{tab-set}
:::{tab-item} Response (JavaScript)
:sync: js-dapi-client
```text
1017420
```
:::

:::{tab-item} Response (gRPCurl)
:sync: grpcurl
```json
{
  "height": 1017420
}
```
:::
::::

### getBlockchainStatus

**Returns**: Blockchain status information from the Core chain  
**Parameters**: None

#### Example Request and Response

::::{tab-set}
:::{tab-item}  JavaScript (dapi-client)
:sync: js-dapi-client
```javascript
const DAPIClient = require('@dashevo/dapi-client');

const client = new DAPIClient({
  network: 'testnet',
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org',
    port: 1443,
  }],
});

client.core.getBlockchainStatus()
  .then((response) => console.log(response));
```
:::

:::{tab-item} JavaScript (dapi-grpc)
:sync: js-dapi-gprc
```javascript
const {
  v0: {
    GetBlockchainStatusRequest,
    CorePromiseClient,
  },
} = require('@dashevo/dapi-grpc');

const corePromiseClient = new CorePromiseClient('https://seed-1.testnet.networks.dash.org:1443');

corePromiseClient.client.getBlockchainStatus(new GetBlockchainStatusRequest())
  .then((response) => console.log(response));
```
:::

:::{tab-item} Shell (gRPCurl)
:sync: grpcurl
```shell
# Run in the platform repository's `packages/dapi-grpc/` directory
grpcurl -proto protos/core/v0/core.proto \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/getBlockchainStatus
```
:::
::::

::::{tab-set}
:::{tab-item} Response (JavaScript)
:sync: js-dapi-client
```json
{
  "version": {
    "protocol": 70231,
    "software": 200101,
    "agent": "/Dash Core:20.1.1/"
  },
  "time": {
    "now": 1714510152,
    "offset": 0,
    "median": 1714509603
  },
  "status": "SYNCING",
  "syncProgress": 0.9999996959296329,
  "chain": {
    "name": "test",
    "headersCount": 1017418,
    "blocksCount": 1017418,
    "bestBlockHash": "<Buffer 00 00 00 cb 47 55 98 22 b2 e2 97 05 df 40 cf 23 f5 2a 64 88 5f 3e 8e 3b c9 4d 25 f6 83 94 79 f6>",
    "difficulty": 0.003101216201073328,
    "chainWork": "<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 03 09 28 c3 98 79 31 62>",
    "isSynced": false,
    "syncProgress": 0.9999996959296329
  },
  "network": {
    "peersCount": 130,
    "fee": {
      "relay": 0.00001,
      "incremental": 0.00001
    }
  }
}
```
:::

:::{tab-item} Response (gRPCurl)
:sync: grpcurl

Note: The gRPCurl response `bestBlockHash` and `chainWork` data is Base64 encoded.

```json
{
  "version": {
    "protocol": 70231,
    "software": 200101,
    "agent": "/Dash Core:20.1.1/"
  },
  "time": {
    "now": 1714509795,
    "median": 1714508653
  },
  "status": "SYNCING",
  "syncProgress": 0.9999993584439603,
  "chain": {
    "name": "test",
    "headersCount": 1017413,
    "blocksCount": 1017413,
    "bestBlockHash": "AAAANNAMN3b95BPomRUPbuTrgkTddEgcU/aEtc4Pobo=",
    "difficulty": 0.002658981405023059,
    "chainWork": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwkow5StfJE=",
    "syncProgress": 0.9999993584439603
  },
  "network": {
    "peersCount": 122,
    "fee": {
      "relay": 1e-05,
      "incremental": 1e-05
    }
  }
}
```
:::
::::

### getTransaction

**Returns**: A raw transaction  
**Parameters**:

| Name | Type   | Required | Description             |
| ---- | ------ | -------- | ----------------------- |
| `id` | String | Yes      | A transaction id (TXID) |

#### Example Request and Response

::::{tab-set}
:::{tab-item} JavaScript (dapi-client)
:sync: js-dapi-client
```javascript
const DAPIClient = require('@dashevo/dapi-client');

const client = new DAPIClient({
  network: 'testnet',
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org',
    port: 1443,
  }],
});

const txid = '4004d3f9f1b688f2babb1f98ea48e1472be51e29712f942fc379c6e996cdd308';
client.core.getTransaction(txid)
  .then((response) => console.dir(response, { length: 0 }));
```
:::

:::{tab-item} JavaScript (dapi-grpc)
:sync: js-dapi-gprc
```javascript
const {
  v0: {
    CorePromiseClient,
  },
} = require('@dashevo/dapi-grpc');

const corePromiseClient = new CorePromiseClient('https://seed-1.testnet.networks.dash.org:1443');

const txid = '4004d3f9f1b688f2babb1f98ea48e1472be51e29712f942fc379c6e996cdd308';

corePromiseClient.client.getTransaction({ id: txid })
  .then((response) => console.dir(response, { length: 0 }));
```
:::

:::{tab-item} Shell (gRPCurl)
:sync: grpcurl
```shell
grpcurl -proto protos/core/v0/core.proto \
  -d '{
    "id":"4004d3f9f1b688f2babb1f98ea48e1472be51e29712f942fc379c6e996cdd308"
    }' \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/getTransaction
```
:::
::::

::::{tab-set}
:::{tab-item} Response (JavaScript)
:sync: js-dapi-client
```text
GetTransactionResponse {
  transaction: Buffer(196) [Uint8Array] [
      3,   0,   5,   0,   1,   0,   0,   0,   0,   0,   0,  0,
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
      0, 255, 255, 255, 255,   6,   3, 194,  90,   6,   1,  9,
    255, 255, 255, 255,   2, 238, 252, 207,  49,   0,   0,  0,
      0,  25, 118, 169,  20, 126, 178,  93, 197, 175,  71, 45,
    107, 241, 154, 135, 122, 150, 240, 167,   7, 194, 198, 27,
    118, 136, 172, 101, 251, 183,  74,   0,   0,   0,   0, 25,
    118, 169,  20,  30,
    ... 96 more items
  ],
  blockHash: Buffer(32) [Uint8Array] [
      0,   0,   2,   9, 133, 199, 245,  83,
    191, 120, 191, 203, 109, 166,   9, 115,
    193, 152, 249,  11,   7, 245, 126,  31,
     55,  65,  10, 150, 205, 150, 131, 213
  ],
  height: 416450,
  confirmations: 386421,
  instantLocked: false,
  chainLocked: true
}
```
:::

:::{tab-item} Response (gRPCurl)
:sync: grpcurl

Note: The gRPCurl response `transaction` and `blockHash` data are Base64 encoded

```json
{
  "transaction": "AwAFAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8GA8JaBgEJ/////wLu/M8xAAAAABl2qRR+sl3Fr0cta/Gah3qW8KcHwsYbdoisZfu3SgAAAAAZdqkUHsXGbpeJxlWuBo01CItAczRf4LCIrAAAAABGAgDCWgYA3zSmucmdu7+CaY+6n4aGHySJHhbAxeiB3gNMGSIgYA1c6q3De0wxbi7HpAf4g4BgSUqhmkAxVflcQyddo+2zGA==",
  "blockHash": "AAACCYXH9VO/eL/LbaYJc8GY+QsH9X4fN0EKls2Wg9U=",
  "height": 416450,
  "confirmations": 472404,
  "isChainLocked": true
}
```
:::
::::

### subscribeToBlockHeadersWithChainLocks

This endpoint helps support simplified payment verification ([SPV](https://docs.dash.org/en/stable/docs/core/guide/operating-modes-simplified-payment-verification-spv.html)) via DAPI by providing access to block headers which can then be used to verify transactions and simplified masternode lists.

**Returns**: streams the requested block header information  
**Parameters**:

| Name                      | Type    | Required | Description                                                                                       |
| ------------------------- | ------- | -------- | ------------------------------------------------------------------------------------------------- |
| ----------                |         |          |                                                                                                   |
| **One of the following:** |         |          |                                                                                                   |
| `from_block_hash`         | Bytes   | No       | Return records beginning with the block hash provided                                             |
| `from_block_height`       | Integer | No       | Return records beginning with the block height provided                                           |
| ----------                |         |          |                                                                                                   |
| `count`                   | Integer | No       | Number of blocks to sync. If set to 0 syncing is continuously sends new data as well (default: 0) |

**Example Request and Response**

::::{tab-set}
:::{tab-item} Shell (gRPCurl)
:sync: grpcurl
```shell
grpcurl -proto protos/core/v0/core.proto \
  -d '{
  "from_block_height": 1,
  "count": 1
}' \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/subscribeToBlockHeadersWithChainLocks
```
:::
::::


::::{tab-set}
:::{tab-item} Response (gRPCurl)
:sync: grpcurl

Note: The gRPCurl response `chainlock` and `headers` data is Base64 encoded

```json
{
  "chainLock": "FZANAAJkZxaMU6888G2zlRNCD6EemlC7+OXEiGtLZJ21AAAAo7qvfeETyNxWVog47Yiyx9j9FSUCVkUWBrn0ZAfIbeU75kiccv4ilNmj1Peavv1oD+Ti9dqJYy9K8/MuDt7rYnVfmPWIUj03QYWKzQKr/PaMkavTaa+PCOrqQYxcLX/s"
}
{
  "blockHeaders": {
    "headers": [
      "AgAAACy8+DtikT1W9gXA5YGkiHKDlCjJLl63bNetlLyvCwAAfxHczhQHVSDo90zE3fCStOJuvSO42GZaGuW/xBtY/bTDqV5T//8PHvN6AAA="
    ]
  }
}
```
:::
::::

### subscribeToMasternodeList

This endpoint returns the full masternode list from the genesis block to the chain tip as the first
message and then streams masternode list updates with every new block.

**Returns**: Streams the requested masternode list updates

**Parameters**: None

#### Example Request and Response

::::{tab-set}
:::{tab-item} Shell (gRPCurl)
:sync: grpcurl
```shell
grpcurl -proto protos/core/v0/core.proto \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/subscribeToMasternodeList
```
:::
::::

::::{tab-set}
:::{tab-item} Response (gRPCurl)
:sync: grpcurl

Note: The gRPCurl response `masternodeListDiff` data is Base64 encoded. This example shows one of
the update messages following a new block.

```json
{
  "masternodeListDiff": "rGhuVmVyc2lvbgFtYmFzZUJsb2NrSGFzaHhAMDAwMDAwYmQ4OGRmYmIxYmVlNmYwNjNlYTUwZTE3MjEzYjU3M2NlMWEwZmQ4ZTU4YjY4ZWYyNDc3YWQ1ODhiOWlibG9ja0hhc2h4QDAwMDAwMTA3YmVkZGJiMjg0MWM1NzAxZmYzOWMwYjBiNWUwOGEzZTlmODFlY2MwZDk3MzVjNDhkNzRlZTE0YmVuY2JUeE1lcmtsZVRyZWV4TjAxMDAwMDAwMDFiOGNiMzBkMGRmZTYyNWJiOGQwN2QzMWMwNWQyNzI5Y2NlNjZjODNjMzJmMmRmZjJhZWRiZDIwOGIyYzMzNWUyMDEwMWRjYlR4eQJuMDMwMDA1MDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBmZmZmZmZmZjA2MDM2YzhiMTAwMTAxZmZmZmZmZmYwMzdhNjgxZDA0MDAwMDAwMDAxOTc2YTkxNGM2OWEwYmRhN2RhYWFlNDgxYmU4ZGVmOTVlNWYzNDdhMWQwMGE0YjQ4OGFjODgxNWExMDQwMDAwMDAwMDAxNmFlNTIzYjcwNzAwMDAwMDAwMTk3NmE5MTQ2NGYyYjJiODRmNjJkNjhhMmNkN2Y3ZjVmYjJiNWFhNzVlZjcxNmQ3ODhhYzAwMDAwMDAwYWYwMzAwNmM4YjEwMDAxYzQxMWMzODk2YzAwNzIwZDkzYmViZDNmYzJkOTRkZjk4NTJjYmE5ZDVmYzVjNTk0MDE1NjZlM2MzYjVkNjIwZjhiYjE0MjIwMWM2MjFlYWRhMjliNTgyNjE4YmZiNzc4MTRiYTdjMzQzOGNjZjdkOWU0MTIyOTg5NWU1MzJkMjAwOGMyZTRhZTA1ZDU1NGNmYmVkNjllMWJjNjZmZmRkZDgwZTIwZDk4NmU0ODUzOGM2NjViM2QyN2IxZjM1NDJiM2VjOGJiNTMyNDlmZjI5NmNlNzYxMzc5Y2Y0MGZiNWQyMDJmYzdlZjIxYmEzNmE5MWQ0MWEwZmZiNDk0Y2Y3OTUwNTY5N2ZkMDllNmZjZWNhNzNiYWRmYjI2OWI2NjkwOGU0ZmZiNjExZDZkZjc3MzlkY2JkNTUwYjdlMzYyYmQ0MDY0ZjBhOWI5ODAxMDAwMGpkZWxldGVkTU5zgGZtbkxpc3SAbmRlbGV0ZWRRdW9ydW1zgGpuZXdRdW9ydW1zgHBtZXJrbGVSb290TU5MaXN0eEAyMGQ2YjVjM2UzNjYxNTQwNTk1Y2ZjZDVhOWNiNTI5OGRmOTQyZGZjZDNlYjNiZDkyMDA3YzA5NjM4MWM0MTFjcW1lcmtsZVJvb3RRdW9ydW1zeEBkMjMyZTU5NTk4MjI0MTllN2RjZjhjNDNjM2E3NGI4MTc3ZmI4YjYxODJiNTI5ZGFlYTIxYzYwMTIyMTRiYmY4bXF1b3J1bXNDTFNpZ3OA"
}
```
:::
::::

### subscribeToTransactionsWithProofs

**Returns**: streams the requested transaction information  
**Parameters**:

| Name                         | Type    | Required | Description                                                                                              |
| ---------------------------- | ------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `bloom_filter.v_data`        | Bytes   | Yes      | The filter itself is simply a bit field of arbitrary byte-aligned size. The maximum size is 36,000 bytes |
| `bloom_filter.n_hash_funcs`  | Integer | Yes      | The number of hash functions to use in this filter. The maximum value allowed in this field is 50        |
| `bloom_filter.n_tweak`       | Integer | Yes      | A random value to add to the seed value in the hash function used by the bloom filter                    |
| `bloom_filter.n_flags`       | Integer | Yes      | A set of flags that control how matched items are added to the filter                                    |
| ----------                   |         |          |                                                                                                          |
| **One of the following:**    |         |          |                                                                                                          |
| `from_block_hash`            | Bytes   | No       | Return records beginning with the block hash provided                                                    |
| `from_block_height`          | Integer | No       | Return records beginning with the block height provided                                                  |
| ----------                   |         |          |                                                                                                          |
| `count`                      | Integer | No       | Number of blocks to sync. If set to 0, syncing continuously sends new data as well (default: 0)        |
| `send_transaction_hashes` \* | Boolean | No       |                                                                                                          |

**Example Request and Response**

:::{note}
Set `count` to 0 to continuously stream new data.
:::

::::{tab-set}
:::{tab-item} JavaScript (dapi-client)
:sync: js-dapi-client
```javascript
const DAPIClient = require('@dashevo/dapi-client');

(async () => {
  const client = new DAPIClient({
    network: 'testnet',
    seeds: [{
      host: 'seed-1.testnet.networks.dash.org',
      port: 1443,
    }],
  });

  const bloomFilter = {
    vData: [0xff],
    nHashFuncs: 1,
    nTweak: 0,
    nFlags: 0,
  };

  const stream = await client.core.subscribeToTransactionsWithProofs(
    bloomFilter,
    {
      fromBlockHeight: 1232900,
      count: 0, // 0 = continuosly stream new data too
    },
  );

  stream.on('data', (response) => {
    // If it's a protobufjs object, convert it
    if (typeof response.toObject === 'function') {
      response = response.toObject();
    }

    if (response.rawTransactions) {
      const rawTxs = response.rawTransactions.transactionsList || [];
      console.log(`Received ${rawTxs.length} raw transaction(s)`);
      rawTxs.forEach((tx, i) => console.log(`\tTX #${i + 1}:`, Buffer.from(tx, 'base64').toString('hex')));
    } else if (response.rawMerkleBlock) {
      console.log(' Received Merkle block:', Buffer.from(response.rawMerkleBlock, 'base64').toString('hex'));
    } else if (response.instantSendLockMessages) {
      const locks = response.instantSendLockMessages.messagesList || [];
      console.log(`Received ${locks.length} InstantSend lock message(s)`);
      locks.forEach((msg, i) => console.log(`\tInstantSend Lock #${i + 1}:`, Buffer.from(msg, 'base64').toString('hex')));
    } else {
      console.log('Warning: unknown or empty response message:', response);
    }
  });

  stream.on('error', (err) => console.error('Stream error:', err));
  stream.on('end', () => console.log('Stream ended'));
  stream.on('close', () => console.log('Stream closed'));
})();
```
:::
:::{tab-item} Request (gRPCurl)
:sync: grpcurl
```shell
grpcurl -proto protos/core/v0/core.proto \
  -d '{
  "from_block_height": 1232900,
  "count": 0,
  "bloom_filter": {
    "n_hash_funcs": 11,
    "v_data": "",
    "n_tweak": 0,
    "n_flags": 0
  }
}' \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/subscribeToTransactionsWithProofs
```
:::
::::

::::{tab-set}
:::{tab-item} Response (JavaScript)
:sync: js-dapi-client
```text
Received Merkle block: 00000020384e6d494ba7ac426fe3f2bc990b1a1d46102ac0fc24e86a462653f32e0000002b848697ba771189baf8031fe52a4ef9b69d4259599104744271f53c4b3b3403895cfe67f4bb011ee0200f000200000002c0f0c91ad505b883996cc351e63976a7b0234d13547a8f7ace3c5776d051091f1a8e035c7f667bc21ad277ff50e25c11a99fc5e71a6f6ef5e96e720c4c9f47c40107
Received 1 raw transaction(s)
        TX #1: 020000000202b72745ae5d7a8a2ef7b02f37e921d479cf3a27a899bc9fefbdc4a9558db344000000006a4730440220732d3a959630dc7b21bbf5c54d2968f0d72db922ad3556a004d63da064e68bf3022026423cabb47bb2a90cee7667f3d2bc53d2bbed56c8ac4001fc542ce4e77cee5a01210299b5e857403e74ef789dcfec66db750212f97d3282005df161a4f77370bc9a41feffffff345fbdad892f72f9a03d0bca6999d3dd9b310cf029816c19968d0ec59ae90caa000000006a47304402207bef35c51926e2a8f6c04ac3db701973f5188f1a9bfcacecac97d5a9c368804102206e9a30f4bb78581ec453ce9a3dbfe6dbd2286a9d80111873138d2391b764cbf001210315c295b58ade2af42ba53e17bfc0224e855f3f6d71c80b698d18a6084f74da25feffffff0240420f00000000001976a9146c503d4a6c85d349153f354a03bc77b50910ed6688ac710c2c00000000001976a914e7bd063a8420b439f4131dd90c305fbe20b5f80388ac52d01200
Received 1 InstantSend lock message(s)
        InstantSend Lock #1: 010202b72745ae5d7a8a2ef7b02f37e921d479cf3a27a899bc9fefbdc4a9558db34400000000345fbdad892f72f9a03d0bca6999d3dd9b310cf029816c19968d0ec59ae90caa00000000ca0921f521075ca588738264440890ee3734246ee73c32990a6b9ca41c53ff9941e8984fdf68edb10a39140e045580bc19a871d6c62c624588fad31f1c0000008028345007268bcd091b39c6da8609e60817beb137b5a5a4335ace2b86661a570ee9cfb9a400c35c2ce5471a8edc33ae04d822dccb59d40135c975dbf0246261fcf2def2aa10d73d32592cb0f320edf06e66d012fe5b96335766bfb4e203fbbd
```
:::
:::{tab-item} Response (gRPCurl)
:sync: grpcurl

Note: The gRPCurl response `transactions` and `rawMerkleBlock` data is Base64 encoded

```json
{
  "rawTransactions": {
    "transactions": [
      "AwAFAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8GAybQEgEB/////wN0aR0EAAAAABl2qRTGmgvafaquSBvo3vleXzR6HQCktIisiBWhBAAAAAABatMmtwcAAAAAGXapFMaaC9p9qq5IG+je+V5fNHodAKS0iKwAAAAArwMAJtASAI9++NlWNSgVfoN30b0i6+0MJU6HoUW8um8+Z4wnNN6ryzPggHZKesGiP7BSqWS2GJyNyoDKExUBb8JOo4SnWiwAiS4d6Qfq46Q5P7Ikc5FU1veS1BSOjANjy/TMxSW41lIimTJeC7uTelTgKUQRGuvGBpISS6JTaKe9EAyVssguGF6pkfGIrPXhSmnFYa6zVZOw+FImDqXAWuiA4fbrg++XnRFN+xAMAAA=",
      "AwAIAAGfo1ucb0QXQcszv3goPfj2HQ7hXy1H/UfV4sJxbRAelwEAAABqRzBEAiBHbuT42FzrisDUwTDWNZOwUzpeVqZD/4d63GqQtfazRAIgQ0D3R7zwdGggf6aV5+zn5Ny++EicUxy9JyTlfcmTWY4BIQL92QF9a831X8s6DQOxwj9gbvIRpKyXueTh+8F0mOo5p/////8CQEIPAAAAAAACagBHZZEHAAAAABl2qRTPU/9NqtGCTtqRtTv4GHut2FoTO4isAAAAACQBAUBCDwAAAAAAGXapFN4Kl0QKTPQeGVBUWowbrllp8NipiKw="
    ]
  }
}
{
  "rawMerkleBlock": "AAAAIDhObUlLp6xCb+PyvJkLGh1GECrA/CToakYmU/MuAAAAK4SGl7p3EYm6+AMf5SpO+badQllZkQR0QnH1PEs7NAOJXP5n9LsBHuAgDwACAAAAAsDwyRrVBbiDmWzDUeY5dqewI00TVHqPes48V3bQUQkfGo4DXH9me8Ia0nf/UOJcEamfxecab2716W5yDEyfR8QBBw=="
}
```
:::
::::

```{eval-rst}
..
  Commented out info
  [block:html]
  {
    "html": "<div></div>\n<!--\n\ngrpcurl -proto protos/transactions_filter_stream.proto -plaintext   -d '{\n  \"from_block_height\": 30000,\n  \"count\": 1,\n  \"bloom_filter\": {\n    \"n_hash_funcs\": 11,\n    \"v_data\": \"\",\n    \"n_tweak\": 0,\n    \"n_flags\": 0\n  }\n}'   localhost:2510   org.dash.platform.dapi.v0.TransactionsFilterStream/subscribeToTransactionsWithProofs\n{\n  \"rawTransactions\": {\n    \"transactions\": [\n      \"AwAFAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8FAjB1AQj/////AkAjDkMAAAAAGXapFBa5OjuRaKIGBcw82mL2E1o7qlMaiKxAIw5DAAAAABl2qRQWuTo7kWiiBgXMPNpi9hNaO6pTGoisAAAAAEYCADB1AAAPwA0VGVVRQSZSW013DrT+TU+AhULKbLNg+/rtgnzE5lca9JYY2DC/1hyqelAuIkJqqcby0zIroYyfLzuhjNso\"\n    ]\n  }\n}\n{\n  \"rawMerkleBlock\": \"AAAAIIGiClhX7zPY2s2DmwiDdlbUJSUpzBjclOIWcgggAwAAak7QtEqCigCc1+U3+R6ElSI/vQz4mXzn1bADpwg41MvxNjxeBaADHhuWAAACAAAAAi6VQ1ZA+oFPPtKYv7OuzUfdLqZ+ZwzAwpztIn0osooZAzrYFIkcfvpIDK6Mg9FgxH4eOkjvyMwXj6qwEqZCJPYBAw==\"\n}\n{\n  \"rawTransactions\": {\n    \"transactions\": [\n      \"AwAFAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8FAjF1AQH/////AkAjDkMAAAAAGXapFBa5OjuRaKIGBcw82mL2E1o7qlMaiKxAIw5DAAAAABl2qRQWuTo7kWiiBgXMPNpi9hNaO6pTGoisAAAAAEYCADF1AAAPwA0VGVVRQSZSW013DrT+TU+AhULKbLNg+/rtgnzE5lca9JYY2DC/1hyqelAuIkJqqcby0zIroYyfLzuhjNso\"\n    ]\n  }\n}\n{\n  \"rawMerkleBlock\": \"AAAAIKnRSfNm6oA5kqly1SG3FJ0a/v3hAh9GrFtyApQ+AQAAx/bTc5j8Ctlx0exLl3Xn+GvymqZBllMPdX5f5TuPsFjkNzxepXsDHoBCAAABAAAAAcf203OY/ArZcdHsS5d15/hr8pqmQZZTD3V+X+U7j7BYAQE=\"\n}\n{\n  \"rawTransactions\": {\n    \"transactions\": [\n      \"AwAFAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8FAjJ1AQT/////AkAjDkMAAAAAGXapFBa5OjuRaKIGBcw82mL2E1o7qlMaiKxAIw5DAAAAABl2qRQWuTo7kWiiBgXMPNpi9hNaO6pTGoisAAAAAEYCADJ1AAAPwA0VGVVRQSZSW013DrT+TU+AhULKbLNg+/rtgnzE5lca9JYY2DC/1hyqelAuIkJqqcby0zIroYyfLzuhjNso\"\n    ]\n  }\n}\n\n\n-->\n\n<style></style>"
  }
  [/block]
```

## Disabled Endpoints

The following endpoints are disabled for the initial Dash Platform release until their performance
and security are more thoroughly evaluated.

### getBlock

:::{attention}
This endpoint is currently disabled until its security and performance are evaluated.
:::

**Returns**: A raw block  
**Parameters**:

| Name                      | Type    | Required | Description                                         |
| ------------------------- | ------- | -------- | --------------------------------------------------- |
| **One of the following:** |         |          |                                                     |
| `hash`                    | Bytes   | No       | Return the block matching the block hash provided   |
| `height`                  | Integer | No       | Return the block matching the block height provided |

#### Example Request and Response

::::{tab-set}
:::{tab-item} JavaScript (dapi-client)
:sync: js-dapi-client
```javascript
const DAPIClient = require('@dashevo/dapi-client');

const client = new DAPIClient({
  network: 'testnet',
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org',
    port: 1443,
  }],
});

client.core.getBlockByHeight(1)
  .then((response) => console.log(response.toString('hex')));
```
:::

:::{tab-item} JavaScript (dapi-grpc)
:sync: js-dapi-gprc
```javascript
const {
  v0: {
    CorePromiseClient,
  },
} = require('@dashevo/dapi-grpc');

const corePromiseClient = new CorePromiseClient('https://seed-1.testnet.networks.dash.org:1443');

corePromiseClient.client.getBlock({ height: 1 })
  .then((response) => console.log(response.block.toString('hex')));
```
:::

:::{tab-item} JavaScript (dapi-grpc)
```javascript
const {
  v0: {
    CorePromiseClient,
  },
} = require('@dashevo/dapi-grpc');

const corePromiseClient = new CorePromiseClient('https://seed-1.testnet.networks.dash.org:1443');

corePromiseClient.client.getBlock({
  hash: '0000047d24635e347be3aaaeb66c26be94901a2f962feccd4f95090191f208c1',
}).then((response) => {
  console.log(response.block.toString('hex'));
});
```
:::

:::{tab-item} Shell (gRPCurl)
:sync: grpcurl
```shell
grpcurl -proto protos/core/v0/core.proto \
  -d '{
    "height":1
    }' \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/getBlock
```
:::
::::

::::{tab-set}
:::{tab-item} Response (JavaScript)
:sync: js-dapi-client
```shell
020000002cbcf83b62913d56f605c0e581a48872839428c92e5eb76cd7ad94bcaf0b00007f11dcce14075520e8f74cc4ddf092b4e26ebd23b8d8665a1ae5bfc41b58fdb4c3a95e53ffff0f1ef37a00000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0a510101062f503253482fffffffff0100743ba40b0000002321020131f38ae3eb0714531dbfc3f45491b4131d1211e3777177636388bb5a74c3e4ac00000000
```
:::

:::{tab-item} Response (gRPCurl)
:sync: grpcurl

Note: The gRPCurl response `block` data is Base64 encoded

```json
{
  "block": "AgAAACy8+DtikT1W9gXA5YGkiHKDlCjJLl63bNetlLyvCwAAfxHczhQHVSDo90zE3fCStOJuvSO42GZaGuW/xBtY/bTDqV5T//8PHvN6AAABAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8KUQEBBi9QMlNIL/////8BAHQ7pAsAAAAjIQIBMfOK4+sHFFMdv8P0VJG0Ex0SEeN3cXdjY4i7WnTD5KwAAAAA"
}
```
:::
::::

### getMasternodeStatus

:::{attention}
This endpoint is currently disabled until its security and performance are evaluated.
:::

**Returns**: Masternode status information from the Core chain  
**Parameters**: None

#### Example Request and Response

::::{tab-set}
:::{tab-item}  JavaScript (dapi-client)
:sync: js-dapi-client
```javascript
const DAPIClient = require('@dashevo/dapi-client');

const client = new DAPIClient({
  network: 'testnet',
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org',
    port: 1443,
  }],
});

client.core.getMasternodeStatus()
  .then((response) => console.log(response));
```
:::

:::{tab-item} JavaScript (dapi-grpc)
:sync: js-dapi-gprc
```javascript
const {
  v0: {
    GetMasternodeStatusRequest,
    CorePromiseClient,
  },
} = require('@dashevo/dapi-grpc');

const corePromiseClient = new CorePromiseClient('https://seed-1.testnet.networks.dash.org:1443');

corePromiseClient.client.getMasternodeStatus(new GetMasternodeStatusRequest())
  .then((response) => console.log(response));
```
:::

:::{tab-item} Shell (gRPCurl)
:sync: grpcurl
```shell
# Run in the platform repository's `packages/dapi-grpc/` directory
grpcurl -proto protos/core/v0/core.proto \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/getMasternodeStatus
```
:::
::::

::::{tab-set}
:::{tab-item} Response (JavaScript)
:sync: js-dapi-client
```json
{
  "status": "READY",
  "proTxHash": "<Buffer 85 f1 5a 31 d3 83 82 93 a9 c1 d7 2a 1a 0f a2 1e 66 11 0c e2 08 78 bd 4c 10 24 c4 ae 1d 5b e8 24>",
  "posePenalty": 0,
  "isSynced": true,
  "syncProgress": 1
}
```
:::

:::{tab-item} Response (gRPCurl)
:sync: grpcurl

Note: The gRPCurl response `proTxHash` data is Base64 encoded.

```json
{
  "status": "READY",
  "proTxHash": "LkhlGi6cDLTy+3q4dAYapK8M0otZaVYx5qNa85UO9vs=",
  "isSynced": true,
  "syncProgress": 1
}
```
:::
::::

## Deprecated Endpoints

The following endpoints were recently deprecated. See the [previous version of documentation](https://docs.dash.org/projects/platform/en/1.0.0/docs/reference/dapi-endpoints-core-grpc-endpoints.html) for additional information on these endpoints.

### getStatus

:::{attention}
Deprecated in Dash Platform v1.0.0
:::

**Returns**: Status information from the Core chain  
**Parameters**: None

#### Example Request and Response

::::{tab-set}
:::{tab-item}  JavaScript (dapi-client)
:sync: js-dapi-client
```javascript
const DAPIClient = require('@dashevo/dapi-client');

const client = new DAPIClient({
  network: 'testnet',
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org',
    port: 1443,
  }],
});

client.core.getStatus()
  .then((response) => console.log(response));
```
:::

:::{tab-item} JavaScript (dapi-grpc)
:sync: js-dapi-gprc
```javascript
const {
  v0: {
    GetStatusRequest,
    CorePromiseClient,
  },
} = require('@dashevo/dapi-grpc');

const corePromiseClient = new CorePromiseClient('https://seed-1.testnet.networks.dash.org:1443');

corePromiseClient.client.getStatus(new GetStatusRequest())
  .then((response) => console.log(response));
```
:::

:::{tab-item} Shell (gRPCurl)
:sync: grpcurl
```shell
# Run in the platform repository's `packages/dapi-grpc/` directory
grpcurl -proto protos/core/v0/core.proto \
  seed-1.testnet.networks.dash.org:1443 \
  org.dash.platform.dapi.v0.Core/getStatus
```
:::
::::

::::{tab-set}
:::{tab-item} Response (JavaScript)
:sync: js-dapi-client
```json
// 
{
  "version":{
    "protocol":70227,
    "software":190100,
    "agent":"/Dash Core:19.1.0(dcg-masternode-27)/"
  },
  "time":{
    "now":1684860969,
    "offset":0,
    "median":1684860246
  },
  "status":"READY",
  "syncProgress":0.9999992137956843,
  "chain":{
    "name":"test",
    "headersCount":892412,
    "blocksCount":892412,
    "bestBlockHash":"<Buffer 00 00 00 96 7b 75 05 9c ad ff 07 71 89 74 1b 0a 8f f1 77 62 1d 3e 6e 45 e9 32 02 55 19 fe df a9>",
    "difficulty":0.003254173843543036,
    "chainWork":"<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 02 d6 8d 0c 89 2a 87 47>",
    "isSynced":true,
    "syncProgress":0.9999992137956843
  },
  "masternode":{
    "status":"READY",
    "proTxHash":"<Buffer 3b 27 b5 ea 14 6a d9 d1 ff 6b c7 14 7e f2 5e f7 33 01 df 98 cc 2c 77 23 67 3c 3a 0f 39 fd b0 7a>",
    "posePenalty":0,
    "isSynced":true,
    "syncProgress":1
  },
  "network":{
    "peersCount":145,
    "fee":{
      "relay":0.00001,
      "incremental":0.00001
    }
  }
}
```
:::

:::{tab-item} Response (gRPCurl)
:sync: grpcurl

Note: The gRPCurl response `bestBlockHash`, `chainWork`, and `proTxHash` data is Base64 encoded.

```json
{
  "version": {
    "protocol": 70227,
    "software": 190000,
    "agent": "/Dash Core:19.0.0/"
  },
  "time": {
    "now": 1684357132,
    "median": 1684356285
  },
  "status": "READY",
  "syncProgress": 0.9999996650927735,
  "chain": {
    "name": "test",
    "headersCount": 888853,
    "blocksCount": 888853,
    "bestBlockHash": "AAAAtZ1kS2uIxOX4u1CaHqEPQhOVs23wPK9TjBZnZAI=",
    "difficulty": 0.003153826459898978,
    "chainWork": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtaNAXYoQDE=",
    "isSynced": true,
    "syncProgress": 0.9999996650927735
  },
  "masternode": {
    "status": "READY",
    "proTxHash": "vcAa/9GeHoyawgatmvVCbavRGA3uUtnDigwp7EqRyn0=",
    "isSynced": true,
    "syncProgress": 1
  },
  "network": {
    "peersCount": 147,
    "fee": {
      "relay": 1e-05,
      "incremental": 1e-05
    }
  }
}
```
:::
::::

## Code Reference

Implementation details related to the information on this page can be found in:

- The [Platform repository](https://github.com/dashpay/platform/tree/master/packages/dapi) `packages/dapi/lib/grpcServer/handlers/core` folder
- The [Platform repository](https://github.com/dashpay/platform/tree/master/packages/dapi-grpc) `packages/dapi-grpc/protos/core` folder
