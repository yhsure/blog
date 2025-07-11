---
title: "Riemannian generative decoder"
date: 2025-07-11
tags:
  - generative models
  - Riemannian geometry
  - representation learning
aliases:
  - riemannian decoder
  - rgd
---

> Simpler representation learning on manifolds. We propose a decoder-only framework to learn latents on arbitrary Riemannian manifolds via maximum likelihood and Riemannian optimization. We highlight its use with biological case studies.

![[/posts/images/rgd/frontpage_rgd.png|class=hue-b]] 
<!-- *Overview: A decoder reconstructs data from Riemannian manifolds where representations are optimized as model parameters via maximum likelihood.* -->

## Introduction

Many datasets from biology to social sciences exhibit structures that are naturally represented by non-Euclidean geometries, such as evolutionary trees or cyclical processes. However, learning representations on manifolds usually involves complicated probabilistic approximations, potentially harming model performances. Can we simplify representation learning on manifolds by avoiding density estimation altogether?

## Going encoderless circumvents density estimation

By discarding the encoder and directly learning latent variables through maximum likelihood, our method sidesteps the difficult density computations typically needed for variational inference on manifolds. Instead of the complex manifold ELBO approximations in other works, we simply directly maximize:

$$\arg\max_{Z,\theta} \sum_{i=1}^N \left[ \log p(x_i \mid z_i, \theta) + \log p(z_i) \right]$$

