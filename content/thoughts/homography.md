---
title: Homography
date: 2024-11-10
tags:
  - seed
---
## Deriving 2D transforms from 4 points
[Source](https://en.wikipedia.org/wiki/Direct_linear_transformation)


Given 4 pairs of points of the form $(x,y) \rightarrow (x',y')$, compute the homography matrix 

$$
h = \begin{bmatrix}
h_{11} & h_{12} & tx \\
h_{21} & h_{22} & ty \\
h_{31} & h_{32} & 1
\end{bmatrix}
$$

We write the pre-transformed points as $P$ and the transformed points as $P'$

$$
P = \begin{bmatrix} x_1 & y_1 \\ x_2 & y_2 \\ x_3 & y_3 \\ x_4 & y_4 \end{bmatrix}, \quad P' = \begin{bmatrix} x'_1 & y'_1 \\ x'_2 & y'_2 \\ x'_3 & y'_3 \\ x'_4 & y'_4 \end{bmatrix}
$$

### Defining the equation

$$
\begin{align*} x' = \frac{h_{11}x + h_{12}y + tx}{h_{31}x + h_{32}y + 1} \\ y' = \frac{h_{21}x + h_{22}y + ty}{h_{31}x + h_{32}y + 1} \end{align*}
$$

After cross-multiplying and re-arranging:

$$
\begin{align*}
h_{11}x + h_{12}y + tx - h_{31}xx' - h_{32}yx' = x' \\
h_{21}x + h_{22}y + ty - h_{31}xy' - h_{32}yy' = y'
\end{align*}
$$


$$
\begin{bmatrix} x_1 & y_1 & 1 & 0 & 0 & 0 & -x_1x'_1 & -y_1x'_1 \\ 0 & 0 & 0 & x_1 & y_1 & 1 & -x_1y'_1 & -y_1y'_1 \\ x_2 & y_2 & 1 & 0 & 0 & 0 & -x_2x'_2 & -y_2x'_2 \\ 0 & 0 & 0 & x_2 & y_2 & 1 & -x_2y'_2 & -y_2y'_2 \\ x_3 & y_3 & 1 & 0 & 0 & 0 & -x_3x'_3 & -y_3x'_3 \\ 0 & 0 & 0 & x_3 & y_3 & 1 & -x_3y'_3 & -y_3y'_3 \\ x_4 & y_4 & 1 & 0 & 0 & 0 & -x_4x'_4 & -y_4x'_4 \\ 0 & 0 & 0 & x_4 & y_4 & 1 & -x_4y'_4 & -y_4y'_4 \end{bmatrix} \begin{bmatrix} h_{11} \\ h_{12} \\ tx \\ h_{21} \\ h_{22} \\ ty \\ h_{31} \\ h_{32} \end{bmatrix} = \begin{bmatrix} x'_1 \\ y'_1 \\ x'_2 \\ y'_2 \\ x'_3 \\ y'_3 \\ x'_4 \\ y'_4 \end{bmatrix}
$$

We solve $Ah = b$ for $h$ (i. e. $h = A^{-1}b$).

This gets us the 3x3 $h$. However, `matrix3d` takes a 4x4 matrix. Since we don't care about $z$, we can make it just map back to itself:

$$
h = \begin{bmatrix}
h_{11} & h_{12} & 0 & tx \\
h_{21} & h_{22} & 0 & ty \\
0 & 0 & 1 & 0 \\
h_{31} & h_{32} & 0 & 1
\end{bmatrix}
$$
