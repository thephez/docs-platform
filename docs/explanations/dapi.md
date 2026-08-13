```{eval-rst}
.. _explanations-dapi:
```

# Decentralized API (DAPI)

## Overview

Historically, nodes in most cryptocurrency networks communicated with each other, and the outside world, according to a peer-to-peer (P2P) protocol. The use of P2P protocols presented some downsides for developers, namely, network resources were difficult to access without specialized knowledge or trusted third-party services.

To overcome these obstacles, the Dash decentralized API (DAPI) uses Dash's robust masternode infrastructure to provide an API for accessing the network. DAPI supports both layer 1 (Core blockchain) and layer 2 (Dash Platform) functionality so all developers can interact with Dash via a single interface.

```{eval-rst}
.. figure:: ../../img/dapi.svg
   :class: no-scaled-link
   :align: center
   :width: 90%
   :alt: DAPI Overview

   DAPI Overview
```

## Security

DAPI protects connections by using TLS to encrypt communication between clients and the masternodes. This encryption safeguards transmitted data from unauthorized access, interception, or tampering. [Platform gRPC endpoints](../reference/dapi-endpoints-platform-endpoints.md) provide an additional level of security by optionally returning cryptographic proofs. Successful proof verification guarantees that the server responded without modifying the requested data.

:::{note}
See the [Query Capabilities page](./query.md) for more detailed information regarding Platform data
retrieval.
:::

## Endpoint Overview

DAPI currently provides 2 types of endpoints: [JSON-RPC](https://www.jsonrpc.org/) and [gRPC](https://grpc.io/docs/guides/).

- JSON-RPC endpoints are a small surface that mostly exposes layer 1 information, with the exception of a Platform status method
- gRPC endpoints cover both Core and Platform:
  - Core endpoints are mostly request/response, plus streaming subscriptions for block headers, transactions, and masternode-list updates
  - Platform endpoints are request/response only.

For a list of all endpoints and usage details, please see the [DAPI endpoint reference section](../reference/dapi-endpoints.md).
