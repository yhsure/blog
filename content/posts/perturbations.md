---
title: "What do single-cell models already know about perturbations?"
date: 2025-12-09
tags:
  - generative models
  - explainable AI
  - single-cell RNA sequencing
  - perturbations
aliases:
  - perturbation flow maps
  - gradient probing
---

> Modern single-cell models secretly know a lot about how cells respond to genes, drugs, and disease -- even when they were *never* trained to predict these things.  
> This post (and <a href="https://www.mdpi.com/2073-4425/16/12/1439" target="_blank">our paper</a>) explains how simple *decoder gradients* reveal this hidden knowledge.

![[/posts/images/what-do/frontpage.svg|class=]]
## Introduction

<!-- Generative models in single-cell biology efficiently learn low-dimensional latent representations. While often used for clustering or denoising, it remains unclear how much mechanistic knowledge these models capture implicitly. We ask: *What do single-cell models already know about perturbations?*

We demonstrate that generative decoders encode usable perturbation structures that can be queried without supervision. By computing the gradient of a gene's expression with respect to the latent variables, we generate vector fields—*perturbation flow maps*—that simulate cellular state transitions. -->


Single-cell RNA-seq gives us snapshots of thousands or millions of individual cells. Many labs now use **generative models** (often variational autoencoders like scVI) to compress these snapshots into a low-dimensional *latent space*.

Such models are normally used for denoising or batch correction — but they also learn something deeper: **They learn how gene expression changes when a cell is perturbed.** Surprisingly, they learn this even *without ever seeing perturbation labels.*

Our study asks a simple question:

> **Can we extract perturbation effects directly from a pretrained decoder?**

The answer is **yes** — by reading off **gradients**.

---



## The core idea: follow the gradient

A decoder maps a latent point `z` to gene expression predictions. If we take the gradient of a gene’s expression with respect to `z`, we obtain a **direction of change**:

- positive direction → increases expression  
- negative direction → decreases expression

This gradient acts like a **tiny perturbation simulator**. Concretely, we can simulate a perturbation step by following the gradient:
$$
z_{t+1} = z_t + \delta \nabla_z y_i(z_t)
$$
where $\delta$ is the step size and $\nabla_z y_i(z_t)$ is the gradient of gene $i$.

Think of the decoder outputs as “gene expression landscapes.” Gradients tell us which way the landscapes slope. Following a slope step-by-step traces how a cell would move if we:

- turn a gene **up** (overexpression),  
- turn it **down** (knockdown),  
- increase probability of injury,  
- or move forward in developmental time.

This process requires no modification to the model architecture and works with any differentiable decoder. When decoding a perturbed cell, other genes change along with it -- more realistically than zeroing out a gene.

<div style="text-align: center; margin: 10px 0;">
   <img src="/posts/images/what-do/loss_landscape.svg" alt="Loss landscape" class="" style="width: 60%; max-width: 420px;">
   <p style="font-style: italic; margin: -3px 0 0 0; line-height: 1.3;">Gradient ascent on the expression landscape</p>
</div>

---

## Probing a large pretrained CELL × GENE scVI model

We probed a frozen scVI decoder trained on the CELL × GENE Discover Census ($\sim 5.7$M cells). Focusing on pancreatic islet cells, we analyzed type 2 diabetes mellitus (T2D) without any fine-tuning.

The model correctly identifies that increasing *Ins1* (insulin) expression drives the latent representation from the diabetic region toward the normal region. 

<div style="text-align: center; margin: 10px 0;">
   <img src="/posts/images/what-do/all_islet_cells.svg" alt="Loss landscape" class="" style="width: 63%; max-width: 430px;">
   <p style="font-style: italic; margin: -3px 0 50px 0; line-height: 1.3;"><i>Ins1</i> gradients overlaid on PCA of islet latents; gradients show the direction of <b>increasing</b> expression</p>
</div>

<div class="figure-grid">
  <div class="figure-item">
    <div class="figure-img-container">
      <img src="/posts/images/what-do/fig3_beta.svg" alt="Beta cells Ins1">
    </div>
    <p class="figure-caption">Beta cells: Increasing <i>Ins1</i> aligns with T2D → healthy</p>
  </div>
  <div class="figure-item">
    <div class="figure-img-container">
      <img src="/posts/images/what-do/fig3_alpha.svg" alt="Alpha cells Gcg">
    </div>
    <p class="figure-caption">Alpha cells: Increasing <i>Gcg</i> aligns with healthy → T2D</p>
  </div>
</div>

Thus, we see that increasing *Ins1* in β-cells moves latent representations from the diabetic region toward the normal region, and increasing *Gcg* in α-cells has the opposite effect, consistent with its role in increasing blood glucose.

