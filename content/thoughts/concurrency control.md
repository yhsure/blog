---
title: Concurrency control
date: 2025-05-26
tags:
  - seed
---
 
 Concurrency control ensures that correct results for concurrent operations are generated, while getting those results as quickly as possible.

Common mechanisms include:

- **Locking** - transactions acquire locks on data before accessing it
- **Optimistic concurrency control** - assuming conflicts are rare and checking for them at commit time. If there is a conflict, re-attempt the transaction.
	- OCC is generally used in environments with low contention. For high contention cases, the cost of re-attempting the transaction hurts performance significantly.
- **Multi-version concurrency control (MVCC)** - maintaining multiple versions of data so readers don't block writers
	- The most common isolation level implemented with MVCC is snapshot isolation. With snapshot isolation, a transaction observes a state of the data as of when the transaction started.