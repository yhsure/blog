---
title: "Distributed atomic transaction"
date: "2025-05-24"
tags:
  - seed
---
An atomic transaction is a sequence of actions that are completely executed in its entirety or not executed at all. A key property of _distributed_ atomic transactions is that they typically involve multiple nodes across a network.

One common example of achieving this is the [[thoughts/Two-phase commit|thoughts/2PC]] algorithm.