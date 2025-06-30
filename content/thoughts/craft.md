---
title: Craft
date: 2024-04-14
tags:
  - evergreen
  - technical
aliases:
  - Projects
---
I like to consider the work I do _craft_ -- not necessarily in the explicit hand-made aspect of it -- but rather a celebration of the act of making itself. What follows is a list of things I'm proud to have made or helped contribute to with my own hands.

My (considerably longer) list of unfinished ideas can be found [here](thoughts/idea%20list.md). You can also find a list of things that didn't quite go so well in my [[posts/a-failure-resume|failure resume]].

---

## Web Poetics

- Sunlit, a pure CSS implementation of light streaming through the window (2024)
	- Experiments in making a website feel more 'lived in'. Fun with `matrix3d`, progressive blur, SVG filters, and sunrise/sunsets.
	- Source: [GitHub](https://github.com/jackyzha0/sunlit)
	- <video class="lazy" data-src="/thoughts/images/sunlit.webm" autoplay loop muted></video>
- Community Lock Screen Collage, digital installation for [Kernel 4](https://www.kernelmag.io/issues/4) Launch Party (2024)
	- What would it be like to live with someone else's lock screen for a day? Participants are invited to upload their own lockscreen and download someone else's. The uploaded lockscreens are arranged to create a stylized version of the Kernel 4 cover.
	- This installation asks two separate questions: 1) what do people choose to hold onto and consciously pay attention to? 2) how might the personal be a touchstone of connection to create a larger collective whole?
	- Source: [GitHub](https://github.com/we-bsite/photomontage)
	- ![[thoughts/images/lockscreen-collage.png]]
- (we)bsite, website and digital home (2022)
	- A project with Spencer Chang in which we create a living collection of internet dreams from people like you, inhabitants of the internet. It aims to create space to hold, show, and uplift everyday visions and hopes for the internet.
	- Source: [Site](https://we-b.site/), [GitHub](https://github.com/we-bsite/we-bsite)
	- <video class="lazy" data-src="/thoughts/images/(we)bsite-demo.webm" autoplay loop muted></video>
- Verses, digital home (2022)
	- Website and digital home for Verses, a collective of writers, researchers, and technologists co-imagining, practicing, and building a healthier cyberspace.
	- Source: [Site](https://verses.xyz/), [GitHub](https://github.com/verses-xyz/www)
	- <video class="lazy" data-src="/thoughts/images/verses-www-demo.webm" autoplay loop muted></video>
- Pluriverse (2022)
	- Website for Verses' Pluriverse Project. This site stands as an artifact to foster collective dialogue centered around [[thoughts/plurality|pluralism]].
	- Source: [Site](https://pluriverse.world/), [GitHub](https://github.com/verses-xyz/pluriverse)
	- <video class="lazy" data-src="/thoughts/images/pluriverse-demo.webm" autoplay loop muted></video>

## Open Source

- **ruspty** (2024)
	- Wrote large chunks of the core library code in Rust which allows consumers in Node.js and Bun to create [[thoughts/terminal|pseudoterminal]] file descriptors for forked processes.
	- This, in conjunction with River (below), allowed us to see a ~200x improvement in shell throughput. This means we can output all of Shakespeare's collected works in about ~.2s instead of 67s!
	- Source: [GitHub](https://github.com/replit/ruspty)
	- Blog post: [Replit Blog](https://blog.replit.com/shell2)
	- ![[thoughts/images/shell-comparison.png]]
- **River** (2023)
	- Designed and implemented River, a framework for long-lived streaming Remote Procedure Calls (RPCs) in modern web applications, featuring advanced error handling and customizable retry policies to ensure seamless communication between clients and servers. River is Replit's main communication protocol, powering the workspace editor and AI chat.
	- Source: [GitHub](https://github.com/replit/river), [Protocol Docs](https://github.com/replit/river/blob/main/PROTOCOL.md)
	- <video class="lazy" data-src="/thoughts/images/river-demo.webm" autoplay loop muted></video>
- pyright-extended -- a custom [LSP](https://microsoft.github.io/language-server-protocol/) combining [pyright](https://github.com/microsoft/pyright), [yapf](https://github.com/google/yapf), and [ruff](https://github.com/astral-sh/ruff) (2023)
	- Created what is now Replit’s main Python LSP, invoked almost ~17M times per month. Led to a 13% improvement on 7 day retention and a 4x bump in code action acceptance rate (~3% to ~12%).
	- Source: [GitHub](https://github.com/replit/pyright-extended)
	- <video class="lazy" data-src="/thoughts/images/pyright-extended-demo.webm" autoplay loop muted></video>
- **bft-json-crdt** -- the first JSON-like Byzantine Fault Tolerant CRDT (2022)
	- A simplified Automerge-like [[thoughts/CRDT|CRDT]] in Rust with ideas from Martin Kleppmann's 2022 paper on _Making CRDTs Byzantine Fault Tolerant_. The blog post also [hit #3 on Hacker News](https://news.ycombinator.com/item?id=33694568) the day it was released and has been [featured in go-to resources for CRDTs](https://crdt.tech/).
	- Source: [GitHub](https://github.com/jackyzha0/bft-json-crdt), [[posts/bft-json-crdt|blog post]]
	- ![[thoughts/images/bft-json-crdt.png]]
- Distributed Press -- publishing websites to the [[thoughts/distributed web|distributed web]] (2022)
	- Architected a new version of Distributed Press, an open source publishing tool for the web that utilizes distributed peer-to-peer protocols to improve content discoverability and archivability. 
	- Implemented and tested the new rewrite to improve observability, performance, and security ([#31](https://github.com/hyphacoop/api.distributed.press/pull/31), [#32](https://github.com/hyphacoop/api.distributed.press/pull/32), [#35](https://github.com/hyphacoop/api.distributed.press/pull/35)). Wrote a custom [[thoughts/DNS|DNS]] server to resolve DNSLink queries for hosted sites ([#41](https://github.com/hyphacoop/api.distributed.press/pull/41)).
	- Source: [GitHub](https://github.com/hyphacoop/api.distributed.press), [Docs](https://docs.distributed.press/)
- Tabspace -- a scratchspace for your new tab page (2022)
	- A new tab replacement that gives you your very own scratch space to help you stay organized and focused. Wanted to experiment with [[thoughts/formality considered harmful|low-friction]] note taking and integrating [[thoughts/game design|game design]] principles of 'juiciness' into UI/UX.
	- Source: [GitHub](https://github.com/jackyzha0/tabspace), [Chrome Webstore](https://chrome.google.com/webstore/detail/tabspace/kcinhoikngobhiikicnpahoanenlnlha)
	- <video class="lazy" data-src="/thoughts/images/tabspace-demo.webm" autoplay loop muted></video>
- Gesture -- hand-tracking as input device (2022)
	- An experimental proof-of-concept that uses hand-tracking as an input device to control a cursor in both 2D and 3D space. It exposes the hand pose information in one of two ways: 1) As a virtual mouse with click and hover and drag support 2) As raw input data, by connecting to a local Websocket server that streams the position data.
	- Source: [GitHub](https://github.com/Gesture-App/gesture)
	- <video class="lazy" data-src="/thoughts/images/gesture-demo.webm" autoplay loop muted></video>
- miniraft -- <1kloc Raft consensus algorithm implementation (2022)
	- A minimal implementation of the [[thoughts/Raft Consensus Algorithm|Raft Consensus Algorithm]] in Rust with a focus on readability/understandability. This project was created as an exercise in implementing and learning about distributed systems.
	- Source: [GitHub](https://github.com/jackyzha0/miniraft), [Documentation](https://jzhao.xyz/miniraft/miniraft/)
	- ![[thoughts/images/miniraft.png]]
- Cursor Chat -- open source library for digital presence (2022)
	- A lightweight (31.8kB) cursor chat à la Figma for digital co-existing + presence. An experiment in spatial software, [interaction design](thoughts/interaction%20design.md), and [digital commons](thoughts/digital%20commons.md). Built on top of [yjs](https://github.com/yjs/yjs) and [perfect-cursors](https://github.com/steveruizok/perfect-cursors).
	- Source: [GitHub](https://github.com/jackyzha0/cursor-chat), [Demo](https://jzhao.xyz/cursor-chat/)
	-  <video class="lazy" data-src="/thoughts/images/cursor-chat-demo.webm" autoplay loop muted></video>
- Telescopic Text -- open source library for expandable text (2022)
	- An open-source library to help with creating expandable text, inspired by [StretchText](https://en.wikipedia.org/wiki/StretchText) and [TelescopicText](https://www.telescopictext.org/text/KPx0nlXlKTciC). It has been taught as a tool for creating writing classes at SFSU.
	- I've been thinking a lot about creating a browsable store of knowledge that provides something useful at all distance scales and concepts like Telescopic Text are a first step in creating more [[thoughts/information scales|information scales]] than just a single document level.
	- Source: [GitHub](https://github.com/jackyzha0/telescopic-text), [Demo](https://poems.verses.xyz/test)
	-  <video class="lazy" data-src="/thoughts/images/telescopic-text-demo.webm" autoplay loop muted></video>
- Portal -- zero-config [P2P](thoughts/peer-to-peer.md) encrypted folder syncing (2021)
	- A command line tool that syncs folders between multiple devices without a central server. Built on top of the [[thoughts/Hypercore|Hypercore]] protocol.
	- Source: [Producthunt](https://www.producthunt.com/posts/portal-11), [GitHub](https://github.com/jackyzha0/portal)
	-  <video class="lazy" data-src="/thoughts/images/portal-demo.webm" autoplay loop muted></video>
- **Quartz** -- a static-site generator for note-taking apps (2021)
	- A tool and workflow to make maintaining and publishing a digital garden and second brain extremely easy. It involved creating a static site generator from scratch. See the [architecture](https://quartz.jzhao.xyz/advanced/architecture) page for more information.
	- Now has a strong community with 7600+ stars on GitHub, 2600+ forks, and 190+ unique contributors and has been translated in over 23 languages.
	- Source: [Site](https://quartz.jzhao.xyz/), [GitHub](https://github.com/jackyzha0/quartz)
	- <video class="lazy" data-src="/thoughts/images/quartz-demo.webm" autoplay loop muted></video>
- Legist -- a platform to summarize policy for [democracy](thoughts/democracy.md) (2021)
	- A web platform that allows users to digest policies in an efficient and accessible manner. Legist allows users view automagically summarize pieces of policy + legislation while still maintaining the key takeaways, view and filter policies by category, and subscribe to periodic rollups on updates. Built at Hack the North 2020++, winning the Founder Institute Fellowship Prize and finalist among over 3000+ participants.
	- Source: [DevPost (Finalists at HTN 2020++)](https://devpost.com/software/legist), [GitHub](https://github.com/htn2020plusplus)
-  ctrl-v -- a modern, open-source pastebin (2021)
	- Source: [App](https://ctrl-v.app/), [GitHub](https://github.com/jackyzha0/ctrl-v), [[thoughts/ctrlv-next|blog post]]
	- ![[thoughts/images/ctrl-v.png]]
- BentoML -- model inference serving (2020)
	- Implemented CLI command to containerize machine learning models ([#847](https://github.com/bentoml/BentoML/pull/847), [#884](https://github.com/bentoml/BentoML/pull/884)).
	- Proposed ([#1540](https://github.com/bentoml/BentoML/issues/1540)), implemented, and tested a distributed application-level locking module to allow multiple concurrent operations on models ([#1541](https://github.com/bentoml/BentoML/pull/1541), [#1567](https://github.com/bentoml/BentoML/pull/1567)).
	- Reduced Docker image size by 60% to enable lighter deployments for model server ([#822](https://github.com/bentoml/BentoML/pull/822)).
	- Source: [GitHub](https://github.com/bentoml/BentoML/commits?author=jackyzha0)
- reflect -- a mindful website blocker for the productive (2020)
	- A browser extension with 1k+ active users focused around asking users to reflect before visiting distracting sites, helping to reduce mindless scrolling while still being able to get work done.
	- Source: [Site](https://getreflect.app/), [GitHub](https://github.com/jackyzha0/reflect-chrome), [[thoughts/reflect|blog post]]
	- <video class="lazy" data-src="/thoughts/images/reflect-demo.webm" autoplay loop muted></video>
- Speech2Braille -- a wearable device to transcribe speech (2018)
	- An end-to-end speech recognition system in TensorFlow using a Deep LSTM and a hardware device to display braille. The device is able to recognize audio and transcribe it into Braille through the haptic feedback device.
	- Source: [Paper (Silver + 10k in awards at Canada Wide Science Fair)](https://github.com/jackyzha0/Speech2Braille/blob/master/ReportPDF.pdf), [GitHub](https://github.com/jackyzha0/Speech2Braille)
	- ![[thoughts/images/speech2braille.png]]

## Writing

The following list of writing that I've had the immense fortune of being able to publish externally. For internal writing, you can visit the [[/posts/]] index.

- Commonplace: The Digital Spaces we want (2023)
	- A conversation with [Spencer](https://spencerchang.me/) about how digital spaces can learn from how physical spaces are designed to create a sense of aliveness + agency that is hard to find online these days.
	- Links: [original](https://commonplace.knowledgefutures.org/pub/jxnitpni/release/1), https://campfire.we-b.site/
	- <video class="lazy" data-src="/thoughts/images/commonplace-demo.webm" autoplay loop muted></video>
- Kernel Issue 2: Open Source and Politics (2022)
	- A conversation with Coraline Ada Ehmke on the [[thoughts/software and politics|politics of open source software]].
	- Links: [original](https://www.kernelmag.io/2/open-source-politics), [[posts/open-source-and-politics|full text]]
	- ![[thoughts/images/kernel-2.png]]
- Reboot: Towards Data Neutrality (2022)
	- My personal manifesto for data-neutrality for the web, what the internet could be, and independent research.
	- Links: [original](https://joinreboot.org/p/rhizome), [[posts/towards-data-neutrality|full text]]

## Communities and Spaces

- [Playspace](http://playspace.club/) (2024-2025)
	- Weekly co-working and co-learning sessions inspired by [Socratica](https://www.socratica.info/).
	- [Scrapbook of all of our fun projects!](https://scrapbook.playspace.club/)
	- See also, our [[thoughts/Playspace#Retro Notes|retro log]]
	- ![[thoughts/images/playspace.png]]
- Saturdays (2023)
	- Weekly co-working sessions at UBC inspired by [Socratica](https://www.socratica.info/).
	- ![[thoughts/images/saturdays.png]]
- [nwPlus](https://nwplus.io/) (2019-2023)
	- Ran a bunch of hackathons over my 4 years of undergrad which involved leading a team of 48, and doing lots of people herding and logistics. I was especially proud of leading logistics for [HackCamp](https://hackcamp.nwplus.io/), a beginner-focused virtual hackathon, attracting over 500+ attendees, 3,200+ livestream viewers, and $1200 in donations to local charities.
	- I left after graduating with strong opinions on [[posts/hackathons|hackathon culture]] and where to go from there.
	- ![[thoughts/images/nwhacks.png]]

## Speaking

- Let us imagine a communally-owned internet! at DWeb Camp (2023)
	- ![[thoughts/images/dweb-collage.png]]
- Communal Computing Networks at DWeb YVR (2023)
	- ![[thoughts/images/dweb-yvr.png]]
- Intro to Computer Networking & P2P at Hack the North (2022)
	- ![[thoughts/images/htn22-talk.png]]
- [React in an hour or your money back at Hack the North](https://www.youtube.com/watch?v=1PFXBpJjjoc) (2021)
- [Intro to Docker at Hack the North 2020++](https://www.youtube.com/watch?v=ONNQ5EDhXUk) (2021)
	- ![[thoughts/images/docker-workshop.png]]


## Physical

- Ceramics (2023-)
	- I'm trying to make [[thoughts/50 pounds of pots|50 pounds of pots]] in an effort to hone my craft.
	- ![[thoughts/images/pottery.png]]
