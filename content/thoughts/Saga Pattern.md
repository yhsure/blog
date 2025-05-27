---
title: "Saga Pattern"
date: "2025-05-25"
tags:
  - seed
---
A way to implement [[thoughts/distributed atomic transaction|distributed atomic transactions]] without the overhead of [[thoughts/Two-phase commit|thoughts/2PC]]

A **saga** is a sequence of local transactions.

## Implementation

- Each local transaction updates the database and publishes a message or event to trigger the next local transaction in the saga.
- If a local transaction fails because it violates a business rule then the saga executes a series of compensating transactions that undo the changes that were made by the preceding local transactions.
	- The nodes then notify the previous transactions in a cascading fashion to also undo via their own local compensations.

## Drawbacks

- Lack of automatic rollback: a developer must design compensating transactions that explicitly undo changes made earlier in a saga rather than relying on the automatic rollback feature of ACID transactions
- Lack of [[thoughts/isolation|isolation]]: means that there’s risk that the concurrent execution of multiple sagas and transactions can use data anomalies.