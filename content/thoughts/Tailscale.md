---
title: Tailscale
date: 2024-08-03
tags:
  - seed
---
An [[thoughts/Overlay Network|Overlay Network]] provider, "secure networks defined in software made easy"

[Source](https://tailscale.com/blog/new-internet)

> Tailscale makes the Internet work how you thought the Internet worked, before you learned how the Internet works.

- As an industry, we’ve spent all our time making the hard things possible, and none of our time making the easy things easy.
- The chain of dominoes starts with connectivity. Lack of connectivity is why we get [[thoughts/inevitability of centralization|centralization]], and centralization is why we pay rent for every tiny little program we want to run and why everything is slow and tedious and complicated and hard to debug...
- You pay exorbitant rents to cloud providers for their computing power because your own computer isn’t in the right place to be a decent server.
	- It’s behind a firewall and a [[thoughts/NAT|NAT]] and a dynamic [[thoughts/IP Address|IP Address]] and probably an asymmetric network link that drops out just often enough to make you nervous.
	- Historically, operating systems mattered. Writing portable software was so hard that if you wanted to interconnect one program to another, if you wanted things to be compatible at all, you had to run them on the same computer, which meant you had to standardize the operating system, and that operating system was DOS, and then Windows.
	- The web undid that monopoly. Now JavaScript matters more than all the operating systems put together, and there’s a new element that controls whether two programs can talk to each other: [[thoughts/HTTP|HTTP]]. If you can HTTP from one thing to another, you can interconnect. If you can’t, forget it.
	- We didn’t get here on purpose, mostly. It was just path dependence. We had security problems and an IPv4 address shortage, so we added firewalls and NATs, so connections became one way from client machines to server machines, and so there was no point putting certificates on clients, and nowadays there are 10 different reasons a client can’t be a server, and everyone is used to it, so we design everything around it. Dumb terminals and centralized servers.
		- See also [[posts/agentic-computing|agentic computing]].