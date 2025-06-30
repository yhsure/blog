---
title: Node.js
date: 2024-02-23
tags:
  - seed
---
## Event Loop
[Source](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)

> The event loop is what allows Node.js to perform non-blocking I/O operations — despite the fact that JavaScript is single-threaded

This is powered by [[thoughts/libuv|libuv]].

Since most modern kernels are multi-threaded, they can handle multiple operations executing in the background. When one of these operations completes, the kernel tells Node.js so that the appropriate callback may be added to the **poll** queue to eventually be executed.

```plaintext
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

- Each phase has it's own FIFO queue of callbacks to execute
- On entering each phase, it will perform any operations specific to that phase, then execute callbacks in that phase's queue until the queue has been exhausted or the maximum number of callbacks has executed

Note: in the **poll** phase, events are queued by the kernel and can be queued while polling events are being processed.

### Phases
1. Timers: execute any `setTimeout()` and `setInterval()` callbacks given that enough time has passed since they were scheduled
2. Pending callbacks: certain types of I/O callbacks (i.e. [[thoughts/TCP|TCP]] `ECONNREFUSED`)
3. Idle, prepare: Node internals
4. Poll: wait for system to call us back for I/O events (normally, this is where Node chooses to block)
	1. If the poll queue is not empty, the event loop will iterate through its queue of callbacks executing them synchronously until either the queue has been exhausted, or the system-dependent hard limit is reached.
	2. If the poll queue is empty, one of two more things will happen:
		1. If scripts have been scheduled by setImmediate(), the event loop will end the poll phase and continue to the check phase to execute those scheduled scripts.
		2. If scripts have not been scheduled by setImmediate(), the event loop will wait for callbacks to be added to the queue, then execute them immediately.
5. Check: `setImmediate()`
6. Close callbacks: `socket.on('close', ...)`

Note: Calling `setTimeout(() => {}, 0)` will execute the function at the end of next tick, much later than when using `nextTick()` which prioritizes the call and executes it just before the beginning of the next tick.