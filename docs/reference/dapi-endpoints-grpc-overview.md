```{eval-rst}
.. _reference-dapi-endpoints-grpc-overview:
```

# gRPC Overview

The gRPC endpoints provide access to information from Dash Platform as well as streaming of events related to blocks and transactions/transitions.

## Connecting to gRPC

### Auto-generated Clients

Clients for a number of languages are built automatically from the protocol definitions and are available in the `packages/dapi-grpc/clients` folder of the [platform](https://github.com/dashpay/platform/) repository. The protocol definitions are available in the [`packages/dapi-grpc/protos` folder](https://github.com/dashpay/platform/tree/master/packages/dapi-grpc/protos). Pull requests are welcome to add support for additional languages that are not currently being built.

### Command Line Examples

Some examples shown in the endpoint details pages use a command-line tool named [gRPCurl](https://github.com/fullstorydev/grpcurl) that allows interacting with gRPC servers in a similar way as `curl` does for the [JSON-RPCs](../reference/dapi-endpoints-json-rpc-endpoints.md). Additional information may be found in the [gRPC documentation](https://grpc.io/docs/guides/).

To use gRPCurl as shown in the detailed examples, clone the [platform](https://github.com/dashpay/platform/) repository and execute the example requests from the `packages/dapi-grpc` directory of that repository as shown in this example:

```shell
## Clone the dapi-grpc repository
git clone https://github.com/dashpay/platform.git
cd platform/packages/dapi-grpc

## Execute gRPCurl command
grpcurl -plaintext -proto protos/...
```

### Browser access

The [gRPC UI](https://github.com/fullstorydev/grpcui) tool provides a way to interact with gRPC servers using a browser. The example below shows how to start the tool configured to access Core gRPC endpoints on testnet:

```shell
# Use Core gRPC
grpcui -insecure -open-browser  -proto protos/core/v0/core.proto  seed-1.testnet.networks.dash.org:1443
```

## Stream termination and backpressure

:::{versionadded} 4.1.0
:::

Streaming endpoints apply per-stream delivery bounds, so a stream that has already been established can be terminated by the server with `RESOURCE_EXHAUSTED`. This happens when:

- The client cannot keep up with delivery and the stream's pending-event or pending-byte budget is exceeded.
- The initial mempool snapshot exceeds the per-stream transaction count or byte budget. See
  [`subscribeToTransactionsWithProofs`](dapi-endpoints-core-grpc-endpoints.md#subscribetotransactionswithproofs)
  for endpoint-specific recovery guidance.
- The handover from replaying historical data to live delivery does not complete within 180 seconds.

Treat this status as a resumable backpressure signal rather than a fatal error. For confirmed block data, reconnect and resume from the last block your client finished processing. A `RESOURCE_EXHAUSTED` returned when *opening* a stream means the node's concurrent-stream limit for that endpoint is reached — back off and retry, or connect to a different node.