Other relevant endocrine and metabolic genes (*Pcsk1, Pcsk2, Acot7, Fabp5, Mdh1, Aldoa*) show flows matching known T2D biology. But how do we score which genes are most relevant for a disease?

## Ranking genes by their alignment with a *disease axis*

<!-- To quantify gene relevance for a disease, we sampled gradients for all genes in the model. We define a latent **healthy → disease axis** \(a\) from group means. Each gene gets a score
$$
s_i = \cos(\angle(\nabla y_i, a))
$$
Here, $s_i\in[-1,1]$ quantifies a directional agreement: larger values indicate that gradients align with the healthy $\to$ disease transition. As we have a large degree of freedom in sampling $\mathcal Z$, one may compute the score for, e.g., purely healthy or disease samples. The range of $s_i$ covers gradients pointing in the reverse direction ($s_i=-1$), orthogonally ($s_i=0$), or the same direction ($s_i=1$).    -->
To quantify gene relevance for a disease, we sampled gradients for all genes in the model. We define a latent healthy → disease axis from group means,
$$
a = \overline z_{\mathrm{perturbed}} - \overline z_{\mathrm{unperturbed}},
$$
which represents the average displacement between the two conditions. Each gene $i$ receives a score based on the average cosine similarity between its gradient field and this axis:
$$
\begin{aligned}
s_i &= \underset{z \in \mathcal Z}{\text{avg}}\cos(\angle(\nabla y_i, a)) \\
    &= \frac{1}{|\mathcal Z|}
       \sum_{z \in \mathcal Z}
       \frac{\nabla_z y_i(z)^\top a}{\lVert \nabla_z y_i(z)\rVert_2 \,\lVert a\rVert_2}.
\end{aligned}
$$
Here, $s_i \in [-1,1]$ quantifies a directional agreement: larger values indicate that gradients align with the healthy $\to$ disease transition. As we have a large degree of freedom in sampling $\mathcal Z$, one may compute the score for, e.g., purely healthy or purely disease samples. The range of $s_i$ covers gradients pointing in the reverse direction ($s_i=-1$), orthogonally ($s_i=0$), or the same direction ($s_i=1$).

As a baseline, we decode the negative binomial means at the median latent of each condition to obtain per-gene $m^{(1)}$ and $m^{(0)}$, and score genes by the symmetric change: $ \frac{m^{(1)}-m^{(0)}}{\tfrac{1}{2}(m^{(1)}+m^{(0)})} $.

## Pathway analysis with an LLM-in-the-loop

Upon gene enrichment, we select the top 200 genes with the largest absolute scores. These gene sets are analyzed with *WebGestalt* overrepresentation analysis using pathways from WikiPathways, which results in a list of biological systems which are overrepresented in the gene set. We mechanistically interpret these pathways with an LLM agent. Specifically, we run the following prompt three times for each pathway, using GPT-5 with reasoning and web-search enabled:

> **Prompt 1.** *You have an expert perspective in bioinformatics. Is [PATHWAY] highly relevant for type 2 diabetes mellitus in Mus musculus? Answer with Yes or No. Afterwards, describe shortly your explanation for whether the pathway involves type 2 diabetes, providing references for your claims.*

We find pathway interpretations from this stage to already be highly accurate. To combat non-determinism, we re-run the same prompt thrice and feed answers into *Prompt 2*:

> **Prompt 2.** *You have an expert perspective in bioinformatics. Your task is to very concisely judge whether a pathway is relevant for type 2 diabetes mellitus (T2D) in Mus musculus. When asked whether [PATHWAY] is highly relevant for T2D in Mus musculus, these were your answers from three distinct runs:*
> 
> *Answer 1: [ANSWER 1]*  
> *Answer 2: [ANSWER 2]*  
> *Answer 3: [ANSWER 3]*
> 
> *Now give your final critical verdict with a Yes or No, and describe very concisely your explanation (with a few sentences at most), using correct scientific references.*

For transparency, <a href="https://github.com/yhsure/perturbations/blob/main/data/llm_pathway_responses.json" target="_blank">all our LLM responses are collected in a json file</a>, which is used to label pathways for their suggested relevance in *Mus musculus* T2D:

<div style="text-align: center; margin: 10px 0;">
   <img src="/posts/images/what-do/enrichment_all.svg" alt="Enrichment analysis" class="" style="width: 95%; max-width: 700px;">
   <p style="font-style: italic; margin: 5px 0 20px 0; line-height: 1.3;">Overrepresentation analysis based on WikiPathways. Pathways are labeled by false discovery rate (FDR) and LLM-inferred relevance. When scoring genes, gradients are sampled either 'at healthy' or 'at disease' data.</p>
</div>

