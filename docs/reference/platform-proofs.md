```{eval-rst}
.. _reference-platform-proofs:
```

# Platform Proofs

Platform proofs are an important part of Dash Platform's trust model. A proof is a self-contained
cryptographic object that lets anyone verify a piece of platform state is authentic and was
agreed upon by the validator network -- without trusting whoever supplied the data.

The most common way to obtain a proof is to request one over [DAPI](../explanations/dapi.md): set
the optional `"prove": true` parameter on a [Platform gRPC
endpoint](../reference/dapi-endpoints-platform-endpoints.md) and the response carries a `Proof`
message instead of the plain result. Most Platform endpoints work this way. The two address-tree
sync endpoints are different: they have no `prove` parameter and always return proof data. See
[address tree sync proofs](#address-tree-sync-proofs) below. A proof does not depend on how it was
retrieved, though -- it can be verified independently by any party that holds it.

For the concepts behind proofs -- the two-layer GroveDB + consensus trust model, the verification
flow, what can be proven, and asset lock proofs -- see [Proofs](../explanations/proofs.md).

## Proof structure

A `Proof` is normally a single unified [GroveDB](https://github.com/dashpay/grovedb) proof plus the
consensus signature that authenticates it. One response type is an exception: see [compacted
address balance proofs](#compacted-address-balance-proofs) below. A `Proof` has six fields:

| Field | Type | Description |
| - | - | - |
| `grovedbProof` | Bytes (base64) | The GroveDB proof for the requested data. An opaque blob that a verifier decodes to recover the data and the state root hash. |
| `quorumHash` | Bytes (base64) | Hash of the validator quorum that signed the state. |
| `signature` | Bytes (base64) | BLS threshold signature over the signed block, proving the quorum agreed on this state. |
| `round` | Integer | Consensus round the block was finalized in. |
| `blockIdHash` | Bytes (base64) | Hash of the block ID the proof is anchored to. |
| `quorumType` | Integer | Type of the quorum that produced the signature. |

```json
{
  "proof": {
    "grovedbProof": "APsA/wGQtKE8gXoPHBaBJWO/39M63DsnEkx4Lah9...",
    "quorumHash": "AAAAN0ggLzkGuHl7bJM48baKuEs/b3rhSMSF5kIw14g=",
    "signature": "oc8EMH7WkoZhv06iPvP4HjTlleaRLOfDRvWg30hjXL3z83DpNigk1/8mZwC1jrEDFymkkftcoE+DcPhZu/R8wlP2yxWcWo+605lLqU/FIb29nOt0q6hUbuX+eZL39mdb",
    "round": 0,
    "blockIdHash": "Eq24v2aaWwDXN41oCmduKOYnDRsvoAJwDk8BEHZRDaU=",
    "quorumType": 6
  }
}
```

## Verifying proofs

Clients do not parse proofs manually. Verification is performed by the
`rs-drive-proof-verifier` crate, which checks the quorum's BLS threshold signature (the
Tenderdash consensus half) and decodes the unified `grovedbProof` to recover the requested data
and the state root hash. Dash Platform SDKs verify requested proofs automatically. Applications
performing verification directly can use `rs-drive-proof-verifier`; JavaScript and browser
applications can use the available WebAssembly bindings.

See the [Proofs](../explanations/proofs.md) explanation for the step-by-step verification flow.

## Proof internals

The `grovedbProof` value is an opaque binary blob. Its byte-level format -- the stack-based proof
operators, node types, absence proofs, the V0/V1 proof formats, and the verification algorithm --
is documented in the [GroveDB Proof System
documentation](https://dashpay.github.io/grovedb/proof-system.html). Clients that use an SDK do
not need to work at this level.

### Compacted address balance proofs

:::{versionchanged} 4.1.0
At protocol version 13 and above, the `grovedbProof` returned by
[`getRecentCompactedAddressBalanceChanges`](../reference/dapi-endpoints-platform-endpoints.md#getrecentcompactedaddressbalancechanges)
is not a single GroveDB proof. It is a [bincode envelope carrying two independent GroveDB
proofs](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-drive/src/verify/address_funds/verify_compacted_address_balance_changes/mod.rs#L21-L30):

- a **predecessor proof**, which authenticates which compacted range contains the requested start height, and
- a **forward proof**, verified against a query derived only from that authenticated result.

Both proofs must commit to the same state root hash. Binding the forward query's start key to an
independently verified predecessor result makes this trust model slightly stronger than the
single-proof case. Protocol version 12 and below use the legacy single-proof format for this
response.

A verifier written for the single-proof model will fail to decode a protocol version 13 compacted
proof, so clients implementing verification outside the provided SDKs must handle both formats and
select by protocol version.
:::

### Address tree sync proofs

The two address-tree sync endpoints used for incremental address balance sync differ from the rest
of the Platform surface. Neither takes a `prove` parameter; both always return proof data.

[`getAddressesTrunkState`](../reference/dapi-endpoints-platform-endpoints.md#getaddressestrunkstate)
returns a standard `Proof` message plus response metadata. Unlike every other proof-bearing
endpoint, its proof is served from the latest available **checkpoint** rather than from current
state. The returned `metadata.height` is therefore a checkpoint height that generally trails the
chain tip, and the `quorumHash`, `signature`, `blockIdHash`, and `round` all correspond to that
checkpoint height. A verifier must resolve the signing quorum at the checkpoint height rather than
at the tip, or signature verification will fail.

[`getAddressesBranchState`](../reference/dapi-endpoints-platform-endpoints.md#getaddressesbranchstate)
is the further exception: its response carries neither a `Proof` message nor a `metadata` block,
only a bare `merkProof` byte string. Consistency with the trunk proof is established by passing the
trunk's `metadata.height` back as the request's `checkpoint_height`, rather than by anything in the
response itself. Branch proofs are served only from checkpoints, so a height that no longer has a
checkpoint returns an error.

## Related topics

- [Proofs](../explanations/proofs.md) -- the conceptual trust model, verification flow, and asset lock proofs
- [Platform gRPC endpoints](../reference/dapi-endpoints-platform-endpoints.md) -- the `prove` parameter and example responses
- [GroveDB Proof System](https://dashpay.github.io/grovedb/proof-system.html) -- proof format and verification internals
