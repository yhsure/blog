---
title: Byte Pair Encoding
date: 2024-07-29
tags:
  - seed
aliases:
  - BPE
---
A tokenization approach.

To construct a vocab table of size $n$:

1. Assumes all unique characters to be an initial set of 1-character long [n-grams](https://en.wikipedia.org/wiki/N-grams "N-grams") (i.e. initial "tokens").
2. Then, successively the most frequent pair of adjacent characters is merged into a new, 2-character long n-gram and all instances of the pair are replaced by this new token.
3. This is repeated until a vocabulary of size $n$ is obtained.

This can also be done recursively where n-grams can use previously created tokens (called recursive BPE).

## Example

Given an example sequence `aaabdaaabac` and a target vocabulary of size 4:

1. We start with an initial set of n-grams of just the unique characters: `[a,b,c,d]` and an empty lookup table `{}`
2. As the size of our lookup table (0) is still less than the vocab size of 4, we start by finding the most-frequent byte-pair
3. Within this sequence, `aa` occurs the most frequently so we replace it with a byte-pair that isn't in the data (lets say `X`)
	1. This results in the sequence `XabdXabac`
	2. We also add this mapping to our lookup table `{aa:X}`
4. Then we keep repeating this until we reach a vocab size of 4
5. The next most frequent byte-pair is `ab`
	1. This results in the sequence `XYdXYac`
	2. We also add this mapping to our lookup table `{aa:X, ab:Y}`
6. We can technically stop here because all remaining pairs only occur once, or we can do recursive BPE as technically the byte-pair `XY` occurs twice
	1. This results in the sequence `ZdZac`
	2. We also add this mapping to our lookup table `{aa:X, ab:Y, XY:Z}`