# Drive

## Overview

Using the traditional, layer 1 blockchain for data storage is widely known to be expensive and inefficient. Consequently, data for Dash Platform applications is stored in Drive, a layer 2 component that provides decentralized storage hosted by masternodes. As data changes over time, Drive maintains a record of the current state of each item to support easy retrieval using [DAPI](explanation-dapi).

## Details

### Drive Components

There are a number of components working together to facilitate Drive's overall functionality. These components are listed below along with a brief description of service they provide:

 - [Platform chain](explanation-drive-platform-chain) (orders state transitions; creates and propagates blocks of state transitions)
 - Platform state machine (validates data against the [Dash platform protocol](explanation-platform-protocol); applies data to state and storage)
 - [Platform state](explanation-drive-platform-state) (represents current data)
 - Storage (record of state transitions)

### Data Update Process

The process of adding or updating data in Drive consists of several steps to ensure data is validated, propagated, and stored properly. This description provides a simplified overview of the process:

1. [State transitions](explanation-platform-protocol-state-transition) are submitted to the platform via [DAPI](explanation-dapi)
2. DAPI sends the state transitions to the platform chain where they are validated, ordered, and committed to a block
3. Valid state transitions are applied to the platform state
4. The platform chain propagates a block containing the state transitions
5. Receiving nodes update Drive data based on the valid state transitions in the block
[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/5e35fd4-Drive.svg",
        "Drive.svg",
        612,
        492,
        "#fafafc"
      ],
      "caption": "Storing data in Drive"
    }
  ]
}
[/block]

```{toctree}
:maxdepth: 2
:titlesonly:
:hidden:

drive-platform-chain
drive-platform-state
```
