---
title: cgroups
date: 2024-11-27
tags:
  - seed
---
aka control groups. Allow you to allocate resources like CPU, memory, network bandwidth, into user-defined groups of tasks.

## cgroupv2

Usually mounted as a pseudo-filesystem at `/sys/fs/cgroup`.

Initially, only the root cgroup exists to which all processes belong. A child cgroup can be created by creating a sub-directory: `/sys/fs/cgroup/<child_cgroup>`

- writing a PID to `/sys/fs/cgroup/<child_cgroup>/cgroup.procs` adds it to that cgroup
- writing `"1"` to `/sys/fs/cgroup/<child_cgroup>/cgroup.kill` will kill the whole cgroup