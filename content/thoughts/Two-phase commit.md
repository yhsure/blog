---
title: Two-phase commit
date: 2025-05-24
tags:
  - seed
aliases:
  - thoughts/2PC
---

Type of atomic commitment protocol that allows processes to participate in a [[thoughts/distributed atomic transaction]].

## Assumptions
The protocol assumes that:

1. there is a [[thoughts/write-ahead logging|WAL]]
2. no node crashes forever,
3. any two nodes can communicate with each other.

## Phases

1. Phase 1 (PREPARE):
	- Coordinator sends PREPARE to all participants
	- Participants vote COMMIT (if they can do it) or ABORT
	- All participants must vote COMMIT to proceed
2. Phase 2 (COMMIT/ABORT):
	- If all voted COMMIT: coordinator sends COMMIT to all
	- If any voted ABORT: coordinator sends ABORT to all
	- Participants execute the decision and acknowledge

Importantly, all nodes block on receiving COMMIT/ABORT from the coordinator before actually executing.

## Undo and redo logs
Intermediate changes are recorded on a row-by-row basis in an undo/redo log. The undo log records the before-image (original values) and the redo log records the after-image (new values).

e.g.

```
TxnID: 100, LSN: 501
Operation: UPDATE users WHERE id=123
Before: name='Jane'
After: name='John'
```

Note that the log records each row touched so wide-reaching changes like `DELETE FROM users` would create a undo-redo log entry for each row affected.