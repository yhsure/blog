---
title: "Riemannian generative decoder"
date: 2021-07-08
tags:
  - generative models
  - Riemannian geometry
  - representation learning
---

>Simpler representation learning on manifolds. We propose a decoder-only framework to learn latents on arbitrary Riemannian manifolds via maximum likelihood and Riemannian optimization. We highlight its use with biological case studies.

![[/posts/images/rgd/frontpage_rgd (1).png|class=hue-b]] 
<!-- *Figure: Methodological overview.* -->

## Introduction
- GPT: Do this short section
- Why Riemannian geometry?
- Other approaches are generally mathematically difficult
- Can that be avoided?


## Going encoderless circumvents density estimation
The key insight is that, by dropping the encoder, we avoid having to approximate densities on Riemannian manifolds. By learning representations via maximum likelihood, we can easily plug-and-play any Riemannian manifold as latent space for the decoder. Swapping manifolds is as easy as changing a single line of code! Here's a minimal implementation:

```python
To be added ;) GPT: do not change
```

See [#Supported manifolds](#supported-manifolds) for a list of available manifolds.


## Tracing human migrations from mtDNA
- GPT: Do this short section
- Short discussion and horizontal images


## Cell-cycle stages from single-cell data
- GPT: Do this short section
- Short discussion and horizontal images

***


## Supported manifolds
- GPT: Do this short section
- List from the supplementaries


## BibTeX

```bibtex
@inproceedings{bjerregaard2025riemannian,
  title={Riemannian generative decoder},
  author={Bjerregaard, Andreas and Hauberg, S{\o}ren and Krogh, Anders},
  booktitle={ICML 2025 Workshop on Generative AI and Biology},
  month     = {July},
  year      = {2025}
}
```

---
title: "Riemannian generative decoder"
date: 2025-07-08
tags:
  - generative models
  - Riemannian geometry
  - representation learning
aliases:
  - riemannian decoder
  - rgd
---

>Simpler representation learning on manifolds. We propose a decoder-only framework to learn latents on arbitrary Riemannian manifolds via maximum likelihood and Riemannian optimization. We highlight its use with biological case studies.

<div style="text-align: center;">
<img src="/posts/images/rgd/frontpage_rgd.png" alt="Methodological overview" style="width: 60%; height: auto;" class="hue-b">
</div>

## Introduction

Many datasets from biology to social sciences exhibit structures that are naturally represented by non-Euclidean (Riemannian) geometries, such as evolutionary trees or cyclical processes. However, learning representations on manifolds usually involves complicated probabilistic approximations. Can we simplify representation learning by avoiding density estimation altogether?

## Going encoderless circumvents density estimation

By discarding the encoder and directly learning latent variables through maximum likelihood, our method sidesteps the difficult density computations typically needed for variational inference on manifolds. With the Riemannian generative decoder, using different manifolds is as easy as swapping a single line of code—making representation learning simpler and more accessible.

Here's a minimal implementation:

~~~python
To be added ;)
~~~

