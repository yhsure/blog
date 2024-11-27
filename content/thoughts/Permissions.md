---
title: Permissions
date: 2024-06-04
tags:
  - seed
---
For the purposes of permission checks (whether a process on behalf of a user is able to do a specific thing), traditional [[thoughts/Unix|Unix]] implementations distinguish two categories of processes:

1. Privileged processes (whose effective user ID is 0, referred to as superuser or root). These processes bypass all kernel permission checks
2. Unprivileged processes (whose effective UID is nonzero). These processes are subject to full permission checking based on the process's credentials.

Starting in kernel 2.2, Linux divides privileges traditionally associated with superuser into distinct, per-thread units known as [capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html) which can be independent enabled and disabled.

We can get even more granular with `seccomp` which can grant/filter/block specific syscalls via an allow list / deny list model. `seccomp-bpf` is an extension to `seccomp` that allows filtering of system calls using a configurable policy implemented using [[thoughts/Link Layer#Berkeley Packet Filter]] rules.

See also: [[thoughts/access control|access control]]
## Namespaces
[Source](https://wizardzines.com/comics/namespaces/) and [manpage](https://www.man7.org/linux/man-pages/man7/signal.7.html)

Currently, Linux implements six different types of namespaces. The purpose of each namespace is to wrap a particular global system resource in an abstraction that makes it appear to the processes within the namespace that they have their own isolated instance of the global resource.

1. `cgroup`
2. `pid`: process ID, allows a PID 1 per container (each process then has a within namespace PID and host PID)
3. `user`: user and group ID name spaces
4. `uts`: hostname and NIS domain names
5. `ipc`: interprocess communication
6. `mnt`: filesystem hierarchy
7. `net`: network devices, IP addresses, routing tables, port numbers, etc.

The default namespace is the "host" namespace.
### Containers
One of the overall goals of namespaces is to support the implementation of containers, a tool for lightweight virtualization (as well as other purposes) that provides a group of processes with the illusion that they are the only processes on the system.

Linux containers are based on top of Linux namespaces (“which resources to isolate per container”) and [[thoughts/cgroups|cgroups]] (“how much of each resource to allocate to each container”).  As such they can be thought of as running native processes directly on top of the kernel but each container only having a local view of the OS inside it. For e.g. a process in a container with a process namespace, may think of “init” as its process with PID1 but outside the container this “init” is like any other user-space process on the system. Similarly, a process in a container with a mount namespace may access “root” (“/”) but in reality it may be any arbitrary path on the system.

See also: [[thoughts/docker|docker]]
