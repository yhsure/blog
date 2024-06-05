---
title: File Descriptors
date: 2024-06-04
tags:
  - seed
aliases:
  - file descriptor
---
[Source](https://man7.org/linux/man-pages/man2/open.2.html)

The fundamental building block of all I/O in Unix is a sequence of bytes. Most programs work with an even simpler abstraction — a stream of bytes or an I/O stream.

A process references byte streams with the help of descriptors, also known as file descriptors. Pipes, [[thoughts/TCP|TCP]] connections, files, [[thoughts/terminal#TTY|TTYs]], FIFOs, event queues are all examples of streams referenced by a descriptor.

## Flags
`open(2)` can be called with various flags that affect the behaviour of the actual file descriptor.

Commonly set flags are as follows:
- `O_APPEND`: The file is opened in append mode. Before each write(2), the file offset is positioned at the end of the file. The modification of the file offset and the write operation are performed as a single atomic step.
- `O_ASYNC`: Enable signal-driven I/O: generate a signal when input or output becomes possible on this file descriptor.
- `O_CLOEXEC`: the file descriptor remains open in the calling process but on `exec(2)` the file descriptor is automatically closed in the newly exec'd program.
- `O_CREAT`: If pathname does not exist, create it as a regular file.
- `O_NONBLOCK`: When possible, the file is opened in nonblocking mode. Neither the open() nor any subsequent I/O operations on the file descriptor which is returned will cause the calling process to wait.
	- By default, read on any descriptor blocks if there’s no data available. The same applies to write or send.
	- When a descriptor is set in nonblocking mode, an I/O system call on that descriptor will return immediately, even if that request can’t be immediately completed. The return value can be any of the following:
		- an error: when the operation cannot be completed at all
		- a partial count: when the input or output operation can be partially completed
		- the entire result: when the I/O operation could be fully completed

### Fork/Exec Semantics

This also highlights a difference between `exec(2)` and `fork(2)`:
- `fork`: The child process is an exact duplicate of the parent process, inheriting most of its attributes, including open file descriptors, environment variables, and process identity.
	- After the `fork()` call, both the parent and child processes continue execution from the point immediately after the `fork()` call.
- `exec`: When a process calls one of the `exec()` functions, the program specified by the function arguments is loaded into the process's memory space, replacing the existing program.
	- The process ID (PID) of the process remains the same, but the program, file descriptors, code, data, heap, and stack are replaced with those of the new program. The new program starts executing from its entry point (`main()` function), and the original program is effectively terminated and no resources are shared.

When spawning new programs from existing programs, both tend to be combined as `fork-exec`:
- The parent process first calls `fork()` to create a child process, which is an exact duplicate of the parent process.
- The child process then calls one of the `exec()` functions to replace its current program with a new program specified by the function arguments.

## Readiness
A descriptor is considered _ready_ if a process can perform an I/O operation on the descriptor without blocking.

A descriptor changes into a ready state when an I/O event happens, such as the arrival of new input or the completion of a socket connection or when space is available on a previously full socket send buffer after TCP transmits queued data to the socket peer.

There are two ways to find out about the readiness status of a descriptor: edge-triggered and level-triggered.

1. Level-triggered (poll): To determine if a descriptor is ready, the process tries to perform a non blocking I/O operation.
2. Edge-triggered (push): The process receives a notification only when the file descriptor is "ready". This is normally done with `poll(2)`

## File Entry

Every descriptor points to a data structure called the [file entry](https://github.com/torvalds/linux/blob/master/include/linux/fs.h#L987-L1027). The file entry maintains a per descriptor file offset `f_pos` in bytes from the beginning of the file entry object. 

![[thoughts/images/fd-diagram.png]]

Each file entry has an array of function pointers `const struct file_operations *f_op;{:c}`. This array of function pointers translates generic operations on file descriptors to file-type specific implementations.

## Lifecycle

Descriptors are either created explicitly by system calls like `open`, `pipe`, `socket` or are inherited from the parent process.

Descriptors are released when:
- the process exits. If the process in question was the last to reference the file entry, the kernel then deallocates the file entry too
- by calling the `close` system call
- implicitly after an `exec` when the descriptor is marked as close on exec (via `O_CLOEXEC`).

