---
title: "Unix"
date: 2023-06-07
tags:
  - seed
---

Unix philosophy: expect the output of every program to become the input to another, as yet unknown, program.

See also: [[thoughts/computer architecture|computer architecture]]

## Manual Pages

[Source](https://man7.org/linux/man-pages)

The number in parentheses shown after Unix command names in manpages refers to which section it falls under. The main sections are:

1. [Section 1](https://man7.org/linux/man-pages/man1/intro.1.html): user commands and tools, for example, file manipulation tools, shells, compilers, web browsers, file and image viewers and editors, and so on.
	1. [strace(1)](https://man7.org/linux/man-pages/man1/strace.1.html)
2. [Section 2](https://man7.org/linux/man-pages/man2/intro.2.html): [[thoughts/computer architecture#Syscalls]].
	1. [pidfd_open(2)](https://man7.org/linux/man-pages/man2/pidfd_open.2.html)
	2. [fcntl(2)](https://man7.org/linux/man-pages/man2/fcntl.2.html)
	3. [poll(2)](https://man7.org/linux/man-pages/man2/poll.2.html)
	4. [userfaultfd(2)](https://man7.org/linux/man-pages/man2/userfaultfd.2.html)
	5. [seccomp_unotify(2)](https://man7.org/linux/man-pages/man2/seccomp_unotify.2.html)
	6. [io_uring_setup(2)](https://man7.org/linux/man-pages/man2/io_uring_setup.2.html)
3. [Section 3](https://man7.org/linux/man-pages/man3/intro.3.html): all library functions excluding the library functions described in Section 2. Many of the functions described in the section are part of the Standard C Library (libc).
4. [Section 4](https://man7.org/linux/man-pages/man4/intro.4.html): special files (devices, `null`, etc.).
5. [Section 5](https://man7.org/linux/man-pages/man5/intro.5.html): file formats and file systems.
6. [Section 6](https://man7.org/linux/man-pages/man6/intro.6.html): games and 'funny little programs'.
7. [Section 7](https://man7.org/linux/man-pages/man7/intro.7.html): misc.
	1. [epoll(7)](https://man7.org/linux/man-pages/man7/epoll.7.html)
	2. [socket(7)](https://man7.org/linux/man-pages/man7/socket.7.html)
	3. [signal(7)](https://www.man7.org/linux/man-pages/man7/signal.7.html)
	4. [capabilities(7)](https://man7.org/linux/man-pages/man7/capabilities.7.html)
8. [Section 8](https://man7.org/linux/man-pages/man8/intro.8.html): administration and privileged commands.

## Processes
[Source](https://www.man7.org/linux/man-pages/man5/proc.5.html)

A process is a program in execution in memory or in other words, an instance of a program in memory. Any program executed creates a process.

> The **proc** filesystem is a pseudo-filesystem which provides an interface to kernel data structures. It is commonly mounted at `/proc`.

1. `/proc/:pid` subdirectories
	1. Each one of these subdirectories contains files and subdirectories exposing information about the process with the corresponding process ID.
	2.  `/proc/:pid/task/:tid` contains corresponding information about each of the threads in the process, where `tid` is the kernel thread ID of the thread.
	3. `/proc/:pid/ns` is a subdirectory containing one entry for each namespace that supports being manipulated by [setns(2)](https://www.man7.org/linux/man-pages/man2/setns.2.html).
	4.  `/proc/:pid/oom_score_adj` is a file used to adjust the score used to select which process should be killed in an out-of-memory (OOM) situation. A positive score increases the likelihood of this process being killed by the OOM-killer; a negative score decreases the likelihood.
2. `/proc/self`
	1. When a process accesses this magic symbolic link, it resolves to the process's own `/proc/pid` directory.

See also: [[thoughts/Permissions|Permissions]]

### PID1 Zombies

[Source](https://blog.phusion.nl/2015/01/20/docker-and-the-pid-1-zombie-reaping-problem/)

Zombie processes: processes that have terminated but have not (yet) been waited for by their parent processes.

Unix processes are ordered in a tree. Each process can spawn child processes, and each process has a parent except for the top-most process.

This top-most process is the init process. It is started by the kernel when you boot your system. This init process is responsible for starting the rest of the system, such as starting the SSH daemon, starting the Docker daemon, starting Apache/Nginx, starting your GUI desktop environment, etc. Each of them may in turn spawn further child processes.

![[thoughts/images/pid1.png|400]]

If a process terminates, it turns into a "zombie process" which Unix still keeps some minimal set of information about (PID, termination status, resource usage information). In Unix, parent processes must explicitly 'wait' for child processes to terminate.

The action of calling `waitpid()` on a child process in order to eliminate its zombie, is called "reaping".

If a parent process is killed, the children are 'orphaned' (have no parent process). PID1's job has a special task to adopt these orphaned processes and becomes the parent.  Thus, the operating system expects the init process to reap adopted children too.

### Signals

Signals are standardized messages sent to a running program to trigger specific behavior, such as quitting or error handling.

- SIGTERM can also be referred as a soft kill because the process that receives the SIGTERM signal may choose to ignore it. Allows the process to cleanup, etc.
- SIGKILL is used for immediate termination of a process. This signal cannot be ignored or blocked. SIGKILL cannot be trapped, so there is no way for processes to terminate cleanly. Suppose that the app you're running is busy writing a file; the file could get corrupted if the app is terminated uncleanly in the middle of a write. Unclean terminations are bad. It's almost like pulling the power plug from your server.

## Unix Domain Sockets

[Source](https://en.wikipedia.org/wiki/Unix_domain_socket)

A Unix domain socket aka UDS or IPC socket (inter-process communication socket) is a data communications endpoint for exchanging data between processes executing on the same host operating system. It is also referred to by its address family `AF_UNIX`.

Valid socket types in the UNIX domain are:

1. SOCK_STREAM (compare to [[thoughts/TCP|TCP]]) – for a stream-oriented socket
2. SOCK_DGRAM (compare to [[thoughts/UDP|UDP]]) – for a datagram-oriented socket that preserves message boundaries (as on most UNIX implementations, UNIX domain datagram sockets are always reliable and don't reorder datagrams)
3. SOCK_SEQPACKET (compare to SCTP) – for a sequenced-packet socket that is connection-oriented, preserves message boundaries, and delivers messages in the order that they were sent

Importantly, UDS can transfer not only data but also file descriptors (!!!) which means you can transmute a lot of things between processes.