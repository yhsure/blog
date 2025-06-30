---
title: Willow Protocol
date: 2024-02-02
tags:
  - seed
---
[Source](https://willowprotocol.org/)

A protocol for peer-to-peer data stores.

- We made Willow to make running a network _together_ a sustainable practice.
- We made Willow to reconcile peer-to-peer networks with social realities. Wrangling the complexity of distributed systems shouldn’t mean we trade away basic features like deletion, or accept data structures which can only grow without limit.

### Properties
- As many of these stores as you want, keyed to different namespaces. When stores from different devices belong to the same namespace, they deterministically sync with each other.
- Private and end-to-end encrypted. Other users can't find out what you’re interested in unless they already know about it themselves.
- Total [[thoughts/deletion|delete]] via prefix pruning (essentially cutting a tree of causal dependencies by trimming down to root and marking that with a single tombstone). Destructive edits. When you update a value, the old values and associated metadata are overwritten.
- Fine grained [[thoughts/access control|access control]]. Restrict read and write access by semantically meaningful ranges of data, or time range.
- Peers can communicate resource budgets, so devices with very limited memory can sync too.

## Data Model
[Source](https://willowprotocol.org/specs/data-model/index.html#data_model)

Willow is a system for giving meaningful, hierarchical names to arbitrary sequences of bytes (called _payloads_).

For any given subspace, you can address payloads via paths (e.g. `blog/idea/1` and `blog/idea/2`).
- Entries can be overwritten by more recent entries (Willow tracks timestamps and deletes actually delete everything except the metadata)
- Deletes are hierarchical (e.g. deleting `blog` will delete all of tis subpaths).
	- This is called prefix pruning

Entries live in separate subspace owned by different users (intuitively, each user writes to their own, separate universe of data. Willow allows for various ways of controlling who gets to write to which subspace)

![[thoughts/images/willow-subspaces.png]]

Interestingly, namespaces can also be aggregated into namespaces.

Some types
- `Payload`: at most $2^{64}-1$ bytes
- `Entry`: metadata for a payload
	- `NamespaceId`: keys namespaces
	- `SubspaceID`: keys subspaces
	- `Path`: parametrized by
		- `max_component_length`: max length for a path segment
		- `max_component_count`: max path segments in a path
		- `max_path_length`: overall limit for size of path
	- `Timestamp`: time in microseconds since Unix epoch time
	- `payload_length`
	- `PayloadDigest`: content addressing for a payload
		- calculated from `hash_payload(payload) -> hash`: maps `Payload` to `PayloadDigest`

An entry `e1` is newer than an entry `e2` if:
1. `e2.timestamp < e1.timestamp` or
2. `e2.timestamp == e1.timestamp && e2.payload_digest < e1.payload_digest` or
3. `e2.timestamp == e1.timestamp && e2.payload_digest == e1.payload_digest && e2.payload_length < e1.payload_length`

Auth:
- `AuthorisationToken`: proving write permission
- `is_authorized_write(entry, token) -> bool`: maps a path and token to whether that token proves a valid permission to write to entry
- `PossiblyAuthorisedEntry` is a pair of an `Entry` and an `AuthorisationToken`
- `AuthorisedEntry` is a `PossiblyAuthorisedEntry` for which `is_authorised_write` returns true

Stores are collection of `AuthorisedEntry`:
- All `Entry` have the same `NamespaceId`
- An invariant such that an `Entry` `a` cannot both a prefix of another `Entry` `b` _and_ `a` be newer than `b`
	- That is, updating `blog` will invalidate `blog/abc` (is this true?)

A join of two stores is obtained by:
- Start with the union of the two stores
- Remove all `Entry` `e1` where there is some `Entry` `e2` such that
	1. `e2.path` is a parent of  `e1.path` and
	2. `e2` is newer than `e1`
- For all `Entry` with the same `SubspaceID`, `Path`, and `Timestamp`, remove them all except for the one with the greatest `PayloadDigest`
- For all `Entry` with the same `SubspaceID`, `Path`, `Timestamp`, and `PayloadDigest`, remove them all except for the one with the greatest `payload_length`

Stores form a [[thoughts/CRDT#State-based|state-based CRDT]] under the join operation.

### Grouping Entries
[Source](https://willowprotocol.org/specs/grouping-entries/index.html#grouping_entries)

An application might want to access all chess games that a certain author played in the past week. This kind of query corresponds to a box in the three-dimensional Willow space.

There are one-dimensional queries called ranges which work along `SubspaceId`, `Path`, or `Timestamp`

A `3dRange` is a 3-tuple of ranges across all three dimensions:

```
struct 3dRange
  subspaces: SubspaceRange
  paths: PathRange
  times: TimeRange
```

## Sync Protocol
[Source](https://willowprotocol.org/specs/sync/index.html#sync)

Requirements:
- Incremental sync: peers can detect regions of shared data with relatively sparse communication to avoid redundant data transfer
- Partial sync: peers synchronise only those regions of data they both care about
- Private area intersection: peers can discover common interests without disclosing any non-shared information to each other
- Resource control: peers communicate (and enforce) their computational resource limits so as not to overload each other
- Transport independence
- General efficiency: peers can make use of efficient implementation techniques, and the overall bandwidth consumption stays low

### 3D Range-based Set Reconciliation

1. To reconcile two sets, one peer first computes a hash over all items in its set, and sends this fingerprint to the other peer. That peer then computes the fingerprint over its items as well. If the fingerprints match, they are done reconciling.
2. If they do not match, there are two options.
	1. First, the peer can split its set in half and then initiate set reconciliation for each half concurrently (by transmitting its hashes for both halves).
	2. Second, if the set is sufficiently small, the peer can instead simply transmit its items in the set. The other peer responds to this with all other items that it held in the set, completing the process of reconciliation.

## Capabilities System
[Source](https://willowprotocol.org/specs/meadowcap/index.html#meadowcap)

When interacting with a peer in Willow, there are two fundamental operations:
1. writing data — asking your peer to add `Entries` to their stores, and
2. reading data — asking your peer to send `Entries` to you

Both operations should be restricted. In Willow, this is done via a [[thoughts/access control|capabilities system]] called Meadowcap.

A capability is an unforgeable token that bestows read or write access for some data to a particular person, issued by the owner of that data. A capability bestows not only access rights but also the ability to mint new capabilities for the same resources but to another peer

### Capability Delegation

A capability bestows not only access rights but also the ability to mint new capabilities for the same resources but to another peer.

Consider Alfie and Betty, each holding a key pair. Alfie can mint a new capability for Betty by signing his own capability together with her public key: `sign(capability + betty.pub_key, alfie.priv_key)`

Note that capability can be turned into a *more restrictive subset*.

## Encrypted Willow

- Payloads:
	1. Append a nonce to each plaintext (so that equal plaintexts at different paths have different digests)
	2. Apply some padding to a prespecified length (so that the length of the plaintext is not leaked)
	3. Encrypt the result (so that the contents stay confidential), and
	4. Use the resulting cyphertext as a [Payload](https://willowprotocol.org/specs/data-model/index.html#Payload)
- Computing [joins](https://willowprotocol.org/specs/data-model/index.html#store_join) of [stores](https://willowprotocol.org/specs/data-model/index.html#store) necessitates comparing [Timestamps](https://willowprotocol.org/specs/data-model/index.html#Timestamp) numerically.
	- Willow deals in plaintext Timestamps only.
	- Unfortunately this still leaks information (i.e. it isn't indistinguishable from random data)
	- There is work around order-preserving encryption