where $z_1, z_2, \ldots, z_N$ are latent representations constrained to lie on a Riemannian manifold, and $\theta$ are the decoder parameters. As [geoopt](https://github.com/geoopt/geoopt) conveniently has gradient descent algorithms for [a wide range of manifolds](#supported-manifolds), choosing a manifold is as easy as swapping a single line of code. The code snippet below illustrates the basic training loop:  

```python
model.z     := init_z(n, manifold) # initialize points on a manifold
model_optim := Adam(model.decoder.parameters())
rep_optim   := RiemannianAdam([model.z])

for each epoch:
    rep_optim.zero_grad()
    for each (i, data) in train_loader:
        model_optim.zero_grad()
        z    := model.z[i]
        z    := add_noise(z, std, manifold) # optional regularization
        y    := model(z)
        loss := loss_fn(y, data)
        loss.backward()
        model_optim.step()
    rep_optim.step()
```
The [GitHub codebase](https://github.com/yhsure/riemannian-generative-decoder) contains a more complete implementation.



## Branching diffusions as a synthetic testbed 

First, we validate our approach on synthetic data with known hierarchical structure using a branching diffusion process from [this paper](https://arxiv.org/abs/1901.06033). This allows us to quantitatively assess how well different manifolds capture tree-like relationships. 

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0; align-items: start;">
  <div style="text-align: center;">
    <div style="height: 320px; display: flex; align-items: center; justify-content: center;">
      <img src="/posts/images/rgd/final_synth_umap_cbar.png" alt="UMAP synthetic" class="hue-b" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <p style="font-style: italic; margin: 8px 0 0 0; line-height: 1.3;">UMAP projection fails to show underlying geometry</p>
  </div>
  <div style="text-align: center;">
    <div style="height: 320px; display: flex; align-items: center; justify-content: center;">
      <img src="/posts/images/rgd/final_synth_0.5std2_nogrid.png" alt="Hyperbolic synthetic" class="hue-b" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <p style="font-style: italic; margin: 8px 0 0 0; line-height: 1.3;">Hyperbolic (Poincaré) reveals underlying geometry</p>
  </div>
</div>

Our experiments on the synthetic data demonstrate a clear advantage of hyperbolic spaces for hierarchical data. Here, geometric regularization plays a key role in preserving the tree structure during optimization.


> [!concept] Geometry-aware regularization
> A key innovation in our approach is **geometry-aware regularization**: During training, we perturb latent points by adding noise scaled according to the local curvature:
>
> $$\epsilon \sim \mathcal{N}(0, \sigma^2 G^{-1}(z))$$
>
> where $G(z)$ is the Riemannian metric tensor at point $z$. This adapts the noise to the local curvature of the manifold -- intuitively, the noise is scaled by how steep the manifold is at that point. 
>
> We found that injecting this noise results in the regularizer 
> 
> $$\mathcal{R}(z) = \sigma^2 \, \text{Tr}(J^T G^{-1}(z) J)$$ 
> 
> where $J = \nabla_z f_\theta(z)$ is the decoder Jacobian. This penalizes rapid changes in output, particularly where the manifold is strongly curved. 
>
> For the Poincaré ball -- a hyperbolic space -- the metric is $G(z) = \frac{4}{(1 - c\|z\|^2)^2} I$ with curvature $c > 0$. This means points further from the center receive less noise, naturally reflecting the hyperbolic geometry's expansion toward the boundary. [Our article](https://arxiv.org/abs/2506.19133) analyzes the relationship between curvature and noise level in more detail.
>
> An ablation study clearly shows how regularization strength $\sigma$ influences correlation $\rho$ between data geometry and latent geometry. The correlation improves dramatically with an increase in noise, but drops off once the noise becomes overwhelming:
> <div style="text-align: center; margin: 10px 0;">
>   <img src="/posts/images/rgd/synth_ablation_nooutline.png" alt="Ablation study" class="hue-b" style="width: 100%; max-width: 800px;">
>   <p style="font-style: italic; margin: -3px 0 0 0; line-height: 1.3;">Ablation study on the effect of geometry-aware regularization.</p>
> </div>


## Tracing human migrations from mtDNA

We validated our approach on mitochondrial DNA (mtDNA) sequences, which are often used to reconstruct human migration histories. mtDNA mutations form a hierarchical tree reflecting human population splits. Embedding these sequences in a hyperbolic manifold naturally captures this tree structure better than Euclidean embeddings or popular methods like UMAP.

Using hyperbolic geometry makes the inferred migrations more interpretable, highlighting branching events that match known evolutionary and geographical patterns. In the following figures, the edges represent simplified lineage relationships, with nodes indicating median haplogroup positions.

<div style="text-align: center; margin: 0px 0;">
  <div style="height: 350px; display: flex; align-items: center; justify-content: center;">
    <img src="/posts/images/rgd/hmtdna_rcrs0.5std2.png" alt="Hyperbolic RSRS" class="hue-b" style="max-width: 100%; max-height: 100%; object-fit: contain;">
  </div>
  <p style="font-style: italic; margin: 8px 0 0 0; line-height: 1.3;"> Hyperbolic latents reveal the underlying structure</p>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: -10px -5px; align-items: start;">
  <div style="text-align: center;">
    <div style="height: 320px; display: flex; align-items: center; justify-content: center;">
      <img src="/posts/images/rgd/final_hmtdna_rsrs_umap2.png" alt="UMAP projection" class="hue-b" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <p style="font-style: italic; margin: 8px 0 16px 0; line-height: 1.3;">UMAP projection fails to reveal the structure</p>
  </div>
  <div style="text-align: center;">
    <div style="height: 320px; display: flex; align-items: center; justify-content: center;">
      <img src="/posts/images/rgd/final_hmtdna_rsrs_eucl.png" alt="Euclidean latent space" class="hue-b" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <p style="font-style: italic; margin: 8px 0 16px 0; line-height: 1.3;">Euclidean latents show some improvement</p>
  </div>
</div>


## Capturing cyclical structures in single-cell data

Finally, we modeled cyclic biological processes using spherical and toroidal manifolds, capturing an inherent periodicity to the data. Measuring gene expression levels of fibroblasts with single-cell RNA sequencing creates asynchronous snapshots of the cell division cycle. Since individual cells cannot be tracked over time, unsupervised learning is suitable for learning patterns about the population of cells.  

Below are results using either UMAP or latents from our model:

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0; align-items: start;">
  <div style="text-align: center;">
    <div style="height: 320px; display: flex; align-items: center; justify-content: center;">
      <img src="/posts/images/rgd/cc_umap_noax2m_noaxes.png" alt="UMAP cell cycle" class="hue-b" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <p style="font-style: italic; margin: 5% 0 0 0; line-height: 1.3;">UMAP projection of cell cycle data</p>
  </div>
  <div style="text-align: center;">
    <div style="height: 320px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
      <img src="/posts/images/rgd/final_cc_euclidean2m.png" alt="Euclidean cell cycle" class="hue-b" style="width: 114%; height: 118%; object-fit: contain; margin-left: -12%; margin-bottom: -25%;">
    </div>
    <p style="font-style: italic; margin: 5% 0 0 0; line-height: 1.3;">Euclidean ℝ² latent space</p>
  </div>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0; align-items: start;">
  <div style="text-align: center;">
    <div style="height: 320px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
      <img src="/posts/images/rgd/cc_sphere_finalm.png" alt="Spherical cell cycle" class="hue-b" style="width: 100%; height: 167%; object-fit: contain; margin-top: -35%; margin-bottom: -22%;">
    </div>
    <p style="font-style: italic; margin: -70px 0 0 0; line-height: 1.3;">Spherical 𝕊² latent space</p>
  </div>
  <div style="text-align: center;">
    <div style="height: 320px; display: flex; align-items: center; justify-content: center; overflow: hidden; padding-right: 25px;">
      <img src="/posts/images/rgd/cc_torus_finalm.png" alt="Toroidal cell cycle" class="hue-b" style="width: 100%; height: 167%; object-fit: contain; margin-top: -35%; margin-bottom: -22%;">
    </div>
    <p style="font-style: italic; margin: -70px 21px 0 0; line-height: 1.3;">Toroidal 𝕊¹×𝕊¹ latent space</p>
  </div>
</div>

Interestingly, we found that sufficiently expressive models can model the periodicity in various ways, not necessarily aligning with how humans would place them on a sphere. Nonetheless, our results still quantitatively showed that circular and toroidal embeddings improved correlation with cell cycle phase. 



<div class="badge-container">
  <span class="badge-item" onclick="window.open('https://arxiv.org/abs/2506.19133', '_blank')">
    <img src="https://img.shields.io/badge/Paper-2506.19133-cc4778?style=for-the-badge&logo=arxiv&logoColor=white&logoHeight=20" alt="ArXiv Paper">
  </span>
  <span class="badge-item" onclick="window.open('#', '_blank')">
    <img src="https://img.shields.io/badge/GitHub-Code-6a0dad?style=for-the-badge&logo=github&logoColor=white&logoHeight=20" alt="GitHub Code">
  </span>
  <span class="badge-item" onclick="window.open('#', '_blank')">
    <img src="https://img.shields.io/badge/🤗 HuggingFace-Data-fcce25?style=for-the-badge&logoColor=white&logoHeight=20" alt="HuggingFace Data">
  </span>
</div>



## BibTeX

~~~bibtex
@inproceedings{bjerregaard2025riemannian,
  title={Riemannian generative decoder},
  author={Bjerregaard, Andreas and Hauberg, S{\o}ren and Krogh, Anders},
  booktitle={ICML 2025 Workshop on Generative AI and Biology},
  month     = {July},
  year      = {2025}
}
~~~

---


## Supported manifolds

Our approach seamlessly integrates a wide variety of Riemannian manifolds provided by [geoopt](https://geoopt.readthedocs.io):

<ul style="column-count: 2; column-gap: 2rem; list-style-type: disc; list-style-position: inside; margin: 0; padding-left: 1.1em;">
  <li>Euclidean</li>
  <li>ProductManifold</li>
  <li>Stiefel</li>
  <li>CanonicalStiefel</li>
  <li>EuclideanStiefel</li>
  <li>EuclideanStiefelExact</li>
  <li>Sphere</li>
  <li>SphereExact</li>
  <li>Stereographic</li>
  <li>StereographicExact</li>
  <li>PoincareBall</li>
  <li>PoincareBallExact</li>
  <li>SphereProjection</li>
  <li>SphereProjectionExact</li>
  <li>Scaled</li>
  <li>Lorentz</li>
  <li>SymmetricPositiveDefinite</li>
  <li>UpperHalf</li>
  <li>BoundedDomain</li>
</ul>
