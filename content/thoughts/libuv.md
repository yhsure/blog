---
title: libuv
date: 2024-06-04
tags:
  - seed
---
[Source](https://docs.libuv.org/en/v1.x/guide/basics.html)

libuv offers core utilities like timers, non-blocking networking support, asynchronous file system access, child processes and more.

## Event Loop

In event-driven programming, an application expresses interest in certain events and respond to them when they occur. The responsibility of gathering events from the operating system or monitoring other sources of events is handled by libuv, and the user can register callbacks to be invoked when an event occurs. The event-loop usually keeps running _forever_. In pseudocode:

```
while there are still events to process:
    e = get the next event
    if there is a callback associated with e:
        call the callback
```
