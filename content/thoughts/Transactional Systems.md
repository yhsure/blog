---
title: "Transactional Systems"
date: "2025-05-25"
tags:
  - seed
---
[Source](https://transactional.blog/blog/2025-decomposing-transactional-systems)

A transaction in transaction systems is an atomic unit of work that consists of one or more operations that must all succeed or all fail together.

Every transactional system does four things:
- It executes transactions: evaluates the body of the transaction to produce the intended reads and writes.
- It orders transactions: assigns the transaction some notion of a time at which it occurred.
- It validates transactions: enforces [[thoughts/concurrency control|concurrency control]], or more rarely, domain-specific semantics.
- It persists transactions: makes making it durable, generally to disk

All four of these things must be done before the system may acknowledge a transaction’s result to a client. However, these steps can be done in any order. They can be done concurrently. Different systems achieve different tradeoffs by reordering these steps.

See also: [[thoughts/distributed atomic transaction|distributed atomic transaction]]