While the baseline did not identify any pathways at FDR ≤ 0.05, the gradient-based method located multiple significant pathways. With a mechanistic analysis by LLM AI agents, we found that enriched pathways are more relevant for T2D than pathways from the baseline.

---

## Predicting toxin response and temporal dynamics

This framework extends beyond individual genes. By attaching lightweight auxiliary heads for specific tasks -- such as classification or regression -- we can compute gradients for arbitrary concepts like "injury" or "developmental time."

We validated this on cardiotoxin-induced muscle injury and *C. elegans* embryogenesis (worm embryos during early development).

<div class="figure-grid">
  <div class="figure-item">
    <div class="figure-img-container">
      <img src="/posts/images/what-do/cardiotoxin_preds.svg" alt="Cardiotoxin injury probability">
    </div>
    <p class="figure-caption">Gradients of cardiotoxin injury probability</p>
  </div>
  <div class="figure-item">
    <div class="figure-img-container">
      <img src="/posts/images/what-do/embryotime_preds.svg" alt="Developmental time">
    </div>
    <p class="figure-caption">Gradients of developmental time</p>
  </div>
</div>


In both cases, the gradient flows align with ground-truth biological transitions, moving from control to injured states, or correctly tracing the lineage time course.


> [!summary] Takeaway
> Our results confirm that pretrained generative models implicitly encode *disease axes*, *regulatory logic*, and *perturbation knowledge*. Without fine-tuning on specific disease data, the model can provide a ranked list of relevant genes for a disease and perform infinitesimal perturbations. 

---

## Why does this work?

Generative models must learn *how genes co-vary* across millions of cells. Those co-variations encode:

- regulatory structure  
- developmental structure  
- stress responses  
- disease axes  

The decoder gradient extracts directions for this knowledge with a single line of automatic differentiation.

In short:  
<!-- > **Single-cell generative models already contain a surprising amount of perturbation knowledge. We just need to read the gradients.** -->

> **Trained single-cell models can be trated as *virtual labs*, simulating how cells respond to drugs, gene knockouts, or disease -- without need for retraining or perturbation labels. Such models already encode rich, unsupervised knowledge about gene regulation and disease. We just need to read the gradients.**


<div class="badge-container">
  <span class="badge-item" onclick="window.open('https://www.mdpi.com/2073-4425/16/12/1439', '_blank')">
    <img src="https://img.shields.io/badge/Genes-Paper-cc4778?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAABCFBMVEVjRoBkR4FjR4BgQn1hRH9iRH9iRX9fQX1kR4BgQ35yV4xrT4ZfQn1zWYxpToVnS4NoTIR0W45nS4RzWY2Tf6ZqToV1W46PfKNlSIGqmrhpTYWfjbBvVImTgKd7ZJRwVYpmSoNyWIybia17Y5KGb5xhQ35jRYB2XY9tU4heQHxtUodoS4NhRH5pTYRmSYJiRYCah6x0Wo1eQXyfjrBoTYSPeqN5YJGMd6FoTINfQXyIcp5lSYJuVImllbR7Y5N2W46TfqZ9ZZWVgqhkRoBqToZgQ31xV4t5YZJsUIeNeKJrUIeOeaKSfaWXg6mXhKl3XpCSfqawor58Y5N8ZJVrUIZsUYduU4lgQn4GkBRDAAAAwUlEQVQI1y3O6VaCUAAE4IG7YaSQeDMLUyokiCzNCpcszVxyza33f5OIOmfO/Js5HwAlCf5bJVQhTGXgggNa6kA/TGeowcyjLIewcvI4r5wU5OmZyUDs4nkpV3YuLsWVqwIV79oPbkJ5S+zqXfx3X6s/NKxH9+k5YlCarXbnpfv6Fvb6noDmSuO9OvgYmhhJCnc80T+nZjhDMM8w+N5iuVyx4VdXzGIG6Nohm2002PF9QvW/VZ9yGu/+5NovPhZowA8dMRRR0T1dRAAAAABJRU5ErkJggg==&logoColor=white" alt="Paper">
  </span>
  <span class="badge-item" onclick="window.open('https://github.com/yhsure/perturbations', '_blank')">
    <img src="https://img.shields.io/badge/GitHub-Code-6a0dad?style=for-the-badge&logo=github&logoColor=white&logoHeight=20" alt="GitHub Code">
  </span>
</div>

## BibTeX
This page may be cited as:

~~~bibtex
@article{bjerregaard2025single,
  title={What do single-cell models already know about perturbations?},
  author={Bjerregaard, Andreas and Prada-Luengo, I{\~n}igo and Das, Vivek and Krogh, Anders},
  journal={Genes},
  volume={16},
  number={12},
  pages={1439},
  year={2025},
  publisher={Multidisciplinary Digital Publishing Institute}
}
~~~