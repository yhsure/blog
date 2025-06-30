---
title: "Key Sharing Problem"
date: 2022-08-08
tags:
  - seed
aliases:
  - key exchange problem
---

> The key exchange problem describes ways to exchange whatever keys or other information are needed for establishing a secure communication channel so that no one else can obtain a copy.

- Alice locks the box with her lock and sends it to Bob
- Bob locks the box with his lock and sends it back to Alice
- Alice removes her lock and sends it back to Bob
- Bob removes his lock
- Double Encryption Transfer
  - Both parties generate random keys $K_A$ and $K_B$
  - Sender sends encrypted message $K_A(m)$
  - Receiver encrypts received message and sends it back $K_B(K_A(m))$
  - Sender decrypts message and sends it again $K^-_{A}(K_B(K_A(m))) = K_B(K^+_{A}(K_A(m))) = K_B(m)$ (only valid if operation is associative!)
  - Receiver decrypts final message $K^-_{B}(K_B(m)) = m$

### Diffie Hellman

A way of performing key exchange over an insecure channel. Can be thought of using colour mixing.

Assume colours can easily be mixed with other colours, but unmixing a given colour into its components is impossible. The following procedure then solves the problem:

The process begins by having the two parties, Alice and Bob, publicly agree on an arbitrary starting color that does not need to be kept secret. In this example, the color is yellow. Each person also selects a secret color that they keep to themselves – in this case, red and cyan. The crucial part of the process is that Alice and Bob each mix their own secret color together with their mutually shared color, resulting in orange-tan and light-blue mixtures respectively, and then publicly exchange the two mixed colors. Finally, each of them mixes the color they received from the partner with their own private color. The result is a final color mixture (purple-brown in this case) that is identical to their partner's final color mixture.

![[thoughts/images/key-sharing.png]]