```{eval-rst}
.. _explanations-dpns:
```

# Name Service (DPNS)

## Overview

Dash Platform Name Service (DPNS) is a service used to register names on Dash Platform. It is a general service that is used to provide usernames and application names for [identities](../explanations/identity.md) but can also be extended in the future to resolve other cryptocurrency addresses, websites, and more. DPNS is implemented as an application on top of the platform and leverages platform capabilities.

> 👍 DPNS DIP
>
> The [DPNS Dash Improvement Proposal (DIP)](https://github.com/dashpay/dips/blob/master/dip-0012.md) provides more extensive background information and details.

### Relationship to identities

DPNS names and [Identities](../explanations/identity.md) are tightly integrated. Identities provide a foundation that DPNS builds on to enable name-based interactions -- a user experience similar to what is found in non-cryptocurrency applications. With DPNS, users or application developers register a name and associate it with an identity. Once linked, the identity's private keys allow them to prove ownership of the name to establish trust when they interact with other users and applications.

## Details

### Name Registration Process

> 📘
>
> Given the DNS-compatible nature of DPNS, all DPNS names are technically domain names and are registered under a top-level DPNS domain (`.dash`). Some applications may abstract the top-level domain away, but it is important to be aware that it exists.

To prevent [front-running](https://en.wikipedia.org/wiki/Domain_name_front_running), name registration is split into a two phase process consisting of:

1. Pre-ordering the domain name
2. Registering the domain name

#### Domain pre-order

In the pre-order phase, the domain name is salted to obscure the actual domain name being registered (e.g. `hash('alice.dash' + salt)`) and submitted to platform. This is done to prevent masternodes from seeing the names being registered and "stealing" them for later resale. Once the pre-order receives a sufficient number of confirmations, the registration can proceed.

#### Domain registration

In the registration phase, the domain name (e.g. `alice.dash`) is once again submitted along with the salt used in the pre-order. The salt serves as proof that the registration is from the user that submitted the pre-order. This registration also references the identity being associated with the domain name to complete the identity-domain link.

### Conflict resolution

Since some names may be popular, the registration process includes a voting mechanism to resolve conflicts when multiple identities request the same name. This is only done for names that meet both of the following conditions:

* Less than 20 characters long (i.e. "alice", "quantumexplorer")
* Contains no numbers or only contains the number(s) 0 and/or 1 (i.e. "bob", "carol01")

Identities requesting contested names must pay a fee (200 credits) to cover the masternode voting costs. The voting window begins when a name matching the criteria above is requested and ends after two weeks. Additional identities can request the same name during the first week. Masternodes and evonodes can vote for one of the identities, abstain, or vote to lock the request.

After voting concludes, the name is either awarded to one of the identities or locked. If the vote locks the name, no identity receives it. Locked names can no longer be requested or awarded in Dash Platform v1.0, but future updates may add unlock capabilities.

Assuming masternodes do not vote to lock, the identity receiving the most votes takes ownership of the name. If only one identity requests the name, they will receive it even if no masternodes vote.

### Implementation

DPNS names have several constraints as defined in the [DPNS data contract](https://github.com/dashpay/platform/blob/v1.0.0-beta.3/packages/dpns-contract/schema/v1/dpns-contract-documents.json). The constraints provide compatibility with DNS and protection from homograph attacks:

* Maximum length - 63 characters
* Character set - `0-9`, `-` (hyphen), and `A-Z` (case insensitive)
  * Note: Use of `-` as a prefix/suffix to a name is _not_ allowed (e.g. `-name` or `name-`). This constraint is defined by this JSON-Schema [pattern](https://github.com/dashevo/platform/blob/master/packages/dpns-contract/schema/dpns-contract-documents.json#L38) in the DPNS data contract: `^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$`
* Domain labels are converted to lowercase for case-insensitive uniqueness validation. Then, "o", "i" and "l" replaced with "0" and "1" to mitigate [homograph attacks](https://en.wikipedia.org/wiki/IDN_homograph_attack). For example, "Alice" is normalized "a11ce".

Additional validation rules related to the `domain` document are enforced by the DPNS [data triggers](../explanations/platform-protocol-data-trigger.md) defined in [rs-drive-abci](https://github.com/dashpay/platform/tree/master/packages/rs-drive-abci/src/execution/validation/state_transition/state_transitions/documents_batch/data_triggers/triggers).

```{eval-rst}
..
  Commented out info
  ### Contract Diagram

  This is a visualization of the JSON data contract as UML class diagram for better understanding of the structure. The left side shows the `domain` document and the right side shows the `preorder` document:
```

```{eval-rst}
..
  Commented out info - obsolete
  .. figure:: ./img/dpns-uml.png
    :class: no-scaled-link
    :align: center
    :width: 90%
    :alt: DPNS Contract Diagram

    DPNS Contract Diagram
```

```{eval-rst}
..
  Commented out info - obsolete
  View [a full-size copy of this diagram](./img/dpns-uml.png).
```
