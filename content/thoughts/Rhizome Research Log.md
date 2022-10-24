---
title: "Rhizome Research Log"
date: 2022-05-03
tags:
- evergreen
- rhizome
---

I think research logs tend to generally focus too much on what one did rather than what one felt. This log aspires to have a healthy mix of both.

## October
### October 24th
- privacy preserving crdts??
- turns out automerge is actually fast now
- ed25519 should be able to sign + verify upwards of 100k/s on a 1 GHz processor so i need to make some improvements
- improve predecessor check

### October 23rd
- [Another great talk on WNFS](https://www.youtube.com/watch?v=-f4cH_HQU4U) by Brooklyn Zelenka
	- The whole 'ask for permission' thing isn't actually new!
	- Our phones already do this: "Google Photos is asking permission to access your camera roll"
- [New Directions in Cloud Programming](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper16.pdf)
	- The way we write distributed systems today is like writing assembly by hand -- incredibly error prone
	- We need projects like Bloom/Hydro that help with 'compiling away' those concurrency semantics

### October 22nd
- Had a random question about a paper that Kleppmann wrote and just straight up messaged him on Twitter LOL totally not expecting him to respond
	- He did! Within just a few hours and helped to confirm that I did in fact need to sign messages using [[thoughts/Asymmetric Key Cryptography|asymmetric cryptography]] to prevent forgery
- Also, Nalin helped to clarify a lot of my understanding for cryptography which was super nice of him :))
- Finally finished implementing tests for BFT and... it seems to work?? Kinda bonkers that I've been working on this project for almost 2 months now. Probably the most technically involved project I've done that integrates so much stuff I've learned in the past few months in systems design, networking, cryptography, and information theory
	- Just need to finish up hashgraph reconciliation and the JSON aspect of the CRDT and should be good to go
- Thinking about a potential sharded/partitioned design for a triple store DB
	- Using distance metrics like [[thoughts/Kademlia DHT]] does?

