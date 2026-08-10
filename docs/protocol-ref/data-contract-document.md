# Contract Documents

## Contract Document Overview

The `documents` object defines each type of document in the data contract. At a minimum, a document must consist of 1 or more properties. The `additionalProperties` properties keyword must be included as described in the [constraints](./data-contract.md#additional-properties) section and each property must be [assigned a position](#assigning-position).

:::{note}
The `$schema` property is required for each document type but is automatically injected by the platform during [contract enrichment](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/src/data_contract/document_type/schema/enrich_with_base_schema/v0/mod.rs). Do not include it in user-submitted document type definitions — providing it will result in a validation error.
:::

The following example shows a minimal `documents` object defining a single document (`note`) with one property (`message`).

```json
{
  "note": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "position": 0
      }
    },
    "additionalProperties": false
  }
}
```

Documents may also define [indices](#document-indices), a list of [required](#required-properties) or [transient](#transient-properties) properties, and a custom [configuration](#document-configuration). Refer to this table for a brief description of the major document sections:

| Feature    | Description                                   |
|------------|-----------------------------------------------|
| [Configuration](#document-configuration) | Document-level settings affecting behavior such as mutability, deletion, and transferability  |
| [Properties](#document-properties) | Definitions and constraints for each field within a document  |
| [Indices](#document-indices)       | Definitions for indexing document fields to support efficient querying |

## Document Properties

The `properties` object defines each field that a document will use. Each field consists of an object that, at a minimum, must define its data `type` (`string`, `number`, `integer`, `boolean`, `array`, `object`).

Fields may also apply a variety of optional JSON Schema constraints related to the format, range, length, etc. of the data. A full explanation of JSON Schema capabilities is beyond the scope of this document. For more information regarding its data types and the constraints that can be applied, please refer to the [JSON Schema reference](https://json-schema.org/understanding-json-schema/reference/index.html) documentation.

### Assigning Position

Each property in a level must be assigned a unique `position` value, with ordering starting at zero and incrementing with each property. When using nested objects, position counting resets to zero for each level. This structure supports backward compatibility in data contracts by [ensuring consistent ordering](https://github.com/dashpay/platform/pull/1594) for serialization and deserialization processes.

### Object Properties

The `object` type cannot be an empty object but must have one or more defined properties. For example, the `body` property shown below is an object containing a single string property (`objectProperty`):

```javascript
const contractDocuments = {
  message: {
    type: "object",
    properties: {
      body: {
        type: "object",
        position: 0,
        properties: {
          objectProperty: {
            type: "string",
            "position": 0
          },
        },
        additionalProperties: false,
      },
      header: {
        type: "string",
        "position": 1
      }
    },
    additionalProperties: false
  }
};
```

### Required Properties

Each document may have some fields that are required for the document to be valid and other fields that are optional. Required fields are defined via the `required` array, which consists of a list of the field names from the document that must be present. Exclude the `required` object for documents without required properties.

```json
"required": [
  "<field name a>",
  "<field name b>"
]
```

**Example**  
The following example (excerpt from the DPNS contract's `domain` document) demonstrates a document with required fields:

```json
"required": [
  "$createdAt",
  "$updatedAt",
  "$transferredAt",
  "label",
  "normalizedLabel",
  "normalizedParentDomainName",
  "preorderSalt",
  "records",
  "subdomainRules"
]
```

### Transient Properties

Each document may have transient fields that require validation but do not need to be stored by the system once validated. Transient fields are defined in the `transient` array. Only include the `transient` object for documents with at least one transient property.

**Example**  

The following example (from the [DPNS contract's `domain` document](https://github.com/dashpay/platform/blob/master/packages/dpns-contract/schema/v1/dpns-contract-documents.json)) demonstrates a document that has 1 transient field:

```json
    "transient": [
      "preorderSalt"
    ]
```

### Property Constraints

There are a variety of constraints currently defined for performance and security reasons.

| Description | Value |
| ----------- | ----- |
| Minimum number of properties | [1](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json#L23) |
| Maximum number of properties | [100](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json#L24) |
| Minimum property name length | [1](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json#L21) |
| Maximum property name length | [64](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json#L21) |
| Property name characters     | Alphanumeric (`A-Z`, `a-z`, `0-9`)<br>Hyphen (`-`) <br>Underscore (`_`) |

## Document Indices

Document indices may be defined if indexing on document fields is required. The `indices` object should only be included for documents with at least one index.

The `indices` array consists of one or more objects that each contain:

* A unique `name` for the index
* A `properties` array composed of a `<field name: sort order>` object for each document field that is part of the index (only `asc` is currently supported)
  
  :::{admonition} Compound Indices
  :class: attention
  When defining an index with multiple properties, the ordering of properties is important. Refer to the [mongoDB documentation](https://docs.mongodb.com/manual/core/index-compound/#prefixes) for details. Dash uses [GroveDB](https://github.com/dashpay/grovedb), which works similarly but requires listing all the index's fields in query order by statements.
  :::
* An optional `unique` element that determines if duplicate values are allowed for the document
* An optional `nullSearchable` element that indicates whether the index allows searching for NULL values. If nullSearchable is false (default: true) and all properties of the index are null then no reference is added.
* An optional `contested` element that determines if duplicate values are allowed for the document

:::{code-block} json
:force:

"indices": [
  {
    "name": "<index name a>",
    "properties": [
      { "<field name a>": "asc" },
      { "<field name b>": "asc" }
    ],
    "unique": true|false,
    "nullSearchable": true|false,
    "contested": {
      "fieldMatches": [
        {
          "field": "<field name a>",
          "regexPattern": "<regex>"
        }
      ],
      "resolution": 0
    }
  },
  {
    "name": "<index name b>",
    "properties": [
      { "<field name c>": "asc" },
    ],
  }
]
:::

### Contested Indices

Contested unique indices provide a way for multiple identities to compete for ownership when a new document field matches a predefined pattern. This system enables fair distribution of valuable documents, such as [premium DPNS names](../explanations/dpns.md#conflict-resolution), through community-driven decision-making.

A two week contest begins when a match occurs. For the first week, additional contenders can join by paying a fee of 0.2 Dash. During this period, masternodes and evonodes vote on the outcome. The contest can result in the awarding of the document to the winner, a locked vote where no document is awarded, or potentially a restart of the contest if specific conditions are met.

The table below describes the properties used to configure a contested index:

| Property Name | Type | Description |
|-|-|-|
| fieldMatches | array | Array containing conditions to check |
| fieldMatches.field | string | Name of the field to check for matches |
| fieldMatches.regexPattern | string | Regex used to check for matches |
| resolution | integer | Method to resolve the contest:<br>`0` - masternode voting |

**Example**

This example (from the [DPNS contract's `domain` document](https://github.com/dashpay/platform/blob/master/packages/dpns-contract/schema/v1/dpns-contract-documents.json)) demonstrates the use of a contested index:

``` json
"contested": {
  "fieldMatches": [
    {
      "field": "normalizedLabel",
      "regexPattern": "^[a-zA-Z01-]{3,19}$"
    }
  ],
  "resolution": 0,
  "description": "If the normalized label part of this index is less than 20 characters (all alphabet a-z, A-Z, 0, 1, and -) then a masternode vote contest takes place to give out the name"
}
```

### Index Constraints

For performance and security reasons, indices have the following constraints. These constraints are subject to change over time.

| Description | Value |
| ----------- | ----- |
| Minimum/maximum length of index `name` | [1](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json#L358) / [32](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json#L359) |
| Maximum number of indices | [10](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json#L482) |
| Maximum number of unique indices | [10](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-platform-version/src/version/dpp_versions/dpp_validation_versions/v2.rs#L27) |
| Maximum number of contested indices | [1](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-platform-version/src/version/dpp_versions/dpp_validation_versions/v2.rs#L26) |
| Maximum number of properties in a single index | [10](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json#L378) |
| Maximum length of indexed string property | [63](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/src/data_contract/document_type/class_methods/try_from_schema/mod.rs#L24) |
| Usage of `$id` in an index [disallowed](https://github.com/dashpay/platform/pull/178) | N/A |
| **Note: Dash Platform [does not allow indices for arrays](https://github.com/dashpay/platform/pull/225).**<br>Maximum length of indexed byte array property | [255](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/src/data_contract/document_type/class_methods/try_from_schema/mod.rs#L25) |
| **Note: Dash Platform [does not allow indices for arrays](https://github.com/dashpay/platform/pull/225).**<br>Maximum number of indexed array items         | [1024](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/src/data_contract/document_type/class_methods/try_from_schema/mod.rs#L26) |

:::{seealso}
For all protocol constants, see [Protocol Constants](protocol-constants.md).
:::

**Example**  
The following example (excerpt from the DPNS contract's `preorder` document) creates an index named `saltedHash` on the `saltedDomainHash` property that also enforces uniqueness across all documents of that type:

```json
"indices": [
  {
    "name": "saltedHash",
    "properties": [
      {
        "saltedDomainHash": "asc"
      }
    ],
    "unique": true
  }
]
```

## Document Configuration

Documents support the following configuration options to provide flexibility in contract design. Only include configuration options in a data contract when using non-default values.

| Document option | Type | Description |
|-----------------|------|-------------|
| `documentsKeepHistory`               | boolean  | If true, documents keep a history of all changes. Default: false. |
| `documentsMutable`                   | boolean  | If true, documents are mutable. Default: true. |
| `canBeDeleted`                       | boolean  | If true, documents can be deleted. Default: true. |
| `transferable`                       | integer  | Transferable without a marketplace sell:<br>`0` - Never<br>`1` - Always<br>See the [NFT page](../explanations/nft.md#transfer-and-trade) for more details |
| `tradeMode`                          | integer  | Built-in marketplace system:<br>`0` - None<br>`1` - Direct purchase (the purchaser can buy the item without requiring approval)<br>See the [NFT page](../explanations/nft.md#transfer-and-trade) for more details |
| `creationRestrictionMode`            | integer  | Restriction of document creation:<br>`0` - No restrictions<br>`1` - Contract owner only<br>`2` - No Creation Allowed<br>See the [NFT page](../explanations/nft.md#creation-restrictions) for more details |
| `keepsTransferHistory`               | boolean  | If true, transfers of these documents are recorded in the [document history contract](#document-history-flags). Default: false. |
| `keepsPurchaseHistory`               | boolean  | If true, purchases of these documents are recorded in the [document history contract](#document-history-flags). Default: false. |
| `keepsPricingHistory`                | boolean  | If true, price updates on these documents are recorded in the [document history contract](#document-history-flags). Default: false. |

| Security option | Type | Description |
|-----------------|------|-------------|
| [`requiresIdentity`<br>`EncryptionBoundedKey`](./data-contract.md#key-management) | integer  | Key requirements for identity encryption:<br>`0` - Unique non-replaceable<br>`1` - Multiple<br>`2` - Multiple with reference to latest key |
| [`requiresIdentity`<br>`DecryptionBoundedKey`](./data-contract.md#key-management) | integer  | Key requirements for identity decryption:<br>`0` - Unique non-replaceable<br>`1` - Multiple<br>`2` - Multiple with reference to latest key |
| `signatureSecurity`<br>`LevelRequirement`  | integer  | Public key security level:<br>`1` - Critical<br>`2` - High<br>`3` - Medium. Default is High if none specified. |

### Token Costs

The `tokenCost` option allows document types to require token payment for operations. When configured, users must pay a specified amount of tokens to perform each operation type. Each operation cost is defined as a [documentActionTokenCost](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v0/document-meta.json#L294-L337) object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `contractId` | array (32 bytes) | No | Identifier of the contract containing the payment token. Defaults to the current contract if omitted. |
| `tokenPosition` | integer (0–65535) | Yes | Position of the token within the contract |
| `amount` | integer (1–281474976710655) | Yes | Number of tokens required for the operation |
| `effect` | integer | No | Token disposition after payment:<br>`0` - Transfer to contract owner (default)<br>`1` - Burn (tokens destroyed) |
| `gasFeesPaidBy` | integer | No | Who pays gas fees for the operation:<br>`0` - Document owner (default)<br>`1` - Contract owner<br>`2` - Prefer contract owner (falls back to document owner if insufficient) |

The following operation types can each have an independent cost configuration:

| Operation | Description |
|-----------|-------------|
| `create` | Creating a new document |
| `replace` | Replacing an existing document |
| `delete` | Deleting a document |
| `transfer` | Transferring document ownership |
| `update_price` | Updating a document's purchase price |
| `purchase` | Purchasing a document |

:::{dropdown} List of all usable document properties

  This list of properties is defined in the [Rust DPP implementation](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/src/data_contract/document_type/mod.rs#L43) and the [document meta-schema](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json).

  | Property Name | Type | Description |
  |---------------|------|-------------|
  | `type`                               | string   | Specifies the type of the document, constrained to "object". |
  | `$schema`                            | string   | Platform-injected during enrichment; not accepted in user submissions. |
  | `$defs`                              | object   | References the `documentProperties` definition. |
  | [`indices`](#document-indices)       | array    | Defines indices for the document with properties like `name`, `unique`, `nullSearchable`, and `contested`. |
  | `signatureSecurity`<br>`LevelRequirement`  | integer  | Public key security level:<br>`1` - Critical<br>`2` - High<br>`3` - Medium. Default is High if none specified. |
  | `documentsKeepHistory`               | boolean  | If true, documents keep a history of all changes. Default: false. |
  | `documentsMutable`                   | boolean  | If true, documents are mutable. Default: true. |
  | `canBeDeleted`                       | boolean  | If true, documents can be deleted. Default: true. |
  | `transferable`                       | integer  | Transferable without a marketplace sell:<br>`0` - Never<br>`1` - Always |
  | `tradeMode`                          | integer  | Built-in marketplace system:<br>`0` - None<br>`1` - Direct purchase (the purchaser can buy the item without requiring approval) |
  | `creationRestrictionMode`            | integer  | Restriction of document creation:<br>`0` - No restrictions<br>`1` - Contract owner only<br>`2` - No Creation Allowed. |
  | [`requiresIdentity`<br>`EncryptionBoundedKey`](./data-contract.md#key-management) | integer  | Key requirements for identity encryption:<br>`0` - Unique non-replaceable<br>`1` - Multiple<br>`2` - Multiple with reference to latest key |
  | [`requiresIdentity`<br>`DecryptionBoundedKey`](./data-contract.md#key-management) | integer  | Key requirements for identity decryption:<br>`0` - Unique non-replaceable<br>`1` - Multiple<br>`2` - Multiple with reference to latest key |
  | [`properties`](#document-properties) | object   | Defines the properties of the document. |
  | [`transient`](#transient-properties) | array    | An array of strings specifying transient properties that are validated by Platform but not stored. |
  | `tokenCost`                          | object   | Defines token costs for document operations (create, replace, update_price, delete, transfer, purchase) |
  | [`documentsCountable`](#aggregate-query-flags) | boolean | Doctype-wide count support. See [Aggregate Query Flags](#aggregate-query-flags). |
  | [`rangeCountable`](#aggregate-query-flags) | boolean | Per-index range counts. See [Aggregate Query Flags](#aggregate-query-flags). |
  | [`documentsSummable`](#aggregate-query-flags) | string | Doctype-wide sums of the named integer property. See [Aggregate Query Flags](#aggregate-query-flags). |
  | [`rangeSummable`](#aggregate-query-flags) | boolean | Per-index range sums. See [Aggregate Query Flags](#aggregate-query-flags). |
  | [`documentsAverageable`](#aggregate-query-flags) | string | Doctype-wide averages of the named integer property. See [Aggregate Query Flags](#aggregate-query-flags). |
  | [`rangeAverageable`](#aggregate-query-flags) | boolean | Per-index range averages. See [Aggregate Query Flags](#aggregate-query-flags). |
  | [`keepsTransferHistory`](#document-history-flags) | boolean | Records transfers in the document history contract. See [Document History Flags](#document-history-flags). |
  | [`keepsPurchaseHistory`](#document-history-flags) | boolean | Records purchases in the document history contract. See [Document History Flags](#document-history-flags). |
  | [`keepsPricingHistory`](#document-history-flags) | boolean | Records price updates in the document history contract. See [Document History Flags](#document-history-flags). |
  | `required`                           | array    | Standard JSON Schema keyword listing required property names. |
  | `description`                        | string   | Standard JSON Schema keyword describing the document type. |
  | `$comment`                           | string   | Standard JSON Schema keyword for a schema comment. |
  | `minProperties`                      | integer  | Standard JSON Schema keyword bounding the minimum number of properties. |
  | `maxProperties`                      | integer  | Standard JSON Schema keyword bounding the maximum number of properties. |
  | `dependentRequired`                  | object   | Standard JSON Schema keyword declaring conditionally required properties. |
  | [`additionalProperties`](./data-contract.md#additional-properties) | boolean  | Specifies whether additional properties are allowed. Must be set to false, meaning no additional properties are allowed beyond those defined. |

:::

**Example**

The following example (from the [DPNS contract's `domain` document](https://github.com/dashpay/platform/blob/master/packages/dpns-contract/schema/v1/dpns-contract-documents.json)) demonstrates the use of several configuration options:

```json
{
  "domain": {
    "documentsMutable": false,
    "canBeDeleted": true,
    "transferable": 1,
    "tradeMode": 1,
    "..."
  }
}
```

## Aggregate Query Flags

:::{versionadded} 4.0.0
:::

Document types can opt into aggregate query support (count / sum / average) by setting flags at the document-type level. These flags control the underlying storage layout — once set on a published contract they cannot be changed by a contract update.

There are two axes:

* **Doctype-wide** (`documents*`) — applies the aggregate over the entire document type. Set at the document type root, alongside other doctype options like `documentsKeepHistory`.
* **Per-index range** (`range*`) — extends the corresponding aggregate to range queries on indexed properties. Set on the index object (alongside `name`, `properties`, `unique`, and `contested`), using the index-level `countable`/`summable`/`averageable` flags and their `range*` variants — not on the individual `{ "field": "asc" }` property entry. Requires the matching base flag.

| Flag | Type | Purpose | Required for |
| - | - | - | - |
| `documentsCountable` | Boolean | Doctype-wide counts (empty `where` or `==`/`IN` clauses on indexed fields). | `SELECT COUNT(*)` without a range clause. |
| `rangeCountable` | Boolean | Per-index counts over a range. Requires `documentsCountable`. | `SELECT COUNT(*)` with a range clause or `GROUP BY <range_field>`. |
| `documentsSummable` | String | Doctype-wide sums of the named integer property. | `SELECT SUM(<that property>)`. |
| `rangeSummable` | Boolean | Per-index sums over a range. Requires `documentsSummable`. | `SELECT SUM(<field>)` with a range clause. |
| `documentsAverageable` | String | Syntactic sugar for `documentsCountable: true` + `documentsSummable: "<prop>"`. | `SELECT AVG(<that property>)`. |
| `rangeAverageable` | Boolean | Syntactic sugar for `rangeCountable: true` + `rangeSummable: true`. Requires `documentsAverageable`. | `SELECT AVG(<field>)` with a range clause. |

The averageable flags desugar to the underlying count + sum flags during contract parsing — same on-disk layout — so authors who think in terms of averages get a single flag and downstream code paths (insert, query, estimation) stay unchanged. If both `documentsAverageable` and `documentsSummable` are set, they must name the same property.

These flags were introduced in the v1 document meta-schema and carry forward unchanged into v2. They are rejected when applied to pre-v12 contracts. The full v2 meta-schema, including these flags, is defined [in rs-dpp](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json).

See the [`getDocuments` reference](../reference/dapi-endpoints-platform-endpoints.md#getdocuments) for the request/response shapes that consume these flags.

## Document History Flags

:::{versionadded} 4.1.0
:::

Document types can opt into recording ownership and pricing events in the [document history system contract](./data-contract.md#document-history-system-contract) by setting flags at the document-type level. Each flag is a boolean defaulting to false, set at the document type root alongside other doctype options like `documentsKeepHistory`. These are distinct from the token-level [token history properties](./data-contract-token.md#history-properties), which share the `keepsTransferHistory` name but default to true and record into token history.

| Flag | Type | Purpose |
| - | - | - |
| `keepsTransferHistory` | Boolean | Records each transfer of these documents. |
| `keepsPurchaseHistory` | Boolean | Records each purchase of these documents. |
| `keepsPricingHistory` | Boolean | Records each price update on these documents. |

Like the [aggregate query flags](#aggregate-query-flags), these cannot be changed by a contract update once set on a published contract.

The flags are read only when the contract validates against the v2 document meta-schema (protocol version 13 or later). Under earlier meta-schema versions they are treated as false. The full v2 meta-schema is defined [in rs-dpp](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json).

## Keyword Constraints

There are a variety of keyword constraints currently defined for performance and security reasons. The
following constraints apply to document definitions. Unless otherwise noted, these
constraints are defined in the platform's JSON Schema rules (e.g., [rs-dpp document meta
schema](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v0/document-meta.json)).

| Keyword | Constraint |
| ------- | ---------- |
| `default`                   | Restricted - cannot be used (defined in DPP logic)  |
| `propertyNames`             | Restricted - cannot be used (defined in DPP logic) |
| `pattern: <something>`      | `maxLength` must be defined (maximum: 50000) |
| `format: <something>`       | `maxLength` must be defined (maximum: 50000) |
| `$ref: <something>`         | Internal references only - the value must begin with `#` (e.g. `#/$defs/myType`). External and remote references, and reference cycles, are rejected |
| `if`, `then`, `else`, `allOf`, `anyOf`, `oneOf`, `not` | Disabled for data contracts |
| `dependencies`              | Not supported. Use `dependentRequired` instead |
| `dependentSchemas`          | Not supported. Schema-based dependencies are not available in document schemas; use `dependentRequired` for property-presence dependencies |
| `type: array`               | Only byte arrays are supported. `byteArray: true` must be defined; schemas for individual array items are not available |
| `additionalItems`           | Not supported. Per-item array schemas (`items` / `prefixItems`) are not available in document schemas; constrain arrays with `minItems`, `maxItems`, `uniqueItems`, `contains`, and `byteArray` |
| `patternProperties`         | Restricted - cannot be used for data contracts |
| `pattern`                   | Accept only [RE2](https://github.com/google/re2/wiki/Syntax) compatible regular expressions (defined in DPP logic) |

## Example Syntax

This example syntax shows the structure of a documents object that defines two documents, an index, and a required field.

:::{code-block} json
:force:

{
  "<document name a>": {
    "type": "object",
    "properties": {
      "<field name b>": {
        "type": "<field data type>",
        "position": "<number>"
      },
      "<field name c>": {
        "type": "<field data type>",
        "position": "<number>"
      },
    },
    "indices": [
      {
        "name": "<index name>",
        "properties": [
          {
            "<field name c>": "asc"
          }
        ],
        "unique": true|false
      },
    ],
    "required": [
      "<field name c>"
    ],
    "additionalProperties": false
  },
  "<document name x>": {
    "type": "object",
    "properties": {
      "<property name y>": {
        "type": "<property data type>",
        "position": "<number>"
      },
      "<property name z>": {
        "type": "<property data type>",
        "position": "<number>"
      },
    },
    "additionalProperties": false
  },    
}
:::

## Document Schema

See full document schema details in the [rs-dpp document meta schema](https://github.com/dashpay/platform/blob/v4.1.0/packages/rs-dpp/schema/meta_schemas/document/v2/document-meta.json).
