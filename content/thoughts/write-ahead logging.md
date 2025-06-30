---
title: Write-ahead Logging
date: 2025-05-24
tags:
  - seed
aliases:
  - WAL
---

Helps to provide atomicity and durability guarantees (see [[thoughts/CAP Theorem|CAP Theorem]]) in [[thoughts/distributed systems|distributed systems]].

A write ahead log is an append-only structure used for crash and transaction recovery. The WAL notably is a **separate, additional** data structure from the main storage and usually is disk-resident (i.e. stored on some form of persistent storage) rather than memory.

## Compaction

After a certain amount of operations, the program using the WAL should perform a  checkpoint, writing all the changes specified in the WAL to the database and clearing the log.