### October 20th
- Started writing post on [[posts/bft-json-crdt|a BFT JSON CRDT]]
- Ran into a potential problem with message forgery...
	- Seems like [Kleppmanns's Paper](https://martin.kleppmann.com/papers/bft-crdt-papoc22.pdf) doesn't address cases where, say a Byzantine node tries to send a message *on behalf* of another node (as it knows the unique IDs of other nodes) and forges an update.
	- This is possible as the unique ID doesn't have any other properties that guarantee that only that the node with the ID can send that message.
	- We would potentially need some sort of [[thoughts/Public-key Infrastructure|PKI]] assumption where the unique ID of a node is its public key and the ID is the signed digest of the message
- This is (sort of) confirmed in [Kleppmann's 2020 paper](https://arxiv.org/pdf/2012.00472.pdf)
	- "We assume that each replica has a distinct private key that can be used for digital signatures, and that the corresponding public key is known to all replicas. We assume that no replica knows the private key of another replica, and thus signatures cannot be forged"

### October 19th
- Picked up *Seeing Like A State* again, it feels a lot more relevant to my research now for some reason
	-  We can think of a [[thoughts/RDF|triple store]] as a distributed and fragmented SQL database, where instead of tables with rows and value, we have entities with attributes and values.
		- Any application can declare new attributes or alias an attribute to a more common one
		- The most important part is that applications that share attributes can automatically interoperate their data
			- The harder question is how to build good indices so that when the number of triples grows really large, we still get fast queries
			- I suspect there's a lot to learn from decades of SQL index/query optimizations
			- Would like the syntax to borrow from GraphQL
		- This type of 'decentralized' database means there is no canonical schema. You can't mistake the map for the territory because everyone has their own map and can't force others to view the 'truth' of the world through your map
	- Forcing ourselves into schemas make it hard to innovate
		- To make new things requires us to provide migration paths forward or just accept stagnation
		- It inadvertently shapes what people build -- leads to easily legible/classifiable applications (see: [[posts/digital-identity|post on digital identity and legibility]])
		- It is treading outside the map that gives us innovation
	- This would give us contextual data for app specific data
		- We can see this as analogous to context dependent personalities (again, [[posts/context-collapse|context collapse]] bad)
- Spent a lot of time trying to optimize `bft-json-crdt` to squeeze more performance out of the base list CRDT but to no avail
	- Realizing this was kind of a waste of time as I was just using this is a proof-of-concept
	- Especially if I want to focus on something that's more like a [[thoughts/RDF|triple store]], a list is kind of useless lol
	- Going to focus more on the [[thoughts/Byzantine Faults|BFT]] and JSON-aspects of this project

### October 12th
- Ok well... it's been 3 weeks since I last wrote an update. School has been busy!
- I got really stuck with Rhizome work so I took a week and a bit off to work on [Tabspace](https://github.com/jackyzha0/tabspace) and launched it. It felt good to launch something and 'unstick myself'
- Got more motivation to work on `bft-json-crdt` and started a more methodical approach to debugging (rather than just changing index offsets and rerunning LOL).
	- Eventually pinpointed two bugs:
		- Not accounting for repeated delete elements
		- Not properly updating the internal sequence number
	- Once these were fixed, it kind of just worked! Of course, the performance isn't great but it still happens to be ~4x faster than the base Automerge implementation B))

## September
### September 30th
- I think decision is that going down splay tree route is not worth and I'll just do this using a simple vector LOL
- Been slowly but surely working away at this BFT CRDT implementation in Rust
	- Figuring out some tradeoffs, I already rewrote the crate from using doubly-linked lists to using a splay tree but maybe this isn't the right data structure either
	- Desired attributes
		1. Fast insert at arbitrary location
			- A decent chunk of edits happen in places that are not the start or end of edits!
			- Ideally less than $O(n)$
		2. Ordering in list is a local property
			- It should be easy to figure out location of a node given its ID
		3. Insert time for integrate
			1. Find right position to insert
				- Comparison involves looking up position of parent
			2. Insert
		5. Update should be considerably faster than render (which realistically doesn't need to happen that often)
    - Candidates
		- B-Tree (Diamond Types uses this)
			- Node location is **not** local (worst case $O(\log n)$ indirections)
			- Insert time for integrate
				1. Find right position: $O(\log n)$ amortized
					1. Finding parent is $O(\log n)$ amortized
					2. Overall is $O(\log(n \log n))$ amortized
				3. Insert: $O(\log n)$ (need to recount up the tree)
			- Note: has pretty good cache locality because you can read entire lines of nodes into memory
			- Requires indexing by character position which is not ideal
		- SplayTree
			- Node location is **not** local (average case $O(\log n)$ levels of indirection and potentially $O(n)$ worst case)
			- Insert time for integrate
				1. Find right position: $O(\log n)$ amortized
					1. Find parent is $O(\log n)$ amortized (we can use a binary encoding of the search path as an index)
					2. Overall is $O(\log(n \log n))$ amortized
				2. Insert: $O(\log n)$ (need to rebalance up the tree)
			- Note: rebalancing may not be bad in terms of time complexity but sucks because of memory locality
				- SplayTrees are binary search trees which can lead to some deep trees which require many pointer dereferences
				- Are there $m$-ary SplayTrees??
		- Doubly Linked List (Yjs uses this)
			- Node location is not local
			- Insert time for integrate
				1. Find right position: $O(n)$
					1. Find parent is $O(n)$
					2. Overall is $O(n^2)$ which is slow on many concurrent inserts
				2. Insert: $O(1)$
		- Vector
			- Node location is local
			- Insert time for integrate
				1. Find right position: $O(n)$
					1. Find parent is $O(n)$
					2. Overall is $O(n^2)$ which is slow on many concurrent inserts
				2. Insert: $O(n)$
- Catching up today on a bunch of talks + reading
	- Wonderful [talk by Brooklyn Zelenka](https://www.youtube.com/watch?v=mxkAAtTvcEE&t=10656s) (CTO of Fission)
		- "The limitation of local knowledge is the fundamental fact about the setting in which we work, and it is a very powerful limitation" -- Nancy Lynch, A Hundred Impossibility Proofs for Distributed Computing
		- [[thoughts/CID|CIDs]] give us **global pointers** that we can all agree on (these are hard links, unbreakable)
			- Compared to URLs (soft links, kind of like symlinks, can break). Point to a latest something

### September 3rd
- Bunch of weird Rust things today
	- Generally, use `.take()` on `Option<Box<T>>` and `.clone()` on `Option<Rc<T>>`
	- `.as_ref()` is like `&` but generally acts on the internal reference (i.e. on an `Option<T>`, `&` gives you `&Option<T>` whereas `.as_ref()` gives you `Option<&T>`)
		- Additionally, `.as_deref()` basically is just `.as_ref()` with an additional `.deref()` on the unboxed value (effectively performing deref coercion)
		- `<option>.map(|node| &**node)` is equivalent to `<option>.as_deref():`
	- `Rc::try_unwrap` which moves out the contents of an `Rc` if its ref count is 1

### September 1st
- [[thoughts/CAP Theorem|CAP Theorem Tradeoffs]] and *[A Certain Tendency Of The Database Community](https://arxiv.org/pdf/1510.08473.pdf)*
	- Weaker consistency models that offer fewer guarantees about when the effect of an update might be observed by other members in the system, can offer higher availability, allowing the system to continue to operate while components of the system are offline, where stronger models might prohibit updates when nodes can not communicate
	- A lot of software systems attempt to treat distributed state as **a single system image**
	- But in reality, the world is eventually [[thoughts/consistency|consistent]]
		- Members of the same system exchange information by “interacting”, or sending messages containing information to each other. These messages between members of the system can be arbitrarily dropped and delayed, just like in traditional, unreliable, asynchronous networks.
	- Similarly, the web was able to scale to the scale it did because there is no *authoritative* copy of the web
	- Primary site: main source of truth
	- Designs such as this are very familiar in practice. For instance, Facebook, a large social-network application on the web, has a single user profile for each user that is active in the system. Each of these profiles is replicated across several of their data centers for performance; however, only one data center is deemed the primary site where all updates are performed.
	- However, it would be extremely impractical to have to hear information directly from the primary site every time you needed information. This is why we partially replicate data across databases. Databases are optimizations which makes for extremely efficient distribution of information (scale-free rather than random)
	- What is another model of databases or state machine replication we can come up with? What about one which places each node as its own **primary site?**
		- In this model, each member of the system has some partially-replicated knowledge and some knowledge that they are the primary site for. This information is exchanged between members of the system and merged with each member’s local information: this provides both fault-tolerance, and lower latency in servicing requests for information from peers.
		- As we continue to increase the number of globally connected devices, we must embrace a design that considers every single member in the system as the primary site for the data that it is generates. It is completely impractical that we can look at a single, or a small number, of globally distributed data centers as the primary site for all global information that we desire to perform computations with.
		- Can we build abstractions that allow devices to communicate peer-to-peer, acknowledging the true primary site for a particular piece of information and scale to the amount of information that exists, not only between all computers in a planetary-scale distributed system, but all entities in the universe?
- Rhizome Architecture: now with triple-stores :))
	- Root: identity + persistence layer
		- Standalone app to manage identity + storage
		- Support multiple identities
		- essentially a managed `DID:key` that controls a set of [[thoughts/IPFS|IPFS]] nodes to pin certain things
		- 'open [app] on your computer' type authorization for web applications
	- Trunk: application layer
		- Data framework layer: distributed triple store
			- rust → compiled to WASM for web
			- each node has its own [[thoughts/RDF|triple store]] that is created from an append-only data log
			- each triple contains ID, relation, and value
				- how do we do realllyyy fast triple search? on multiple relations?
				- how do we pack memory efficiently for this?
				- we can 'subdomain' relations (e.g. it belongs to a certain set of schemas or application) using a trie
			- optional `author_id` field to link to Root
		- Query layer: turns the triple store into live views that are interpolated
		- Display layer: uses the views to perform calculations and display things
		- Bring your own data: an application has a specific fingerprint
			- Defines exactly which types of triples it reads/writes
			- Enables you to invite another user to 'bind' to your current application state (similar to 'invite' to collaborate on a document or something)
	- Ditto: publicly contributable schema and API definitions

## August
### August 31st
- What would it be like to build in interpolation into the state replication level?
	- e.g. similar to [Quake 3's Networking](https://www.jfedor.org/quake3/) or [perfect-cursors](https://github.com/steveruizok/perfect-cursors/) both do 3 types of smoothing:
	1. **Interpolation**: If it knows the state of the world at time _t_ and at time _t+50 ms_ and it needs to render additional frames between those points in time, it interpolates the positions of all visible objects between their known two states.
		- That means that when the client is rendering the frame at _t+16 ms_, it already needs to have received the information about the server frame from _t+50 ms_!
		- The only way that is possible is if the client intentionally delays its view of the world in relation to what it’s receiving from the server.
	2. **Extrapolation**: What happens when the network packet containing the next snapshot is delayed or lost and the client runs out of states to interpolate between? Then it’s forced to do what it normally tries to avoid: extrapolate or guess where the objects will be if they keep moving the same way they’re currently moving.
	3. **Prediction**: The only exception here is player input. Instead of waiting for the server to do that and send back a snapshot containing that information, the client also immediately performs the same player movement locally. In this case there’s no interpolation - the move commands are applied onto the latest snapshot received from the server and the results can be seen on the screen immediately. In a way this means that each player lives in the future on their own machine, when compared to the rest of the world, which is behind because of the network latency and the delay needed for interpolation.
- See also: [GGPO](https://en.wikipedia.org/wiki/GGPO) which is heavily used in real-time fighting games

### August 30th
- [A Graph-Based Firebase](https://stopa.io/post/296)
	- Turns out most modern real-time applications look something like this:![[thoughts/images/modern-app-architecture.png]]
	- SQL seems to be too complex. The common request for data in front end is a complex case to express to SQL. "We shouldn’t need advanced features for common cases."
		- The most common query is our “fetch nested relations”. This should be supported first class
	- We can potentially emulate this using triple stores built on top of an append-only CRDT. Datalog and triple stores have been around for decades. This also means that people have built reactive implementations.
	- Unsure if we can leverage [[thoughts/CALM Theorem|CALM]] as its Datalog but *not* monotonic (facts can be retracted)
- DAG instead of append-only log
	- "Both of these abilities follow directly from the explicit embedding of causality into a DAG, with time travel being analogous to a traversal over that graph" [Dialog](https://fission.codes/blog/fission-reactor-dialog-first-look/)

### August 23rd
- Phillip Wang's talk -- related to [[posts/the-fools-who-dream|reflection post]]
	- tldr; We should leave space in our lives for finding conviction in things we work on
	- How do we enable the "other" path for high achievers? Not the one where they can just work at a big company, get paid lots of money, life a cozy life, but the harder path in which they truly question the *why* and ask themselves what they find truly fulfilling
	- Fully commit to one thing -- deep beauty in choosing, against [[thoughts/optionality|optionality]]
		- How does this fit into the [[thoughts/exploit explore|exploit-explore]] tradeoff?
		- Feels like there's a necessary balance between
			1. being deeply invested in something to be able to have a level of almost unwavering conviction
			2. not being so deeply invested that you are oblivious to exploring better potential options
	- Leaving space to have conviction is inherently a privilege, how might we enable local spaces of abundance (places for [[posts/play#A re-worked definition|play]]) so that more people have that privilege?
		- This also feels like a generational thing. My parents first immigrated to Canada when I was around 3. They've spent a big chunk of their lives worrying about how to meet basic survival needs
		- I grew up with enough resources around me that I've begun looking for what I have conviction in; what I feel invigorated by 

### August 22nd
- Justin Glibert's talk
	- tldr; composability + permissionlessness enable novel affordances we haven't seen before in digital systems
	- Coordination in the universe is limited by how much you can observe. That means a globally consistent *anything* will be limited by the speed of light
		- Problematic for global (and potentially inter-planetary) communication
		- Great thing about local-first is that you don't need to know anything about the other side of the world when doing stuff locally
	- What if... [[thoughts/Kademlia DHT|Kademlia-like]] XOR distance metric but for [[thoughts/State Machine Replication (SMR)|SMR]]
	- Permissionlessness is an important characteristic to enable innovation and [[thoughts/emergent behaviour|emergent behaviour]]
		- See also: [Simon Harris on the same topic](https://simonsarris.substack.com/p/welcome-ghosts)
		- "Many tales exist of [the origin of the bistro]. Some say it was working-class landlords opening their kitchens for extra income. Others say it was the Auvergnats, immigrating to Paris from what is today central-south France, who first worked as rag-pickers, then wood and coal sellers, then metalworkers, who created small working-class restaurants to supplement their income. Either way, it was not planned or engineered, but simply not-disallowed. There were no rules in place to stop this invention."
		- Same with YouTube which started out as a dating app but then let people upload anything. The _users_, not the website creators, found its real uses
		- Does this conflict with the fact that good DX/UX comes with strongly opinionated use cases?

### August 19th
- Packing and flying back to NY for Hack Lodge! Will be posting an ongoing thought stream :))

### August 18th
- Preparing workshop notes to talk about [[thoughts/computer networking|computer networking + P2P]]
- Feelings rant -- I feel an odd and unusually heavy sense of impostor syndrome today. Going to write out more stuff in [[posts/the-fools-who-dream|this blog post]] I'm going to flesh out
- Frustrated by [this video by one of the founders of the Browser Company](https://www.youtube.com/watch?v=v0160IirdL4)
	- Their vision is that the 'next generation' of computers -- after the mainframes and personal computers -- is the *internet computer*, where everything we do happens in the cloud and our machines are just dumb portals to access these
		- We can't be going back to time-sharing! Time-sharing was only a thing because we didn't have access to powerful enough consumer hardware -- this is no longer the case
		- Not only do you need to always be connected to the internet to use it, it is also incredibly Orwellian except with all-powerful companies instead of states which have detailed metrics into how you conduct every moment of your digital lives
	- Josh seems to be conflating [[thoughts/local-first software|local-first software]] with software that is not connected to the internet
		- Just because our data lives locally on our device, does not mean your work is trapped on one device
		- I think the future is a happy middle between completely offline and completely online -- we've pendulum-ed to both sides of the spectrum and are perhaps settling on the reasonable option
			- Servers have a role to play in the local-first world — not as central authorities, but as “cloud peers” that support client applications without being on the critical path. For example, a cloud peer that stores a copy of the document, and forwards it to other peers when they come online, could solve the closed-laptop problem.
	- "Nobody makes native apps anymore"
		- People want the *performance* of native apps without having to maintain many codebases across them.
		- As more and more apps become 'internet-first', libraries for storing things locally and reconciling them with remote copies of that data have not made nearly enough progress.
		- As a result, many 'native apps' are just wrappers for a single source of truth that lives on a remote server. This is not ideal in terms of many things but mostly performance and data ownership.
	- In a million years time when they dig back down in the archive history of our digital footprint, they won't see vibrant replicas of the web but rather a digital dark age.
		- The documents created in cloud apps are destined to disappear when the creators of those services cease to maintain them.
		- Cloud services defy long-term preservation.
		- No Wayback Machine can restore a sunsetted web application.
		- The Internet Archive cannot preserve your Google Docs.

### August 17th
- Really diving into whether a dual optimistic replication (CRDT) + transactional replication (Raft SMR) approach is needed or if one will do
	- Optimistic replication
		- Best for global collaboration. Local nodes can still be speedy even with collaborators from across the world
		- Can lead to inconsistent states if not careful (again, can use a DSL to help catch these types of errors but it just becomes difficult to write and will require extra research time)
			- Alternatively, have no global invariants. JSON-style data structure
		- Strong eventual consistency data stores (e.g. CRDTs) will hit a few million TPS per second locally for sticky writes with actual TPS being roughly $\frac 1 {RTT}$ (where RTT is ~500ms at worst, ~150ms usually)
		- Bandwidth use is $n$ (just send to all nodes)
		- Latency is $\frac 1 2 RTT$ (don't need to wait for reply)
	- Transactional replication
		- Easier to reason about for application developers
		- Atomic commit-type data stores (e.g. SQL, CockroachDB) still achieve upwards of 28k TPS in a single-region zone. In a global environment, TPS will be roughly $\frac 1 {2RTT}$. This means that if you have a very global team working on something, synchronously collaborating something will still be quite laggy (~1TPS). Doesn't work on an 'inter-planetary scale'!
		- Bandwidth use is $r n^2 + 1$ where $r$ is number of rounds of the consensus mechanism
			- $1$ for initial request and $r$ rounds of $n^2$ communication between all nodes (overhead can be reduced to $rn + 1$ if normal state is $O(n)$)
		- Latency is 
	- Hybrid
		- Best of both worlds, but the most complex to reason about and write programs for
		- Alternatively... what if we expose a simple KV store using CRDTs to exchange routing info? This would open it to easily layering real-time applications on top (e.g. video calls, WebRTC). This eliminates the need for a signalling server
			- This can technically be done already by the user in transactional replication model if they want
- Addendum: the [[thoughts/CALM Theorem|CALM Theorem]] conjectures that if program state can be expressed in monotonic Datalog, it can safely use optimistic replication. If we can always express something using an immutable Merkle-DAG with occasional consensus for GC, shouldn't this work? 
- Have one SMR instantiation of the SMR algorithm per application
- How do we do live reconfiguration of cluster quorum size?
	- https://users.ece.cmu.edu/~reiter/papers/2000/DSN.pdf
	- https://www.alibabacloud.com/blog/raft-engineering-practices-and-the-cluster-membership-change_597742

### August 16th
- Finally made my way through all my research papers. There's a weird peace to have no open browser tabs, down from around ~75 open
- Thinking about [[thoughts/access control|access control]] and revocation. Especially for add-only data structures, how can we prove data has been deleted or removed?
- What is the base metaphor we should use when building applications?
	- A chat except the base unit is not text but structured data. Call this the 'event history'
	- This implies a certain causal history and a partial ordering
- Trunk
	- User defines
		- `data Op = ...`: All possible operations of the app
		- `data State = ...`: Application state
		- `r :: State -> Op -> State `: The reducer function
		- `s0 :: State`: The initial state
	- How is state persisted?
- Root
	- Identity
		- A `did:key` is generated for every history
		- One root IPFS document tracks all active `did:key`s associated with a root DID
	- The [[thoughts/Merkle-DAG|Merkle-DAG]] will be anchored using IPLD, this means that hopping cloud providers is easy as everything is [[thoughts/content addressed storage|content-addressed]]
	- Storage Providers
		- Providers should pass a suite of unit tests for correctness in terms of satisfying certain behaviour.
		- With this model, all a storage provider needs to do is pin a few CIDs
	- This takes care of data availability... but what about liveness? This is where SMR comes in
- Ideal [[thoughts/State Machine Replication (SMR)|SMR]] algorithm properties
	- Favour liveness over consistency when potentially majority replicas are offline (i.e. handle all cases $f < n$ in asynchronous crash-stop model)
	- Should scale well with number of participants
	- Synchronization should *not* be on the critical path (read: CRDTs where possible, consensus otherwise)
	- Collaboration over consensus (i.e. try to preserve user intent where possible)
	- Things to figure out
		- When is it safe to GC?
		- Is it worth writing a DSL that compiles down to different host languages? This could be really useful to provide helpful compile-time checks
			- Basically to adhere to [[thoughts/CALM Theorem|CALM]], we want to make it easy to write synchronization free code (similar to Rust and how it makes it easy to write GC-free code)
			- Generate the appropriate boilerplate for code that requires synchronization
			- Have a good standard library of data structures that are primarily synchronization-free
- Potential demo apps
	- Basic chat app
	- Google drive/Dropbox clone (testing large op/diff sizes)
		- Tool for thought, Google Docs-like writing primitive (testing permissioned access and collaboration)
	- Semantic diffing, live `git`
	- Minecraft or other real-time game (testing latency)
	- EVM (testing expressiveness)
	- A browser... with editing and hosting of local-files baked in
		- co-creating websites live, similar to [Beaker Browser](https://docs.beakerbrowser.com/)

### August 14th - 15th
- Organized The SF Commons: Hack Day #0 with Athena! A non-zero number of people were like "Hey! I've read your blog before" or "I love the work you do" and it was a little surreal

### August 13th
- Visited the Computer History Museum today! Lots of interesting tidbits on how we got to where we are today
	- If economies of scale favoured large consolidated computer systems how did the personal computing revolution happen?
		- One reason is that the main bottleneck to adoption back then was the price. But as Moore's Law continued to hold, hardware became exponentially cheaper due to innovations in chip design, manufacturing, storage, etc.
		- People started buying it because companies like Apple started branding personal computing devices not as something reserved for only programmers and geeks:
			- "Since computers are so smart, wouldn't it make sense to teach computers about people, instead of teaching people about computers?"
		- There were magnitude level improvements over existing technology. The census for example, took 10x-100x less time using computers
	- How can this be applied to the moving away from large, consolidated, monolithic applications to the personal application era?
		- "Why is it so hard to own my own hardware?" roughly translates today to "Why is it so hard to own my own data?"
	- Explaining data availability like the differences between calling versus texting someone
		- Calling means that the other person needs to pickup
		- Texting means that you can still communicate without both being on a call

### August 12th
- [[thoughts/CALM Theorem|CALM Theorem]] and [[thoughts/CRON Theorem|CRON Theorem]]: Basically, avoid coordination where possible, it makes things slow. When we can avoid or reduce the need for coordination things tend to get simpler and faster. This theorem tell us when it is safe to avoid coordination.
	- I wonder if there's possibility here to write a DSL (perhaps similar to BLOOM) that compiles to JS/Rust/etc. but also checks for monotonicity properties.
	- Similar to that Quilt piece on why hiding network complexity in APIs is bad, perhaps baking in these inefficiency warnings (i.e. warning on 'accidental' coordination, is there a way to refactor this program to use a different set of data structures which don't require coordination) into the language

### August 11th
- Notes on [[thoughts/Braid HTTP|Braid HTTP]], [[thoughts/Yjs|Yjs]], [[thoughts/Secure Scuttlebutt|SSB]], [[thoughts/OrbitDB|OrbitDB]]
- Quilt has a [great piece](https://writings.quilt.org/2014/05/12/distributed-systems-and-the-end-of-the-api/) arguing for more CRDTs and why APIs are lacking and what the next logical step is
	- Put more simply, going back to picking on APIs, what will complete this analogy? `assembly/C : Java/Python/Clojure :: APIs : ???`
	- To quote Leslie Lamport: "Most people view concurrency as a programming problem or a language problem. I regard it as a physics problem."
	- Sadly, looks like the project is no longer maintained

### August 10th
- Notes on [[thoughts/HotStuff|HotStuff]], [[thoughts/HoneyBadgerBFT|HoneyBadgerBFT]]. HotStuff seems to be a really useful lens to analyze future protocols as it is a general framework for expressing [[thoughts/Byzantine Faults|byzantine fault-tolerant]] [[thoughts/State Machine Replication (SMR)|SMR]].
- Lots of paper reading... I feel a little burnt out. I've been spending almost 15h days just trying to mental sponge as much as this as I can.
	- I think I'm getting enough sleep and my eating habits aren't terrible but my body seems to disagree. My eye sometimes just twitches randomly and my stomach has a certain tightness to it that I can't really describe well.
- A bit of a slump day. Really spent the last month just reading about consensus protocols in *partially synchronous system models* only to discovery that what I was really looking for was consensus protocols in *completely asynchronous system models* (which handle cases where potentially majority replicas are offline).
	- I realized this as I was digging into the very last PDF I had in my browser tab on consensus algorithms -- the last of 50 or 60 odd papers I made my way through.
	- In this last paper, I found out about the [[thoughts/LR Permissionless Result|LR Permissionless Result]] which was derived earlier this year in February. It rules out the possibility for deterministic consensus in a Byzantine, permissionless model, which voids my current assumptions about the right type of consensus model for Rhizome.
	- I don't think the research and learning went to waste per-se, I feel like I really learned a lot, but it sure feels like that whole month went to waste -- none of the protocols are of any direct use to the project. I just feel incredibly frustrated.
- A summer retrospective. Anson encouraged me to write a more in-depth reflection on my research processes. I mentioned on a call that I felt unhappy with my progress this summer. I think the bulk of it comes down to doing way too much reading and not enough building and producing things.
	- A large part of this I think comes down to underestimating just how much I didn't know about the space to begin with
		- Every paper I read opened 2-4 new ones. An unknown concept or definition meant another day or two to get familiar with the literature surrounding it. It wasn't until a month ago that the number of tabs I had open started to go down.
	- It feels like the attitude I'm taking towards research is one of bumping around in the dark. For the most part its enjoyable and exhilarating, finding things out for the first time.
		- There's a certain joy to putting yourself in an environment where you can discover things for yourself. I can ask for help when I need it, but most of the time I'm puttering along at my own pace.
		- This is roughly what my self-satisfaction curve looks like for self-motivated exploration:  ![[thoughts/images/self-exploration-satisfaction.jpeg|400]]
		- This is usually fine, but when I look at it *instrumentally*, just from a perspective of how much I've actually got done, I'm a little disappointed in myself.
		- I've decided that I'm okay with it. I'm not trying to any% speedrun my work. I want to be able to enjoy research for what it is, to visit unexpected results and learn what I find intriguing about it.

### August 9th
- Finished reading [[thoughts/Weaving the Web|Weaving the Web]]! Probably my favourite non-fiction read so far this year. Was supposed to just write up quotes but instead wrote a 1.2k word History of the Web piece instead :')
	- It gives me hope!! Trying to change deeply intrenched habits is hard. Getting people to see the potential is hard. But there are so many people working on this and putting their whole hearts and souls into the projects they believe in that I can't help but believe it'll work out.
	- To quote from Tim Berners-Lee: "When I try to explain the architecture now, I get the same distant look in people's eyes as I did in 1989, when I tried to explain how global hypertext would work. But I've found a few individuals who share the vision; I can see it from the way they gesticulate and talk rapidly."
- Rough notes on [[thoughts/Casper FFG|Casper FFG]], [[thoughts/SBFT|SBFT]]. Revising notes on [[thoughts/PBFT|PBFT]]

### August 8th
- I want to target 60 updates per second (~16ms budget) for local and 10 updates per second (~100ms budget) for global updates
	- This is a good target to aim for but also wary of premature optimization
	- Will likely need to just build stuff out first and experiment to see if it is usable
- Spent some time restructuring all my notes around [[thoughts/cryptography|cryptography]] to have better note and concept separation
- Reading more about [[thoughts/IPFS|IPFS]], their BitSwap protocol for block exchange is a super cool case study on how to do incentive design.

### August 5th - 7th
- Went to [Hackclub Assemble](https://assemble.hackclub.com/) and was just inspired by the magnitude of talent of the next generation of hackers and builders. Zach (+ Sam and rest of the HC team) really blew it out of the park this time. The theme was to build something completely useless and the kids went wild with it. I still strongly believe that one of the best signals for someone who *deeply* and intrinsically cares about technology is one who can still play and tinker for the hell of it.
	- In a similar vain, I'm organizing a Hack Day at [The SF Commons](https://www.thesfcommons.com/) on August 14th! A little callback to my hackathon organizing days :)) Really hoping to bring this new space to life with this event
- Reading **Weaving the Web** by Tim Berners-Lee. More thoughts on this coming soon, but tldr; it is reassuring to hear that it took almost 13 years to combine the Internet and [[thoughts/hypertext|hypertext]] together to conceptually create the Web. Even then, it took a lot of trying over many years to bring adoption for something that many didn't really see as potentially revolutionary
- Reading through [[thoughts/PBFT|PBFT]] paper, really trying to understand the correctness and [[thoughts/liveness|liveness]] proofs

### August 4th
- Random thoughts:
	- What if messages were doubly-signed with the hash of application source? This would mean that all events are specific to application version.
		- Holochain cites that this may be a problem: "unfortunately anyone can modify their own source chain, regenerate the hashes and signatures, and create a perfectly valid, but wrong, alternate history for themselves."
		- However, this is actually a non-issue, given we split this into two cases:
			1. Single-player App: whatever the user does is 'correct' behaviour anyways, what does it mean to have a wrong alternate history when you are the only person dictating it? All actions will still need to be in the domain of valid actions as dictated by the app (otherwise, message signature would not add up as we sign messages with the hash of application source).
			2. Multi-player App: peers will have a hash of the last known action of a user. If the action history is completely rewritten, the probability of arriving at the same hash is negligible, meaning that the peers will reject any further actions as invalid.
		- This brings up a new question of what migration paths look like between old and new versions of applications. If we go by hash of application source, then each update to the source code will seem like a completely new application!
			- Each application perhaps can be signed by an author. If a newer application by the same author claims to be an update for the existing application, it can propose an upgrade path to interpret the older data in a usable format for a new one, essentially 'importing' the data in
	- Good furniture and architectural choices respect user agency, allowing those in the space the ability to move around at will. How might we analogize this to software? [[thoughts/digital commons|Digital commons]]?
- Read through [[thoughts/Holochain|Holochain]] docs which are actually quite similar to what I have in mind for Rhizome.
	- Really liked
		- Using [[thoughts/RDF|RDF]] triples in a [[thoughts/DHT|DHT]] to create a distributed graph database is a smart way to network the data -- feels like what semweb was supposed to be
		- Everything is self-owned and consistency of application state is maintained by storing hashes of actions to a global [[thoughts/DHT|DHT]] which allows for peer accountability
	- Things that I think are unaddressed
		- Documentation was well-written but the terminology was confusing at times. Was not immediately obvious what part each piece played
		- How important is global data-witnessing? Why do we need social pressures for this when we can do this using [[thoughts/cryptography|cryptography]]?
			- This also means that progress cannot be made until a node is back online (otherwise, actions remain unvalidated)
		- Problem of getting people to migrate off of existing platforms remains unsolved
		- Developer experience is difficult to set up and get started (see [HApp setup docs](https://developer.holochain.org/happ-setup/)) -- heavy use of technical terminology

### August 2nd - August 3rd
- Learned a lot about [[thoughts/Network Theory|Network theory]]
	- Expanded more on thoughts about the inevitability of centralization with more insights from advantages and disadvantages of scale-free networks compared with random ones
	- Also notes on [[thoughts/cascading failures|cascading failures]], interesting to note that sometimes the most effective way to stop a failure is to prematurely kill edges and nodes (e.g. burning parts of the forest ahead of a forest fire to clear debris in a controlled manner)
- Stressed about what to do for the upcoming gap term/year!! 
	- Things that are weighing on my mind:
		- I want to graduate. Most visas other than the O-1 visa require at minimum a Bachelor's degree so this is definitely something I'm thinking about. Also, a lot of highly technical jobs are (unfortunately) still gated by degrees so having at least a Bachelors is useful in that regard.
		- I want to be able to spend the *at least 3-6 hours per day* thinking about this research project. I really think that given I have the financial means to pursue research full-time I should. A younger version of me once said that if they found an idea that excites them when they wake up every morning, they would pursue it without fail.
	- School Situation: I need 2 more 4xx+ Computer Science Courses and 5 more 3xx+ Electives to graduate. Problem is that it is wayyy past course registration time to jig things around so either:
		- I keep my current course schedule (stay on track to graduate next May)
		- Unregister from all my courses (push back graduation date to next fall or 2024 May)
	- Research Situation: Although the research grant is no-strings attached, I really want to be able to output good work that I am proud of. Plus, the people at Protocol Labs are super cool and I want to be on good working terms with them for potential future collaboration.
		- I think summer research has been literature review era and once next semester starts, it will mostly be building things out.
	- Other thoughts: in my [[posts/2021|Letter to my Future Self]], I mentioned I wanted to reach deep focus in whatever work I do and have the resources to be able to choose the work I find enjoyable. I'm not going to half-ass do whatever, so it will either be full-send research or full-send finishing school.
	- Options
		- Keep current class schedule and try to move research to after graduation
			- Not nearly as interesting as working on research
			- Will graduate on-time in May!!
			- Less long-term stress about returning to school to finish things
			- **I think I'm going to choose this option!!**
		- Gap year to purely focus on research
			- Output research work I am proud of, keep good relations with Protocol Labs
			- Keeps research momentum going, will be more effective than picking up the project a year from now
			- Will need to go back to school which will feel like I'm set back a year

### August 1st
- Gordon Brander deep-dive today... more thoughts on the [[thoughts/inevitability of centralization|inevitability of centralization]] and [[thoughts/credible exit|credible exit]]
- It seems we are reaching that 'recentralization' step of the decentralization-recentralization cycle, with power concentrating in the infrastructure and application level.
	- Gordon proposes abolishing the `same-origin` policy. His thesis is that this forces resources on the web to be centralized around the ownership of domains. Everything -- security, privacy, identity, data, and scripting -- needs to be provided by the same origin, unless explicitly set otherwise. The 'hub' here that everything goes through is the domain. We've arrived back at the original centralized hub model of the internet.
	- How we can learn from the leap that Baran made going from circuit switching to packet switching and apply it to this new layer of the web? In the words of Gordon: "Can we imagine a new weblike thing that is to the web as packet switching is to circuit switching?"
- Content-addressing feels like a viable alternative to how loading resources works on the internet today.
	- Address-based addressing relies on a central registry to figure out where things are. [[thoughts/content addressed storage|Content addressed storage]] (e.g. [[thoughts/CID|CIDs]]) *decouples* the data from the origin. If you know what the hash is, you can request the original file, irrespective of where the file actually lives.
		- There is no single domain hosting your file.
		- Many copies of your file exist across the network. This redundancy keeps things safe in case of failure.

## July
### July 30th
- I think I'm going to take a gap semester from September to December to give myself the time to finish the research to a level I'd be happy presenting to Protocol Labs at the end of the year.
	- Never thought I'd *actually* take a gap semester but here I am... looks like I might graduate late now LOL
- I want to spend some time thinking about how to create effective learning and research communities. I know that since I started working in the public hackerspace at Incepto, my productivity has gone up something like 5x. How do I *geographically* surround myself with people that constantly inspire me to work on ambitious things?
- On a whim, read this awesome [Patreon post](https://www.patreon.com/posts/ratcheting-in-47976114) by Andy Matuschak
	- *Ben Shneiderman, a pioneering human-computer interaction researcher, offers this charming schematic for research project design in The New ABCs of Research. He calls it the “two parents, three children” pattern.*
	  ![[thoughts/images/research project pattern.png|500]]
	  - I've been thinking more about how research seems to come in two layers
		  1. The ideas
		  2. The language in which it is expressed
	  - Majority of my time has been on refining 1. so that 2. may come easier, but perhaps both should be worked on in concert. 

### July 24th - 29th
- Roadtrip! Had a really fun roadtrip with Anson, Joss, and Jaclyn from SF to LA. Stopped at a million beaches, observed some stunning sunsets, surfed for the first time, ate great food, and sang lots of songs. Learned about 'Surfboard' by Cody Simpson which was the trip themesong.
- On July 25th, I heard back from Protocol Labs and got my first large grant for 20k for the next 4 months!!! 
	- I think this support will mean a lot for the project. Protocol Labs is incredibly values aligned and they have some of the brightest minds thinking about similar problems. Even just being in an environment where I know I can expect feedback from these people (not to mention financial support) feels like a major milestone
	- I really loved how they have an RFP-000 which is an 'open-call' for research that may not fall any other current category
	- They are strongly encourage I have more 'traditional' research outputs, which I think makes a lot of sense! This will give me more exposure to the more 'academic' side of research as
		- An open-access paper or brief technical report (e.g. submitted to arXiv)
	    - An open-source code library with good documentation
	    - A recorded, shareable presentation of the work, preferably as part of our research talk series (!! this is really exciting).
	    - A blog post describing the impact of your work to be featured it their [research blog](https://research.protocol.ai/posts/).
	- I especially love how the grant is 'no-strings attached'. I think this really incentivizes honest behaviour and reporting of *true outcomes* rather than encouraging fabricated results or demos to get funding.
		- "**Unsuccessful projects**. Our interest is in accelerating science for the benefit of all. Naturally, over time we will be more likely to fund proposals from active and effective members of our community.  However, we understand the complexities of research and do not revoke payment if the work changes course, is unsuccessful, or reaches a dead end. We value great results but also understand the value of exploration and impossibility results."
- My passport is about to expire so I will need to be in Canada for fall :(

### July 22nd - 23rd
- Finished up the [[posts/digital-identity|identity piece]]! Cent and B from Metagov gave some very good advice and clarifying feedback on the piece.
	- I think the essay was trying to do too much so I'm going to split out the content and keep all the stuff about agency and legibility in this one.
	- I want to write another piece eventually about different ways of being online (specifically, collective inter-being vs individualism)
		- The new atom of identity is not a single entity but a set of relationships. A group chat. A chat that isn’t just a text messaging history but can embed applications and rich worlds on top of it.
		- Elaborate more on groupchat as an entity
- I have a bunch of reading piled up this week since I've been doing a lot of writing so I'll focus on getting through some more stuff today and tomorrow.

### July 21st 
- Polishing up [[posts/digital-identity|identity piece]]. I've worked on it enough that I'm starting to feel ick just touching it but I'm happy that I've thought about this deeply. Implications for Rhizome as a whole:
	- Self-sovereignty seems useful for agency *if implemented in ways that don't force legibility*
		- e.g. be careful about [[thoughts/Verifiable Credential|VCs]] without zkSNARKS
	- Probably will need to think more heavily about how to model a relation history on the dev side of things as people are used to modelling individual users. Perhaps phrasing the basic item as a *group chat* makes sense?

### July 20th
- Finally got the piece to a place where it is ready for feedback. B, Shrey, and Saffron took a look and left a bunch of comments which identified plenty of spots where either my reasoning was flawed or just wasn't good.
	- Revision time !! 🙃
- Feel like I haven't been very proactive in thinking about funder relations.
	- Found out today that GitHub has a very handy feature to email all of your sponsors!
	- Will probably draft up a short update email and include a link to the identity piece as soon as it's done.

### July 19th
- Slowly reaching a place where I'm happy with the direction of this piece on identity, framing it more around 3 modes of thinking about [[posts/digital-identity|identity]].
- Got a comment from Zoë Ruha Bell on my essay in Reboot that asked about "the complexities of how moving data between contexts changes its meaning and that individual control over data may not match up well with the relational information encoded in data"
	- Incidentally, this is exactly what I've been thinking more about! My response:
	- This is a great question and I'm still grappling with (and in the midst of writing a whole other piece about!). Data in context is incredibly important. Like identity, when taken out of context, it can be incredibly harmful and misused. Pursuing interoperability without considering the intention behind the actions that data encodes can easily turn dangerous very quickly.
	- One way I'm thinking about this is analogizing the multiple facets and contexts of data as people. Just as people behave differently in different contexts, so can data. The same reason we have so many 'alts' or 'finstas' is that this multifaceted-ness isn't accommodated by existing media platforms. Data platforms similarly treat data as single faceted. What does a multi-faceted encoding of data look like? What does communal ownership of data look like?

### July 18th
- I've been trying to write down some more cohesive thoughts around [[thoughts/identity|identity]] for the past two days and running into a block where I'm struggling to articulate why and how real world identity and digital identity differ
- Just read this blog post on [Going Doorless](https://rosano.hmm.garden/01evv3hq1ak4b6ng1jzppx5n2j) that really resonated and gave new language to ideas and concepts that have been floating around in my head for a while
	- Public commons like parks and libraries feel public because moving around in them is effortless
		- We don't have commons because the space between digital spaces have the viscosity of honey. Movement becomes heavily disincentivized.
		- To be clear: I mean that *people* should be able to move freely. Data should have access control switches exposed to users. They should decide whether it moves freely or not. "after voluntary communication to others, free as the air to common use"
	- You shouldn't need to pay or set up and account to walk through the gates, commons just let you show up and start using it
	- Software is the principles of an experience, your data is just the details

### July 16th - 17th
- Currently on a two-day writing retreat with Belinda, Athena, and Vincent. It's been such a good mix of sight-seeing and focused writing.
	- The other choice of spending this weekend was to go to an Art Book Fair and assemble furniture with friends. In all honesty, I'm very glad I chose to focus and write over just socializing.
	- Some good time away from purely technical reading meant I had time to think more about identity. More thoughts around [[posts/digital-identity|verb based identity]]

### July 15th
- Part of the nail of my left pinkie ripped off today argH it is now painful to type :((
- Realized that when doing site redesign, I lost a commit's worth of notes (sad) but also Obsidian Sync which I normally use for backup *also* expired today (double sad). Not as bad as it could have been though! Thankfully I commit often :)
- Spent a lot of time just reading today, a lot of different scattered blogs that I've been meaning to get to. [One link that was sent](https://generative-identity.org/human-identity-the-number-one-challenge-in-computer-science/?curius=1294) in the Metagov Slack particularly stood out to me though. It was on human identity and, more specifically, a critique of specifically [[thoughts/Self-sovereign Identity (SSI)|SSI]]
	- Long read but I think it captures a lot of my thinking around why I think [[thoughts/digital permanence|digital permanence]] is scary (and why I've been thinking about relational notions of identity!) TLDR;
		- The concept of identity is very noun-like (i.e. tied to physical traits and current state) in Computer Science + software systems
		- Contrasts with identity as verb-like (i.e. incredibly contextual, based on who you are with, how you are feeling, what experiences you have)
			- "The joins are the pathways for information exchange and transformation, for organising, and the expansion of organisational identity. Joins give the dots their meaning, their contextual relevance, their identity, just as dots give the information exchange direction and potency."

### July 14th
- Reboot published my research proposal / manifesto / essay on Rhizome and data-neutrality today!
	- [Check it out on Substack](https://reboothq.substack.com/p/rhizome)
	- Ben Tarnoff, the guy who cofounded Logic, actually read and [tweeted about it](https://twitter.com/bentarnoff/status/1547619611796914179) and readers seemed to resonate a lot with the post!
	- Two general sentiments:
		1. This project seems really exciting and I appreciate it recognizes existing work. What will get people to use this though? The social difficulty with "apps as a view over data" is that it requires users to understand data models and this consensus over data models has proven difficult
			- I agree with this evaluation and so far, feels unsolved. I think a promising solution is to think about it like how community-sourced types for TypeScript work. There's a whole open-source project that wildly popular that provides TypeScript definitions for plain JS libraries called [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) (with over 12.6 million usages!). I think there's a potential for this to work with data schemas as well
		2. Well.. crypto/existing-thing actually solves this! Blockchain scaling techniques are getting pretty good, don't see why this work is necessary.
			- Again, true. I think these new technologies all seem really promising and I definitely try to keep up with all the developments in the space but my main concern comes from how convoluted these solutions are slowly getting.
			- A lott of smart people in crypto have been working on these problems for a while, I'm starting to think it might be easier to tackle it from the other side. Plurality of approaches y'know :))
- nobody: ...
   youtube: https://www.youtube.com/watch?v=g7MSfHEdxXs
- Going to read more about [[thoughts/causal tree|causal trees]] as a way of understanding more basic forms of [[thoughts/CRDT|CRDTs]] that value readability over correctness

### July 13th
- Feeling a little tired of just reading papers and coding
- Going to do a mental reset and just play piano for a while and then doing that person website redesign that I've been thinking about for a while now...
	- Update: this is so fun gah
	- Realized that the typography on the old site was kind of garbage and hard to read. Spent a bit of time reading up on good typography practices and it looks soooo much better

### July 12th
- Ok, a bit of a wrench in the system : ' )))) CRDTs are incredibly hard to reason with for the average dev and *cannot guarantee global invariants* without requiring consensus.
- Finished up CRDT implementation collection over at [[thoughts/CRDT Implementations|CRDT Implementations]].. I feel like I'm getting a better grasp at how to write op-based CRDTs but less so for state-based

### July 11th
- Seems like there are a lot of open research questions in CRDTs that I could plausibly spend *years* working on (e.g. undo operations in CRDTs, encrypted CRDTs using homomorphic [[thoughts/encryption|encryption]])
- I need to read more about this but it seems like most traditional consensus algorithms require synchronicity from all nodes for them to be considered honest. I wonder how we can reconcile this methods like CRDTs that allow for more asynchronous forms of consistency
	- Is it possible to take advantage of the partially synchronous [[thoughts/system model|system model]] and having CRDT-like behaviour in async modes and Raft/Paxos-like behaviour during synchronous periods for compaction
	- This is especially important as users will rarely have all (or even supermajority) of their nodes online at any given time. Will need to look into variations on Raft that tolerate live membership changes
		- "The network can partition and recover, and nodes can operate in disconnected mode for some time."

### July 10th
- A lot of good meditations on adoption of tech that gives agency to users at a Hack Night that Rishi hosted :))
- Currently at another session of the writing circle. Good to probably zoom out from a lot of the technical in-the-weeds work and re-orient about what this means for the average consumer
- Do people care about data ownership and data agency?
	- The average user probably doesn't. They want convenience and are comfortable with current options.
	- But as a counterpoint, if you ask anyone on the street whether they would be comfortable sharing their entire browsing history right there on the spot, my bet is that ~95% of people will say no
		- This could be a really fun social experiment: incrementally increase the amount you offer strangers to look at their browsing history
		- How much does the average person value their [[thoughts/privacy|privacy]]?
	- Another question is why having a *real person* snoop on your data feels so different than large companies snooping and *profiting* off of your data
		- I suspect a large part of this is due to learned helplessness
		- We haven't ever really known what it is like for companies *not* to be doing that
		- It feels abstract! A company remotely snooping on your data is something that a user could remain fully blissfully ignorant from
	- I think people don't care because they haven't known what a possible future could look like
		- People don't ask for cars because all they've known in their lives are horses. They can only think of faster horses
- How do we convince the average consumer that this is something worth caring about?
	- Near zero-friction doesn't necessarily people will want to switch to this new paradigm. It is still a non-neglible activation energy to move platforms
	- This probably won't happen unless there is both 1) a radical *push away* from existing centralized platforms and 2) a strong and convincing *pull towards* new decentralized platforms like Rhizome
		1. This is where I think regulation, anti-trust, and legal requirements for data usage transparency are incredibly important! There are institutions just as powerful as these large tech companies that can serve as a counterbalancing force too
			- This still feels incredibly difficult as these tech companies have started invading these regulatory bodies and holding immense lobbying power
		2. We do so by providing tangible and real improvements over existing products (that matter to the average consumer)
			- Never need to manage a million different accounts again
			- Local-first feels lighter and faster
			- Easily understandable ToS (people know what access are giving away)
			- End-user programming should be trivial and non-technical (i.e. making integrations like Zapier useless)
- Why would companies care about this model of computing?
	- tldr; building and maintaining a data moat is hard
	- Computation happens almost entirely on end-user devices, need to host massive infrastructure goes way down (unless you are doing heavy ML and info processing, which most companies are not)
	- New markets for lending compute to the masses rather than just to programmers and tech companies
	- Almost all the grunt work of data transformations is eliminated so companies can focus on business logic
	- [[thoughts/GDPR|GDPR]] compliance built-in, users have freedom to manage their own data
- Meta-meditations: this was incredibly helpful to iron out philosophy a bit more. I think this is starting to make more sense from both a user and company perspective, but only for people who *care* about these sorts of things. I think end-game is getting my Mom to understand why this is important.

### July 9th
- Various notes on CRDTs
	- Seem to require [[thoughts/consensus|consensus]] for state compaction
	- Learning about [[thoughts/clocks#Hybrid Logical Clocks|HLCs]] and maintaining [[thoughts/causality#Causal Order|causal order]] in CRDTs

### July 8th
- Learning more about [[thoughts/CRDT|CRDTs]], [[thoughts/Order theory|Order Theory]]
- I got my first email from a mutual which was along the lines of "help, I'm stuck in leetcode hell, how do I escape and do other things?"
	- I feel like I barely know what I'm doing, let alone ready to help another person along on their journey! I sent along a few questions that were really helpful for me when convincing myself to do this project and I hope it's useful.
	- Here was the email response I sent: ![[thoughts/images/Screenshot 2022-07-08 at 4.08.41 PM.png]]
- Had a great chat with Saffron today about some of the really cool research she's thinking about doing re: online identity and data agency.
	- This really would not have happened if Spencer hadn't pushed me to write a thread briefly summarizing what I was working on this summer. I've had a lot of super cool folks reach out and say that they are really excited by the work I'm doing! This is both reassuring but also extremely nerve-wracking. Expectations!!!! A concept
	- One point we talked about that I'm still ruminating on is the idea that selling data requires a baseline level of interoperability between two parties
		- How do current data markets work? If Facebook for example sells their data to another company, is it literally a raw export? How does that handoff happen and how do they ensure the format of the data they are using is understandable by both parties?
		- I think inspiring more thoughts on what potential business models could exist on a platform like this

### July 7th
- Finished up Tim Roughgarden's lectures on the foundations of blockchain which had some really useful theoretical details on traditional [[thoughts/consensus|consensus]] mechanisms which definitely solidified my understanding
- Currently at ~$900/mo in terms of sponsors and I'm just blown away by the volume of support people have expressed. This is more than halfway to monthly living expenses and it feels so close?
	- At first I was a little nervous because, y'know, that's a lot of expectation of producing something meaningful
	- But I think this is exactly the forcing function I need to be active in doing as much as I feasibly can and share as much as possible. Even if someone steals my idea and runs with it, so what? The future is pluralistic. If it's interoperable, it doesn't matter how many implementations there are!
- Read a really good paper on [[thoughts/neutrality|neutrality]] and learned about the [Data Transfer Project](https://datatransferproject.dev/)

### July 6th
- Holy shit [Morgan](https://twitter.com/morgallant), [Aadil](https://twitter.com/aadillpickle), [David](https://twitter.com/TheDavidZhou), and [JZ](https://twitter.com/jzlegion) just sponsored me for ~$400/mo for this research project and ... I am genuinely just speechless??
	- It's just so wild to me that this little project that I’ve just felt so strongly about because of reasons that still seem to evade words is something that other people are interested in seeing come to life too.
	- It feels like this project is a mountain I've set my sights on hiking for the longest time. And for a while I was hiking it alone, appreciating the scenery and the path but the path was lonely. But now I can hear the singing and laughing of my friends as people cheer and join along for the journey and it feels just a bit more manageable.
	- The generosity of these friends (shoutout to MFC and Anson) means that paying the next two months of rent and food isn't something constantly nagging at the back of my mind :')
- There were many points this summer I was fully ready to give up (see: plenty of mental breakdowns below) and stop trying because I questioned whether this was worth doing -- if I should just stop and get an actual job
	- I felt really silly for asking people to help financially on a project that I sometimes had trouble believing in too.
	- So thank you for your trust, thank you for dreaming with me
	- Today's soundtrack is from [La La Land -- Audition (The Fools Who Dream)](https://open.spotify.com/track/6j0wBBAP3hMe4t1Ymj7GIe?si=ef50241abfe04ac2)

![[thoughts/images/IMG_1805.png|???]]

### July 5th
- Finalizing notes on [[thoughts/Tendermint|Tendermint]] and wondering if I should switch out [[thoughts/Raft Consensus Algorithm|Raft]] for it. How valuable is [[thoughts/Byzantine Faults|BFT]] anyways? Do we assume nodes are prone to potentially malicious takeover?

### July 2-4th
- An 'aha' moment caught in 4k... watch me try to figure out why asynchronous and partially synchronous [[thoughts/system model|system models]] aren't the same thing (s/o Sebastien for being so kind and patient). This was super satisfying! ![[thoughts/images/on-async-partially-sync-models.png]]

### July 1st
- Internet went out today halfway through watching lectures :(( 
	- Spent a bunch of time just reading books + thinking
- More notes from Tim Roughgarden's foundation course on [[thoughts/Public-key Infrastructure|PKI]], [[thoughts/Byzantine Broadcast|BB]], impossibility theorems, etc.

## June
### June 30th
- Settling into a better work rhythm I think.
	- Food here is surprisingly expensive but groceries is still miles cheaper than just getting Uber Eats everyday. 
- Have a sudden urge to work on my personal site but I will ignore that for the time being...
- Sebastien sent a [YouTube playlist](https://www.youtube.com/watch?v=KNJGPI0fuFA&list=PLEGCF-WLh2RLOHv_xUGLqRts_9JxrckiA&index=1) on the foundations of [[thoughts/blockchain|blockchains]] that have some sections which seem highly relevant. Slowly making my way through these

### June 29th
- Finally wrapped up school! Anson is headed back to Arizona today too :((
	- Living together has been a fun dance of trying to balance our energy levels, but felt very much like a team throughout. I'm really glad I chose to prioritize relationship, truly some moments over the past month where I was like "wow, is this real." It feels like I'm selectively giving deep attention in-turn to the things I care most about.
	- Now is the era to just fully focus my attention on research and this project though
- I think this finally means that the vast majority of my waking hours will be on research. Uninstalled a game I was spending way too much time playing :')' it is grind time

### June 27-28th
- Nearing the end of my literature review era. Still need to go through Braid/Redwood, SSB, Yjs, and Hypercore inner-workings.
- Thinking it might be good to do a general overview of [[thoughts/CRDT|CRDTs]] before delving any further

### June 26th
- Belinda and Athena from Incepto told me about an SF writer event which happens every week and I'm currently at it right now. So many people here are just working on such really cool things and I'm excited to potentially have this space as incredibly condensed resesarch + thinking time. I think this is a great forcing function every Sunday to just... orient myself for the week and get shit done.
- Talked with some really really cool people at a birthday party in SF which were surprisingly receptive and interested in my work. Will definitely follow up on these conversations.
- More research on [[thoughts/CouchDB|CouchDB]] and other database replication mechanisms to see what I can learn from it

### June 25th
- HackLodge meetup today, also met up with Spencer and Liam. Talked lots about the project then realized I haven't spent much time just... sitting down and grinding out work.
- A decent chunk of it is 1) summer courses taking up much more time than I expected them to and 2) wanting to meet people in SF and spend time with Anson while she is still in SF... priorities priorities
- To borrow words from Anson, it's "hermit time". I feel like I am definitely behind schedule in terms of what I wanted to get done by this point of summer and I need to put in some serious work and thinking into this project.

### June 24th 
- Reading about [[thoughts/Hyper Hyper Space|Hyper Hyper Space]], doesn't seem to place a big deal of emphasis on finality which seems important for a large chunk of applications.
- Open questions:
	- Append-only log or append-only [[thoughts/Merkle-DAG|Merkle-DAG]]? Leaning more towards log still for easy understandability + debug even though Merkle-DAGs are more expressive (and battletested in [[thoughts/blockchain|blockchains]] and `git`)

### June 20th - 23rd
- Reading about [[thoughts/file system#Virtual Distributed File System|VDFS's]] (specifically Alluxio) and 
- Open Questions
	- Handling cases where data > storage availability
	- Checkpoint heuristics: when to checkpoint? especially important if Rhizome is to run indefinitely
		- "Lineage chains can grow very long in a long-running system like Alluxio, therefore the checkpointing algorithm should provide a bound on how long it takes to recompute data in the case of failures"
- Settling into new place, we cleaned out the garage (which is where I am staying) and made it somewhat liveable?? Took a lot of work, the previous tenant didn't even properly move out which was a stressor for a little while
	- Because there is no proper heating/cooling, sometimes I literally work with the garage door open for good circulation which gets me weird looks from the neighbours but it's fun
	- Incepto people have all been super nice and they are all working on/exploring cool things. I get a little distracted sometimes just working in the garage so it's really nice I can just hop over to the hackerspace in the house to get some more focused work done.

### June 16 - 19th
- Interact Retreat! Lots of good conversations about the work I'm doing which has been super clarifying for what type of explanation gets through to certain types of people
- Generally find framing it in terms of net neutrality but applied to data gets a lot of people excited about it, as well as meaningfully explaining + differentiating from Tim Berners-Lee's [[thoughts/Solid|Solid]] project and how Rhizome focuses on addressing main retro points from major p2p protocols.

### June 14 - 15th
- Mostly trying to answer questions around how [[thoughts/decentralized marketplace|decentralized marketplaces]] for demand work, looking at Golem and Orchid
- Lots of moving around (moved from Tempe to SF, about to head to Interact retreat!)

### June 13th
- Rough research notes and open questions on [[thoughts/DID#DWN|DWNs]]
- DID document needs to specify the service
	- Resolve a DID to web node URI
	- `did:example:123` -> resolve to Decentralized Web Node endpoint(s) -> `https://dwn.example.com`
- Raw vs Signed Data
	- Raw → only data + descriptor
	- Signed → data + descriptor + attestation (JSON web signature/JWS)
	- more details: https://identity.foundation/decentralized-web-node/spec/#message-descriptors
- Storing data relative to a schema
	- https://identity.foundation/decentralized-web-node/spec/#query
	- schema field in descriptor
	- JSON-LD + https://schema.org ?
	- or... openzepellin style, vetted schemas
	- data lensing should fit into this
- Permissions request
	- https://identity.foundation/decentralized-web-node/spec/#request
	- signed message
	- define scope
	- based on DAG commit range perhaps?
	- Potentially using [[thoughts/UCAN|UCANs]]
- Open questions
	- How does DID ownership work? what is it pinned to? is IPFS sufficient?
		- TLDR; DID needs to be generally anchored to something. Notes on [[thoughts/Sidetree|Sidetree]], a backend agnostic DID persistence mechanism
	- How do we make ownership/data management easy for non-technical people?

### June 11-12th
- Roadtrip with Anson! Much needed break to get a mental break and reset

### June 10th
- Spicy day today... Jack Dorsey just announced TBD working on Web5, supposedly an extra decentralized web platform (https://twitter.com/jack/status/1535314738078486533)
	- web5 seems to focus on the philosophy side a lot more than actual usability
	- Very similar to [[thoughts/WebID|WebID]] except anchored on bitcoin (lots of interesting stuff using [[thoughts/Sidetree|Sidetree]])
- Feel like a little boat in a big ocean where huge battleships drift by every now and then
	- Makes me doubt what I can really do as this small little boat
	- But reminded that steering my own little boat gives me agency as to what I can explore and do
	- The little boat that could

### June 9th
- Lots of research, mostly around [[thoughts/FOAF|FOAF]], [[thoughts/LDP|LDP]], [[thoughts/RDF|RDF]]
- Looked more into [[thoughts/decentralized marketplace|decentralized marketplaces]] like Raiden and Orchid to see how they handle payments
- Mostly just reading articles and specifications, your average day of research

### June 8th
- Got my first grant rejection from Emergent Ventures today :((
	- Feeling.. kinda numb? I feel like grand scheme of things it doesn't matter but this is the first *hard* no that I've gotten
	- Spent some time looking for some other grants but my conclusion is that I should spend more time getting shit done before asking for more funding.
	- I have enough in savings to last me until end of summer but it means I'll have to start contracting during the school year which isn't ideal, but gives me pure focused time this summer to just do research.
	- Onwards!
- Lots of really great bits from Browser Co's piece on Optimizing for Feelings
	- "Anything new is by nature without precedent — meaning, without data to know whether it will work or not. So when we approach building new things, we don’t optimize for metrics. We optimize for feelings"
	- "How do you feel when you finally step foot in your own living room, after weeks away from home? When you plop down on your own bed, or whip up a meal in your own kitchen? It conjures up a specific feeling, doesn’t it? That’s because these spaces are a reflection of you — created by you, for you. Software can feel the same way if individuals have agency and sovereignty over what is on their screens."

### June 4th - June 7th
- Getting back into a working groove after moving again, Arizona is ridiculously hot. Made the dumb mistake of walking to the grocery instead of taking transit lol
- Learned more about underlying datastructures of [[thoughts/IPFS|IPFS]] including [[thoughts/CID|CIDs]]
	- Potential for interop between IPFS and [[thoughts/DID#Creating DIDs using IPLD|DID Documents]]?
- More notes on [[thoughts/DHT|DHTs]] and [[thoughts/Kademlia DHT|Kademlia]] in particular

### June 1st - June 3rd
- Had a call with a few others folks working adjacent to decentralized infrastructure and people seemed pretty excited about the proposal! It was the first time in the past month that I felt pretty confident about the project when talking about this with others, definitely a personal milestone :)

## May
### May 28th - May 29th
- Attending friends' graduation for the past few days, crazy to think that this will be the last time I see some of these friends for a long time.
- Worked on thinking about and polishing my grant proposal, finally getting to some phrasings that resonate and sound good

### May 27th
- Finishing up `miniraft`, added tests for voting and fixed up some workflow stuff to auto-test and publish documentation!!! It's [published now on GitHub :))](https://github.com/jackyzha0/miniraft)
- Notes on [[thoughts/DID|DID]] which seems particularly applicable to the notion of identity + identity documents
- Once again had a breakdown :)) Constantly feel like I'm not doing enough and that time is slipping between my fingertips...

### May 23rd - May 26th
- Catching up on school work
- More reading + notes in [[thoughts/decentralization|decentralization]], [[thoughts/authorization|authorization]], and [[thoughts/federation|federation]]. Notable readings:
	- [IETF Draft on Centralization and Internet Standards](https://www.ietf.org/archive/id/draft-nottingham-avoiding-internet-centralization-03.html?curius=1294)
	- Gordon Brander on [Modularity](https://subconscious.substack.com/p/modularity?s=r&curius=1294), [weblike things](https://subconscious.substack.com/p/weblike-things?s=r&curius=1294), and [feudal metaphors for the web](https://subconscious.substack.com/p/web3?s=r&curius=1294)
	- [Fission on UCAN for serverless authorization](https://fission.codes/blog/auth-without-backend/?curius=1294)

### May 21st - May 22nd
- Packing + flights! I am now in Vancouver for the next week :))
- Hectic flying experience... didn't get much done

### May 20th
- Chatted with Justin Glibert who gave some very piercing advice
	- What is the most you can cut from your current proposal and have it still be meaningful?
		- *via negativa*: essentially the study of what not to do
			- In action, it is a recipe for what to avoid, what not to do—subtraction, not addition.
		- You can't know what is going to work but also you know there are things that are obviously not.
		- Don't try to think you are a god and reinvent everything from scratch. Don't catch NIH syndrome.
	- You only have 10 beautiful idea tokens in your life you want to do it so you should just do it
		- Don't just do the plumbing and make stuff you already are good at if you're trying to learn
		- If this is something you just want to work on (true in this case) then work on it with your full heart
	- Not being harsh because it's a bad idea
		- But rather I don't want you to waste your time. This is your last summer without 'real-world' responsibilities. I would trade so much to be in your position right now.
		- I am being harsh so that you spend your time wisely and don't do something stupid.
- Technical thoughts
	- Is Rhizome actually a generalized form of state channels?
		- EVM + Solidity on top of little chains between people
		- Minecraft on top of this to build engines like https://www.worldql.com/

### May 19th
- Proposal re-writes + more research today, got a lot done in office today and still had time to head to Central Park to read... a great day all things considered.
- Open questions from today's reading + writing:
	- How do identity 'clusters' or organizations/groups of people work? How are they represented?
		- Perhaps instead of having separate instantiation of your identity on fixed set of apps, we can have the same identity with separate instantiations of the app?
	- Who runs cloud peers?
		- Have a global marketplace where people can list/sell spare compute and storage
	- Who does the compute?
		- Most apps are lightweight to run on people's own devices
		- The main reason we've needed massive datastores and compute centers in the first place is because large companies have centralized billions of people's data into their own servers
		- Cloud peers can offload and perform heavy lifting if necessary
- More meditations on identity and data
	- Thinking about how data exists only as *relations* between things... how do we preserve this?
	- 'Data' is data in the context of that user (or group of users) using that specific application
	- Learned about the concept of [[thoughts/petname|petnames]] in more depth today and there's a really cool way of thinking about identity here perhaps
		- Almost all of the contexts in which we collaborate are not global. The *you* I know is likely different from the you your family knows. Identity should be relational rather than standalone?

### May 18th
- Grant writing + Verses proposal wrangling
- Had Anson tear apart my proposal today
	- It was so incredibly helpful to get that level of honest feedback but I just feel in the dumps right now LOL I need to figure out how to untie my own self-worth from my work
	- I expect something similar will happen when I meet with Justin.. and many more times this summer
- Good feedback is equal parts bitter and sweet
	- Bitter in that it tells you the harsh truths that few have the courage to
	- Sweet in that they truly care enough and have enough faith to point harsh truths out
	- "When you’re screwing up and nobody says anything to you anymore that means they’ve given up on you…you may not want to hear it but your critics are often the ones telling you they still love you and care about you and want to make you better." ― Randy Pausch, The Last Lecture

### May 17th
- Went to NYC to work at the Thrive Capital office with some Interact folks and wow... the difference being outside and in a good working environment makes is ridiculous.
- Migrated all the tracing stuff out of `server.rs` and `log.rs` into its own file. Makes the code a lot cleaner to work with.
- Deleted `transport.rs` (and moved the contents into `tests/common.rs`) now that it is no longer a part of the server. Realizing now I'll probably need to do another refactor of the transport layer to support simulating network partitions, dropping packets, etc. so I have more surface area to test with.
- Talked with Sebastien who has been doing independent research for almost a decade now. Mentioned that I was really feeling like I was in the depths of the Valley of Despair and he just laughed and said "that was me 10 years ago and I still feel that way." Horrifying but also weirdly comforting? He gave me some advice and thoughts (mostly with regards to independent research but honestly a lot of sage life advice too):
	- In independent research, one often pendulums between two brains that drive your day-to-day
		1. Brain 1: I want to make change in the world, I want to ship and build
		2. Brain 2: I want to *understand* why this works the way it does
		- It is almost always Brain 2 thinking that leads to incredibly high payoffs in clarity and increased conviction.
	- Still, breaking things into legible pieces is important. If not for other people, for yourself to have small wins.
		- Don't build for the sake of building, build as a by-product of understanding
		- Don't get trapped in the mindset of having every little thing you do fit perfectly in your grand master plan.
		- It is sufficient to do things to learn and to understand (even if just about yourself)
	- Don't have conviction that you are right because that will lead to disappointment. Have conviction that you will learn regardless.
		- He flew out every weekend from SF to San Diego just to attend a lecture from a professor he really liked and he said it was worth every flight.
	- Often times, it is one core principle that if followed to its natural conclusion/end will result in a fundamental perspective shift (e.g. quantum mechanics).
		- What is that core principle that sits at the heart of everything you find interesting? The connection between the dots is only evident in hindsight so don't spend too long thinking about it. But just follow your gut, it right more often than not.
- To be honest, I don't really understand all of this advice yet and I don't pretend to but at the moment, it gives me comfort that even if there isn't light at the end of the tunnel, the darkness will still be enjoyable

### May 16th
- Grant writing again... Finished rough draft for Protocol Labs RFP 000 and writing EV grant proposal + getting feedback
- Had a mini-breakdown today after realizing I am just not enjoying this as much as I thought I would be. I'm often spending 12+ hour days writing code or grants and I just feel so behind. And I don't get why!!!! I've been looking forward to this summer for so long.
	- I think financial uncertainty is becoming more real day after day... really hoping that one of these goes through and is successful
	- It's too early to quit. There's still so much more to build/learn/do/write and I'm not ready to throw in the towel just yet.

### May 15th
- Family roadtrip, no work today :)

### May 14th
- Finish testing harness - it looks so pretty!
- Finally updating research proposals after putting it off for 3 days. I suspect I'm using `miniraft` as an excuse to avoid the grant writing because making things legible is hard!! I'd much rather write code and look at pretty command line outputs instead but this is important work that needs to be done.

### May 12th - May 13th
- Reaffirming myself that a lot of this is necessary learning and this is a worthwhile project
	- Not sure if this is actually true
	- But more so convincing myself of it so that I have the energy/motivation to go through with it
- A lot of technical refactoring going on to accommodate unit testing
	- Removed a lot of unnecessary lifetimes while changing `RaftServer` functions to return a vector of sendable messages rather than directly having each server hold a mutable reference to the transport layer (Rust doesn't allow multiple mutable references without a `RefCell`!)

> Let's say you want to become good at [x].
> 
> It's almost impossible to do it because every day on Twitter you have friends who’ve raised 6 million to do crazy stuff. And so every single day, you open your books, and you take your notes and you start writing stuff, and you have to solve those equations.
> 
> And every single day you tell yourself, why am I doing this?
> 
> I could just go out and bullshit investors and build a company. And I think too many people actually do that. Myself included. I managed to resist for a while and I spent a lot of time learning different, difficult things, but it's very hard not to have ADD in this world. It's very hard to stay focused on important things that take a while to be learned.
> 
> - [Justin Glibert on doing hard things](https://masterplan.substack.com/p/master-plan-justin-glibert-foundation?curius=1294&s=r)

### May 11th
- Finished the first pass of implementation of `miniraft`! In the midst of adding test infrastructure and verifying correctness of the implementation.
	- Probably spent tooo long making it look nice but hey, if I'm going to be spending hours looking at this it might as well be good to look at
- Also spent an hour trying to debug a test only before realizing `cargo test` runs in parallel so debug messages were out of whack
- Feeling quite demotivated regarding overall self-belief in the project even though I'm only 11 days in! Been trying to explain Rhizome to a few folks who have experience in the space and it is often so intimidating.
	- Like yeah, I know this probably isn't the best way to go about it. Maybe they'll tell me what I'm working on is a long solved problem and I'm wasting my time. Or "couldn't you just use x and y to achieve the same effect"? I can't help but sometimes feel like I'm wasting my time -- there are so many smart people working on the same problem, what makes me feel like I can be the one to make a meaningful contribution to it?
	- I know that regardless of whether this project succeeds a lot, I'm already learning a lot in terms of technical skills and also about myself in the face of uncertainty and more independent work so I will take that as a win regardless.

### May 10th
- Discussing grant proposals with Verses folks, doing a lot more grant/proposal writing than I'd like these days
- Finished most of `miniraft` logic up until `commit_log_entries`. Still need to add tests though :')
- Tech bear market isn't promising for raising funding, esp for more experimental/greenfield work like this :((

### May 9th
- Literally just wrestling with Rust's borrow checker because `dyn` traits are funky :((
	- Ran into a really weird design problem where I wasn't sure how to order the lifetimes of the log or the state machine (should the app own the log which owns the state machine? should the log hold a reference to the app)? 
	- I opted to construct the application first then pass a pointer to the log so that when appending entries to the log, it can just call `self.entries.iter().for_each(|entry| self.app.transition_fn(entry))`
- Finally caved and watched an hour long video on closures, `Fn`, `FnOnce`, `FnMut`, boxed closures, and function pointers ([Jon Gjengset, I owe you my life](https://www.youtube.com/watch?v=dHkzSZnYXmk&t=3005s))
	- Feels really stupid but it was literally a change from `&'s mut dyn App<'s, T, S>` to `Box<dyn App<T, S>`
	- When lifetimes get as messy as they did, there's probably a cleaner way to do it with a heap allocated value :)) Use `Box` more often!

### May 8th
- Sketching out grant proposals to Emergent Ventures + Protocol Labs
- Had a chat with Sebastien about research institutes and what long-term support for work like this could look like in the context of Verses
- More implementation work for `miniraft`, about halfway done I think?
- More of a slower day to spend time with family for Mothers Day :)

### May 7th
- Does not seem promising that my research work will be support by Verses this summer...
- Looking for other places to apply for funding but ugh this is unfortunate
- Lots of coding today for `miniraft`! Finally feeling like I'm becoming more fluent in Rust. Figured out some nasty named lifetime stuff today by drawing a few diagrams and kinda feel like a wizard!!! Small wins

### May 6th
- Mostly writing up recent learnings and incorporating them into the [[thoughts/Rhizome Proposal|research proposal]]... lots of words today
	- Sometimes I feel like I'm doing research to be able to do more research...
- I think I am finally getting to a point where Rhizome is making more and more sense and obvious why it is necessary
	- I started this project/research very much like "oh wow, this is a cool set of technologies and here are some vague words and feelings about what I think is inadequate in the space" and it has sort of refined itself into a clear use case!
	- Came across the concept of a "cloud peer" today in Hypercore documentation and it was like "WOW I had this exact same idea and they already have a name for it" and it was so cool
	- Really excited about this future of 'personal cloud computing'
	- I think this summer will be mostly focused on the data replication / identity aspect of Rhizome, realizing that I think I was way too ambitious with my first proposal
- More implementation on `miniraft`. Rust feels so slow to get back into a 'de-rusted state' (hah) where code just 'flows'. It feels fun though! Type system reminds me a lot of Haskell.

![[thoughts/images/rhizome-may-6.jpeg]]

### May 5th
- Finishing up [[thoughts/distributed systems#Martin Kleppmann's Course|Martin Kleppmann's Course on Distributed Systems]]
	- Cleaning up notes into atomic concepts that I can reference
- Continuing implementation of `miniraft`
- What if... Rhizome had built in mechanisms for managing 'branches'
	- Default branches are single stream
	- To make a collaborative doc you can 'fuse' or 'join' branches together temporarily to sync them with each other
		- What if we made something on top of `git` like this that actually functions on a syntax level rather than a character level... one for the [[thoughts/idea list|idea list]]
	- Pace layers for collaboration
		- Real-time (keystroke-by-keystroke)
		- On-click (manually click refresh)
		- Suggest changes (like Google Docs, accept/reject)
- Agreeing on what operations a [[thoughts/CRDT|CRDT]] can perform still seems to be difficult ([see 1hr into this talk](https://youtu.be/Qytg0Ibet2E?t=3665))
	- Possible room for data lensing on public schemas to be useful here

### May 4th
- Skimming [[thoughts/distributed systems#Martin Kleppmann's Course|Martin Kleppmann's Course on Distributed Systems]]
	- Really good foundation to work off of
	- Learned about differences between physical and logical [[thoughts/clocks|clocks]] and realizing that `miniraft` should probably use some sort of [[thoughts/clocks|logical clock]] rate

### May 3rd
- Read about more [[thoughts/NAT#Efficacy|NAT traversal and holepunching efficacy]], turns out hole punching is just not as reliable as I thought it was
- Compared more traditional consensus algorithms like [[thoughts/Raft Consensus Algorithm|Raft]] to [[thoughts/Solana|Solana]].
- First formal architecture sketch?
	- Need to read more about DID and IPFS but this seems like a promising start?
	- Each user is essentially a DID that is associated with an IPFS document that references a bunch of other things
		- Each device in the devices array runs a Rhizome Node which is essentially a wrapped IPFS node that pins the user IPFS object and can edit it
		- Right now, this means that if all a user's devices are offline, those files are unreachable. For people who still want their stuff to be replicated online, perhaps can integrate FileCoin to incentivize other nodes to pin their document?
	- The devices array is also used by Raft to coordinate what devices should be included in the cluster
		- Modifications in the devices array leads to a Raft configuration update
		- All devices that are reachable sync via Raft to keep an `appState` object up to date for the user
		- When any `appState` log gets too long, it is snapshotted by the leader and persisted in IPFS.
	- All the questions that are unanswered right now are in red. Lots of unanswered questions :))
		- How does auth work for applications?
		- How will schemas be published? Is there an app store?
		- Who runs the web host? Is it self-hosted?
			- What about non-technical people?
		- How is a user created?

![[thoughts/images/rhizome-may-3.jpeg]]

### May 2nd
- Mostly reading about [[thoughts/Raft Consensus Algorithm|Raft]] consensus algorithm today and understanding how it works
	- Always wondered how these consensus algorithms deal with bad actors -- turn out they don't! That's where [[thoughts/Byzantine Faults|BFT]] comes in
	- Seems to be promising for replicating between trusted peers (potentially applicable)
- Starting a very minimal stripped down implementation of [[thoughts/Raft Consensus Algorithm|Raft]] in Rust I am nicknaming `miniraft`. Code [here](https://github.com/jackyzha0/miniraft) (but will most likely be private until it is done).

### May 1st
- Settling back into home, general research reading + writing [[thoughts/Rhizome Proposal|the proposal]]
- Read various papers
	- [[thoughts/internet computing#Changing an entrenched internet|Changing an entrenched Internet]]
	- [[thoughts/mechanism design|Mechanism Design]]
	- [[thoughts/Raft Consensus Algorithm|Raft]]
- Learned about the basic premise of [[thoughts/Self-sovereign Identity (SSI)|SSI]]