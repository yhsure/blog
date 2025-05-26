---
title: "TrueTime"
date: "2025-05-26"
tags:
  - seed
---

TrueTime is a highly available, distributed [[thoughts/clocks|clock]] that is provided to applications on all Google servers.

Comparing to standard datetime libraries, instead of a particular timestamp, TrueTime's now() function returns an interval of time `[earliest, latest]`.

It also provides two functions:
1. `after(t)` returns true if t has definitely passed (e.g. `t < now().earliest`)
2. `before(t)` returns true if t has definitely not arrived (e.g. `t > now().latest`)
