```{eval-rst}
.. _reference-dapi-endpoints:
```

# DAPI Endpoints

[DAPI](../explanations/dapi.md) currently provides 2 types of endpoints:
[JSON-RPC](https://www.jsonrpc.org/) and [gRPC](https://grpc.io/docs/guides/). The JSON-RPC
endpoints expose some layer 1 information while the gRPC endpoints support layer 2 as well as
streaming of events related to blocks and transactions/transitions.

## JSON-RPC Endpoints

| Layer | Endpoint | Description |
| :---: | -------- | ----------- |
|   1   | [`getBestBlockHash`](../reference/dapi-endpoints-json-rpc-endpoints.md#getbestblockhash) | Returns block hash of the chaintip |
|   1   | [`getBlockHash`](../reference/dapi-endpoints-json-rpc-endpoints.md#getblockhash)         | Returns block hash of the requested block |
|   1   | [`getMnListDiff`](../reference/dapi-endpoints-json-rpc-endpoints.md#getmnlistdiff)       | Returns masternode list diff for the provided block hashes |

## gRPC Endpoints

### Core gRPC Service

| Layer | Endpoint |   |
| :---: | -------- | - |
|   1   | [`broadcastTransaction`](../reference/dapi-endpoints-core-grpc-endpoints.md#broadcasttransaction) | Broadcasts the provided transaction |
|   1   | [`getBlock`](../reference/dapi-endpoints-core-grpc-endpoints.md#getblock) | Returns information for the requested block |
|   1   | [`getBlockchainStatus`](../reference/dapi-endpoints-core-grpc-endpoints.md#getblockchainstatus) | Returns blockchain status information<br>**Added in Dash Platform v1.0.0-dev.12** |
|   1   | [`getMasternodeStatus`](../reference/dapi-endpoints-core-grpc-endpoints.md#getmasternodestatus) | Returns masternode status information <br>**Added in Dash Platform v1.0.0-dev.12**|
|   1   | `getStatus` | **Removed in Dash Platform v1.0.0-dev.12**<br>Split into [`getBlockchainStatus`](../reference/dapi-endpoints-core-grpc-endpoints.md#getblockchainstatus) and [`getMasternodeStatus`](../reference/dapi-endpoints-core-grpc-endpoints.md#getmasternodestatus).<br>Returns blockchain status information |
|   1   | [`getTransaction`](../reference/dapi-endpoints-core-grpc-endpoints.md#gettransaction) | Returns details for the requested transaction |
|   1   | [`subscribeTo` `BlockHeadersWithChainLocks`](../reference/dapi-endpoints-core-grpc-endpoints.md#subscribetoblockheaderswithchainlocks) | Returns the requested block headers along with the associated ChainLocks.<br>_Added in Dash Platform v0.22_ |
|   1   | [`subscribeTo` `TransactionsWithProofs`](../reference/dapi-endpoints-core-grpc-endpoints.md#subscribetotransactionswithproofs) | Returns transactions matching the provided bloom filter along with the associated [`islock` message](https://docs.dash.org/projects/core/en/stable/docs/reference/p2p-network-instantsend-messages.html#islock) and [merkle block](https://docs.dash.org/projects/core/en/stable/docs/reference/p2p-network-data-messages.html#merkleblock) |

### Platform gRPC Service

In addition to providing the request data, the following endpoints can also provide proofs that the
data returned is valid and complete. The endpoints are versioned so updates can be made to them without introducing issues for endpoint consumers.

| Layer | Endpoint |   |
| :---: | -------- | - |
|   2   | [`broadcastStateTransition`](../reference/dapi-endpoints-platform-endpoints.md#broadcaststatetransition) | Broadcasts the provided State Transition |
|   2   | [`getIdentity`](../reference/dapi-endpoints-platform-endpoints.md#getidentity) | Returns the requested identity |
|   2   | [`getIdentityBalance`](../reference/dapi-endpoints-platform-endpoints.md#getidentitybalance) | Returns the requested identity's balance |
|   2   | [`getIdentityBalanceAndRevision`](../reference/dapi-endpoints-platform-endpoints.md#getidentitybalanceandrevision) | Returns the requested identity's balance and revision |
|   2   | [`getIdentityByPublicKeyHash`](../reference/dapi-endpoints-platform-endpoints.md#getidentitybypublickeyhash) | Returns the identity associated with the provided public key hash |
|   2   | [`getIdentityContractNonce`](../reference/dapi-endpoints-platform-endpoints.md#getidentitycontractnonce) | Returns the identity contract nonce |
|   2   | [`getIdentityKeys`](../reference/dapi-endpoints-platform-endpoints.md#getidentitykeys) | Returns the requested identity keys
|   2   | [`getIdentityNonce`](../reference/dapi-endpoints-platform-endpoints.md#getidentitynonce) | Returns the current identity nonce |
|   2   | `getIdentities` | **Removed in Dash Platform v1.0.0-dev.12**<br>Returns the requested identities |
|   2   | [`getIdentitiesContractKeys`](../reference/dapi-endpoints-platform-endpoints.md#getidentitiescontractkeys) | **Added in Dash Platform v1.0.0-dev.12**<br>Returns keys associated to a specific contract for multiple Identities |
|   2   | `getIdentitiesByPublicKeyHashes` | **Removed in Dash Platform v1.0.0-dev.12**<br>Returns the identities associated with the provided public key hashes |
|   2   | [`getDataContract`](../reference/dapi-endpoints-platform-endpoints.md#getdatacontract) | Returns the requested data contract |
|   2   | [`getDataContracts`](../reference/dapi-endpoints-platform-endpoints.md#getdatacontracts) | Returns the requested data contracts |
|   2   | [`getDataContractHistory`](../reference/dapi-endpoints-platform-endpoints.md#getdatacontracthistory) | Returns the requested data contract history |
|   2   | [`getDocuments`](../reference/dapi-endpoints-platform-endpoints.md#getdocuments) | Returns the requested document(s) |
|   2   | [`getEpochsInfo`](../reference/dapi-endpoints-platform-endpoints.md#getepochsinfo) | Returns information about the requested epoch(s)
|   2   | [`getProofs`](../reference/dapi-endpoints-platform-endpoints.md#getproofs) | Returns proof information for the requested identities, contracts, and/or document(s)
|   2   | [`getProtocolVersionUpgradeState`](../reference/dapi-endpoints-platform-endpoints.md#getprotocolversionupgradestate) | Returns the number of votes cast for each protocol version
|   2   | [`getProtocolVersionUpgradeVoteStatus`](../reference/dapi-endpoints-platform-endpoints.md#getprotocolversionupgradevotestatus) | Returns protocol version upgrade status
|   2   | [`waitForStateTransitionResult`](../reference/dapi-endpoints-platform-endpoints.md#waitforstatetransitionresult) | Responds with the state transition hash and either a proof that the state transition was confirmed in a block or an error |

```{eval-rst}
..
  Commented out info
  [block:html]
  {
    "html": "<div></div>\n<!--\nPrimarily for debugging, don't document - getConsensusParams\n-->\n<style></style>"
  }
  [/block]
```

> 📘
>
> The previous version of documentation can be [viewed
> here](https://docs.dash.org/projects/platform/en/0.25.0/docs/reference/dapi-endpoints.html).

```{toctree}
:maxdepth: 2
:titlesonly:
:hidden:

dapi-endpoints-json-rpc-endpoints
dapi-endpoints-grpc-overview
dapi-endpoints-core-grpc-endpoints
dapi-endpoints-platform-endpoints
```
