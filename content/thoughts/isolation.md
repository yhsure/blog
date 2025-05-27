---
title: Isolation Levels
date: 2025-05-26
tags:
  - seed
---

> The idea of isolation is that we want our database to be able to process several transactions at the same time (otherwise it would be terribly slow), but we don’t want to have to worry about concurrency (because it’s terribly complicated).
> 
> [Source](https://martin.kleppmann.com/2014/11/25/hermitage-testing-the-i-in-acid.html)
## Database Transaction Isolation Levels

In increasing levels of strength of isolation.

1. Read Uncommitted: Transactions can read data that other transactions have modified but not yet committed
	- Allows "dirty reads": you might read data that gets rolled back.
2. Read Committed: Transactions only see data that has been committed by other transactions
	- Allows "non-repeatable reads": same query can return different results within a transaction
3. Repeatable Read: Once you read data in a transaction, subsequent reads of the same data (same rows) return the same result, even if other transactions modify it
	- Allows "phantom reads": same query in a transaction can return new rows
4. Snapshot Isolation: Each transaction sees a consistent snapshot of the database from when it started
	- Allows "write skew anomalies": two concurrent transactions read overlapping data and make decisions based on what they read, but their combined writes create an inconsistent state that violates business rules (e.g. two concurrent transactions try to deduct $50 from an account with $60 in it, both checking to see if there is at least $50. It is possible that both reads succeed and say that the account has more than $50 but the combined writes violate the invariant that the account has more than $0.)
5. Serializable: Transactions execute as if they ran one after another