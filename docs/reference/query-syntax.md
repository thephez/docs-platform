```{eval-rst}
.. _reference-query-syntax:
```

# Query Syntax

## Overview

Generally queries will consist of a `where` clause plus optional [modifiers](#query-modifiers) controlling the specific subset of results returned.

## Where Clause

The Where clause is an optional array of conditions. If omitted or empty, all documents of the queried type are returned (subject to `limit`). For some operators, `value` will be an array. All fields referenced in a query's where clause must be defined in the same index. This includes system timestamp fields (e.g., `$createdAt`, `$updatedAt`, `$transferredAt`, and their block-height variants such as `$createdAtBlockHeight` and `$createdAtCoreBlockHeight`). See the following general syntax example:

:::{code-block} json
:force:
:caption: Syntax

{
  where: [
    [<fieldName>, <operator>, <value>],
    [<fieldName>, <array operator>, [<value1>, <value2>]] 
  ]
}
:::

### Fields

Valid fields consist of the indices defined for the document being queried. For example, the [DPNS data contract](https://github.com/dashpay/platform/blob/master/packages/dpns-contract/schema/v2/dpns-contract-documents.json) defines two indices for domain documents:

| Index Field(s) | Index Type | Unique |
| - | - | :-: |
| [normalizedParentDomainName, normalizedLabel](https://github.com/dashpay/platform/blob/master/packages/dpns-contract/schema/v2/dpns-contract-documents.json#L12-L33) | Compound | Yes |
| [records.identity](https://github.com/dashpay/platform/blob/master/packages/dpns-contract/schema/v2/dpns-contract-documents.json#L34-L42) | Single Field | No |

```{eval-rst}
..
  Commented out info
  [block:html]
  {
    "html": "<div></div>\n<!--\nSpecial fields - `$id`, `$userId`\n-->\n<style></style>"
  }
  [/block]
```

### Comparison Operators

#### Equal

| Name | Description |
| :-: | - |
| == (or =) | Matches values that are equal to a specified value |

#### Range

| Name | Description |
| :-: | - |
| < | Matches values that are less than a specified value |
| <= | Matches values that are less than or equal to a specified value |
| >= | Matches values that are greater than or equal to a specified value |
| > | Matches values that are greater than a specified value |
| in | Matches all document(s) where the value of the field equals any value in the specified array <br>The array must contain between 1 and 100 values, with no duplicates. Empty arrays, oversized arrays, and duplicate values are rejected with `InvalidInClause` |
| Between | Matches values between two bounds (inclusive on both sides) — value must be a two-element array `[lower, upper]` with `lower < upper` |
| BetweenExcludeBounds | Matches values strictly between two bounds (exclusive on both sides) |
| BetweenExcludeLeft | Matches values between two bounds, excluding the lower bound |
| BetweenExcludeRight | Matches values between two bounds, excluding the upper bound |

**Range operator constraints**

- A query can have only one effective range clause. Use `Between` or one of its variants to express both bounds, or supply two complementary range clauses on the same field; Platform normalizes the pair to the equivalent `Between*` form
- The `in` operator is only allowed for last two indexed properties
- Range operators apply to an indexed field that follows any `==` and `in` clauses in the index. A standalone range (with no preceding `==`/`in` clause) is valid when a matching index exists
- Range operators are only allowed for the last two fields used in the where condition
- Queries using range operators (including `in`, which is treated as a range) must also include an `orderBy` statement

### Evaluation Operators

| Name | Description |
| :-: | - |
| startsWith | Selects documents where the value of a field begins with the specified characters. Must include an `orderBy` statement. |

### Operator aliases

Operator names are matched against a fixed set of aliases:

| Operator | Accepted aliases |
| - | - |
| `==` | `=` |
| `in` | `In` |
| `Between` | `between` |
| `BetweenExclude*` | CamelCase, lowercase, and snake_case variants, such as `betweenExcludeLeft`, `betweenexcludeleft`, and `between_exclude_left` |
| `startsWith` | `StartsWith`, `startswith`, `starts_with` |

Any other spelling is rejected.

### Operator Examples

:::::{tab-set}
::::{tab-item} Range
:::{code-block} json
:force:

{
  where: [
    ["nameHash", "<", "56116861626961756e6176657a382e64617368"],
  ],
  orderBy: [
    ["nameHash", "asc"],
  ],
}
:::
::::

::::{tab-item} Between
:::{code-block} json
:force:

{
  where: [
    ["normalizedParentDomainName", "==", "dash"],
    // Return names between "alice" and "carol" (inclusive)
    ["normalizedLabel", "Between", ["alice", "carol"]],
  ],
  orderBy: [
    ["normalizedLabel", "asc"],
  ]
}
:::
::::

::::{tab-item} in
:::{code-block} json
:force:
:caption: in

{
  where: [
      ["normalizedParentDomainName", "==", "dash"],
      // Return all matching names from the provided array
      ["normalizedLabel", "in", ["alice", "bob"]],
    ],
  orderBy: [
    ["normalizedLabel", "asc"],
  ]
}
:::
::::

::::{tab-item} startsWith
:::{code-block} json
:force:
:caption: startsWith

{
  where: [
      ["normalizedParentDomainName", "==", "dash"],
      // Return any names beginning with "al" (e.g. alice, alfred)
      ["normalizedLabel", "startsWith", "al"],
    ],
  orderBy: [
    ["normalizedLabel", "asc"],
  ]
}
:::
::::
:::::

## Query Modifiers

The query modifiers described here determine how query results will be sorted and what subset of data matching the query will be returned.

| Modifier | Effect | Example |
| - | - | - |
| `limit` | Restricts the number of documents returned. An omitted value or `0` uses the configured default (100 by default). Positive values cannot exceed the configured maximum (also 100 by default). See [Aggregate query limits](#aggregate-query-limits) for aggregate result modes. | `limit: 10` |
| `orderBy` | Returns records sorted by the field(s) provided. The `orderBy` fields must match a consecutive run of the index's properties, read from the end of the index (for a compound index, sort by one or more of its trailing fields). Can only be used with `>`, `<`, `>=`, `<=`, `in`, `Between`, `BetweenExcludeBounds`, `BetweenExcludeLeft`, `BetweenExcludeRight`, and `startsWith` queries. | `orderBy: [['normalizedLabel', 'asc']]` |
| `startAt` | Returns records beginning with the document ID provided | `startAt: '<document ID>'` |
| `startAfter` | Returns records beginning after the document ID provided | `startAfter: '<document ID>'` |
| `offset` | Present on the wire but currently rejected with `Unsupported`. Use `startAt` or `startAfter` for pagination. | n/a |

### Ordering compound indexes

For indices composed of multiple fields ([example from the DPNS data contract](https://github.com/dashpay/platform/blob/master/packages/dpns-contract/schema/v2/dpns-contract-documents.json)), the sort order in an `orderBy` must either match the order defined in the data contract OR be the inverse order.

### Combining a cursor with a range operator

This behavior applies when returning `DOCUMENTS`; aggregate result modes do not support cursors.

When a `startAt` / `startAfter` cursor is combined with a range operator (`>`, `>=`, `<`, `<=`), the cursor narrows the effective range in the direction of the `orderBy` sort:

- Ascending order — the cursor is the lower bound and the range clause's value is the upper bound. `startAfter` excludes the cursor row itself.
- Descending order — the roles invert: the range clause's value is the lower bound and the cursor is the upper bound.

:::{versionchanged} 4.1.0
Ascending queries that combined a cursor with a `<` or `<=` clause previously [built their range backwards](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-drive/src/query/conditions.rs#L944-L990), returning incorrect or empty results. Paginating a bounded range now returns the expected results, so a query written against the earlier behavior may return different results after upgrading.
:::

## Aggregate Queries

:::{versionadded} 4.0.0
:::

The [getDocuments](../reference/dapi-endpoints-platform-endpoints.md#getdocuments) v1 surface adds an aggregate-query mode. The same `where` / `orderBy` clauses described above still apply; an additional `select` projection (and optional `groupBy`) determines whether the request returns documents or aggregate values over the matched set.

| `select` | Returns |
| - | - |
| `DOCUMENTS` | Matched documents (same as v0). |
| `COUNT(*)` | Number of documents matching the query. |
| `SUM(<field>)` | Sum of `<field>` across matching documents. |
| `AVG(<field>)` | `(count, sum)` pair the client divides to compute the average. |

`groupBy` is optional. With an empty `groupBy`, the response carries a single aggregate value; with a `groupBy` of one or two fields, the response carries one entry per group.

Aggregate queries impose extra schema requirements on the document type — `COUNT` needs `documentsCountable`, `SUM` needs `documentsSummable`, `AVG` needs `documentsAverageable` (or both base flags). Range-grouped aggregates additionally need the `range*` variants. See the [doctype-level aggregate flags](../protocol-ref/data-contract-document.md#aggregate-query-flags) for the schema annotations and the [`getDocuments` reference](../reference/dapi-endpoints-platform-endpoints.md#getdocuments) for the full `select` × `groupBy` shape table.

`SUM` / `AVG` integer values are returned as JS strings so JavaScript clients don't lose precision on values larger than `Number.MAX_SAFE_INTEGER`.

### Aggregate query limits

The `limit` modifier behaves differently in aggregate result modes than it does when returning `DOCUMENTS`, and some `select` × `groupBy` combinations reject it outright. On the wire, [`limit` is an optional field](https://github.com/dashpay/platform/blob/v4.1.0/packages/dapi-grpc/protos/platform/v0/platform.proto#L958-L1002):

- Omit `limit` to request the server's default.
- Send a positive value to request an explicit cap.
- In aggregate result modes, `limit: 0` is rejected with `InvalidLimit`. When returning `DOCUMENTS`, `0` uses the configured default as described under [Query Modifiers](#query-modifiers).

SDK bindings that must pass a numeric argument use `-1` as the server-default sentinel; any other negative value is rejected.

:::{versionchanged} 4.1.0
In aggregate result modes, an effective limit of zero is now rejected with `InvalidLimit` rather than walking storage with a zero bound, which previously surfaced as an empty result set.
:::

How a positive `limit` is interpreted depends on `groupBy`:

| `select` / `groupBy` | Effect of `limit` |
| - | - |
| `DOCUMENTS` | Uses the general behavior described under [Query Modifiers](#query-modifiers). |
| `COUNT` with an empty `groupBy` | Rejected with `InvalidLimit`. An aggregate count is a single row by construction. |
| `COUNT` grouped by an `In` field | Rejected with `InvalidLimit`. The `In` array is already capped at 100 entries, so the result is bounded. Narrow the `In` array instead. |
| `COUNT` grouped by a range field | Caps the distinct-range walk, so the response carries at most `limit` groups. |
| `COUNT` grouped by an `In` field and a range field | A global cap over the emitted stream, not a per-branch cap. With three `In` values and `limit: 5`, the response carries at most 5 entries in total across all branches. |

`SUM` and `AVG` follow the same policy as `COUNT`: distinct walks apply the default/cap/reject-zero rules, and a zero limit is rejected.

#### Oversized limits with and without proofs

On range-grouped aggregates, an oversized `limit` is handled differently depending on whether a proof is requested. With `prove: true`, a `limit` above the node's configured maximum is rejected with `InvalidLimit` so that proof bytes stay deterministic. With `prove: false`, the limit is silently clamped to that maximum instead. With the default maximum of 100, for example, a caller requesting 500 groups receives at most 100 with no error, which can look like missing data.

Compound carrier-aggregate shapes that pair an `In` field with a range field and request a proof cap the outer range walk at [10 entries](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-drive/src/query/drive_document_count_query/mod.rs#L127). This is a hard ceiling: a `limit` above it is rejected, and callers needing more results issue repeated queries over disjoint outer-range windows.

### Other aggregate restrictions

- `startAt` and `startAfter` are supported only with `DOCUMENTS`. Aggregate result modes reject cursors; narrow the `where` range to query a different group range.
- `HAVING`, `OFFSET`, `COUNT(<field>)`, `MIN`, `MAX`, and multi-projection `SELECT` are present on the wire but currently return `Unsupported`. Callers can encode them in builders ahead of server support landing, but evaluation rejects them today.

## Example query

The following query combines both a where clause and query modifiers.

::::{tab-set}
:::{tab-item} Query object
```javascript
const query = {
  limit: 5,
  startAt: '4Qp3menV9QjE92hc3BzkUCusAmHLxh1AU6gsVsPF4L2q',
  where: [
    ['normalizedParentDomainName', '==', 'dash'],
    ['normalizedLabel', 'startsWith', 'test'],
  ],
  orderBy: [
    ['normalizedLabel', 'asc'],
  ],
}
```
:::

:::{tab-item} Evo SDK example
```javascript
import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

const results = await sdk.documents.query({
  dataContractId: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  documentTypeName: 'domain',
  limit: 5,
  startAt: '4etYFuWbXRXB74gTDp53eLUqjLEAtNSfUX2XtrQ1uMdT',
  where: [
    ['normalizedParentDomainName', '==', 'dash'],
    ['normalizedLabel', 'startsWith', 'test'],
  ],
  orderBy: [
    ['normalizedLabel', 'asc'],
  ],
});

for (const [id, doc] of results) {
  console.log(id.toString(), doc?.toJSON());
}
```
:::

:::{tab-item} Evo SDK aggregate example
The Evo SDK does not expose `select` directly. Each aggregate mode has its own method — `documents.count()`, `documents.sum(query, property)`, and `documents.average(query, property)`. `groupBy` is passed as part of the query.

```javascript
import { EvoSDK } from '@dashevo/evo-sdk';

const sdk = EvoSDK.testnetTrusted();
await sdk.connect();

// COUNT grouped by a range field: one entry per distinct rating.
// The `rating` range clause is what puts the query in grouped mode.
const counts = await sdk.documents.count({
  dataContractId: 'BdgTqaTAPYMyhp1WdeWdcvYSgoD7AuJ7tVCaCSXyQgyP',
  documentTypeName: 'review',
  where: [
    ['resourceId', '==', 'dashnote'],
    ['rating', 'between', [1, 5]],
  ],
  orderBy: [
    ['rating', 'asc'],
  ],
  groupBy: ['rating'],
});

// Keys are hex-encoded index keys, not the raw field values, and
// counts are BigInt. A small positive integer encodes as `0x80 | value`,
// so rating 5 is the key "85".
for (const [key, count] of counts) {
  console.log(`${key - 80} stars: ${count.toString()} review(s)`);
}
```

Both the document type's schema flags and the query's index must support the aggregate — this example needs `documentsCountable` plus `rangeCountable`, and a `[resourceId, rating]` index. An ungrouped `count()` returns a single-entry map keyed by the empty string, so read it with `counts.values().next().value`.
:::
::::