See [#Supported manifolds](#supported-manifolds) for a list of available manifolds.

## Hierarchical data: Branching diffusion process

We validate our approach on synthetic hierarchical data using a branching diffusion process. This creates tree-like structures that are naturally suited for hyperbolic geometry.

<div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
<img src="/posts/images/rgd/final_synth_umap_cbar.png" alt="UMAP projection of branching diffusion" style="width: 45%; height: auto;" class="hue-b">
<img src="/posts/images/rgd/final_synth_0.5std2_nogrid.png" alt="Poincaré disk projection" style="width: 45%; height: auto;" class="hue-b">
</div>

The left plot shows UMAP failing to reveal the underlying tree topology, while the right shows our hyperbolic embedding clearly capturing the hierarchical structure. Below, we see how geometric regularization (controlled by noise parameter σ) affects the learned representations:

<div style="text-align: center;">
<img src="/posts/images/rgd/synth_ablation_nooutline.png" alt="Ablation study showing noise effects" style="width: 70%; height: auto;" class="hue-b">
</div>

## Tracing human migrations from mtDNA

We validated our approach on mitochondrial DNA (mtDNA) sequences, which are often used to reconstruct human migration histories. mtDNA mutations form a hierarchical tree reflecting human population splits. Embedding these sequences in a hyperbolic manifold naturally captures this tree structure better than traditional Euclidean embeddings or popular methods like UMAP:

<div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
<img src="/posts/images/rgd/final_hmtdna_rsrs_umap2.png" alt="UMAP projection of mtDNA data" style="width: 30%; height: auto;" class="hue-b">
<img src="/posts/images/rgd/final_hmtdna_rsrs_eucl.png" alt="Euclidean embedding of mtDNA" style="width: 30%; height: auto;" class="hue-b">
<img src="/posts/images/rgd/final_hmtdna_rsrs0.5std.png" alt="Hyperbolic embedding of mtDNA (RSRS)" style="width: 30%; height: auto;" class="hue-b">
</div>

The progression from UMAP (left) to Euclidean (center) to hyperbolic (right) clearly shows how the hyperbolic geometry better captures the hierarchical haplogroup structure. Below we compare different reference sequences:

<div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
<img src="/posts/images/rgd/final_hmtdna_rcrs0.5std.png" alt="Hyperbolic embedding of mtDNA (rCRS)" style="width: 45%; height: auto;" class="hue-b">
<img src="/posts/images/rgd/hmtdna_distributions.png" alt="Distribution of mutations per sequence" style="width: 45%; height: auto;" class="hue-b">
</div>

Using hyperbolic geometry makes the inferred migrations more interpretable, clearly highlighting branching events that match known evolutionary and geographical patterns.

## Cell-cycle stages from single-cell data

Another validation used single-cell RNA sequencing of fibroblast cells undergoing the cell cycle—a naturally cyclical process. By embedding cells on spherical and toroidal manifolds, we captured the intrinsic cyclical geometry of the data:

<div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
<img src="/posts/images/rgd/cc_umap_noax2m_noaxes.png" alt="UMAP projection of cell cycle data" style="width: 45%; height: auto;" class="hue-b">
<img src="/posts/images/rgd/final_cc_euclidean2m.png" alt="Euclidean embedding of cell cycle" style="width: 45%; height: auto;" class="hue-b">
</div>

<div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
<img src="/posts/images/rgd/cc_sphere_finalm.png" alt="Spherical embedding of cell cycle" style="width: 45%; height: auto;" class="hue-b">
<img src="/posts/images/rgd/cc_torus_finalm.png" alt="Toroidal embedding of cell cycle" style="width: 45%; height: auto;" class="hue-b">
</div>

The learned representations clearly align with biological phases, revealing the advantage of encoding known periodic structures directly in the latent space geometry. The spherical and toroidal manifolds naturally capture the cyclical nature of cell division.

***

## Supported manifolds

Our approach seamlessly integrates a wide variety of Riemannian manifolds provided by [geoopt](https://geoopt.readthedocs.io):

- Euclidean
- Stiefel
- CanonicalStiefel
- EuclideanStiefel
- EuclideanStiefelExact
- Sphere
- SphereExact
- Stereographic
- StereographicExact
- PoincareBall
- PoincareBallExact
- SphereProjection
- SphereProjectionExact
- Scaled
- ProductManifold
- Lorentz
- SymmetricPositiveDefinite
- UpperHalf
- BoundedDomain

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
> [!example] Minimal implementation
> For a minimal implementation, we first define a fully-connected decoder with swish activations:
>
> ~~~python
> import torch; import torch.nn as nn; import geoopt as g
> 
> # Linear decoder stack with swish activations 
> class RGD(nn.Module):
>   def __init__(self, dims, manifold=geo.manifolds.Euclidean()):
>     super().__init__()
>     self.manifold = manifold
>     self.decoder = nn.Sequential(*sum([[nn.Linear(i, o), nn.SiLU()] 
>         for i, o in zip(dims, dims[1:])], [])[:-1])
> 
>   def forward(self, z):
>     return self.decoder(z)
> 
>   # Manifold-projected points with small noise opposite origin 
>   def init_latents(self, n):
>     z  = 1e-3 * torch.randn(n, self.dim_list[0],device=device)
>     z  = self.manifold.projx(z - self.manifold.origin(z.shape[-1]))
>     z  = g.ManifoldParameter(z, manifold=self.manifold, requires_grad=True)
>     return z
> 
> model = RGD([2, 32, 64, data_dim], 
>             manifold=geo.manifolds.Lorentz(c=5.0))
> model.z = model.init_latents(n_samples)
> model_optim = torch.optim.Adam(model.decoder.parameters())
> rep_optim = geo.optim.RiemannianAdam([model.z])
> ~~~
> 
> The basic training logic is straightforward:
> 
> ~~~python
> for epoch in range(num_epochs):
>   rep_optim.zero_grad()
>   for i, data in enumerate(train_loader):
>     model_optim.zero_grad()
>     z    = model.z[i]
>     z   += riemannian_noise(z, std, model.z.manifold) # optional
>     loss = reconstruction_loss(model.decoder(z), data)
>     loss.backward()
>     model_optim.step()
>   rep_optim.step()
> ~~~
> The [GitHub codebase](https://github.com/yhsure/riemannian-generative-decoder) contains a more complete implementation.








> [!example]- Training procedure
> Assuming a neural network RGD which maps from latent_dim to data_dim, a basic training loop is defined like so:
> 
> ~~~python
> model = RGD(layer_dims=[latent_dim, 32, 64, data_dim], 
>             manifold=geo.manifolds.Lorentz(c=5.0))
> model.z = model.init_latents(n_samples) # init as geoopt.ManifoldParameter
> model_optim = torch.optim.Adam(model.decoder.parameters())
> rep_optim = geo.optim.RiemannianAdam([model.z])
> 
> for epoch in range(num_epochs):
>     rep_optim.zero_grad()
>     for i, data in enumerate(train_loader):
>         model_optim.zero_grad()
>         z    = model.z[i]
>         z    = add_noise(model.z.manifold, z, std) # optional
>         loss = reconstruction_loss(model.decoder(z), data)
>         loss.backward()
>         model_optim.step()
>     rep_optim.step()
> ~~~
> Geometry-aware regularization is recommended for manifolds with non-constant distance metric:
> 
> ~~~python
> def add_noise(manifold, z, noise_std):
>     grad  = torch.randn_like(z) * noise_std
>     rgrad = manifold.egrad2rgrad(z, grad)
>     return manifold.retr(z, rgrad)
> ~~~
> The [GitHub codebase](https://github.com/yhsure/riemannian-generative-decoder) contains a more complete implementation.
