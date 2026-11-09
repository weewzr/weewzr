---
title: "Checking a finite-volume diffusion solver against an exact eigenfunction series"
description: "How STRATO tests a conservative finite-volume solver for a five-layer spherical fuel particle against an exact series, and what the observed convergence orders do and do not show."
category: "Nuclear Engineering"
kind: "Computational study"
date: 2026-11-10
draft: false
sourceUrl: "https://github.com/weewzr/STRATO/blob/main/docs/mathematics/v1.0.0/STRATO_Full_Mathematical_Derivation.md"
sourceLabel: "STRATO v1.0 Full Mathematical Derivation, sections 6.6 and 6.7"
tags: ["TRISO fuel", "Diffusion", "Finite volume", "Verification"]
---

## The problem

STRATO v1.0 models the release of fission products from one TRISO fuel particle. Five concentric spherical layers each carry a constant diffusivity. The centre is a symmetry point and neighbouring layers are in perfect contact. The outer surface absorbs everything that reaches it, and all inventory starts in the kernel. The quantity of interest is the release fraction `F(t)`, the share of that inventory which has left the particle.

This problem can be solved exactly, so STRATO solves it twice and lets each answer test the other.

## The two solvers

The finite-volume solver (Code B) balances every spherical shell using exact shell volumes and wall areas. Interface conductances are series resistances. Time stepping is Backward Euler, with one tridiagonal solve per step using elimination without subtraction.

The analytical solver (Code C) treats the layered problem as a Sturm-Liouville eigenvalue problem. It substitutes `u = r c` in each layer, carries `u` and the flux across the interfaces, isolates eigenvalues with a Sturm count and refines them by bisection. The release is the series below, with eigenvalues `L_n` and weights `w_n`:

```text
F(t) = 1 - sum_n w_n exp(-L_n t)
```

## Removing the time error

Backward Euler is first order in time, so its error could hide the spatial error that the study wants to measure. The comparison therefore runs each mesh at three step sizes and combines them:

```text
F_RE = ( 8 F(dt/4) - 6 F(dt/2) + F(dt) ) / 3
```

These weights are the only ones that keep the time-converged value and cancel the terms in `dt` and `dt`<sup>2</sup> of the error expansion. The derivation marks the cancellation as proved, given that expansion.

## What the checks show

On the bundled synthetic five-layer case, with an end time of 2 × 10<sup>5</sup> s:

- Refining the mesh from 100 to 1600 cells, doubling each time, reduces the error against the exact series from 2.19 × 10<sup>-5</sup> to 8.56 × 10<sup>-8</sup>. The observed spatial order is 2.00 at every doubling.
- The inventory balance closes with a relative residual of at most 2.8 × 10<sup>-13</sup>, and concentrations stay non-negative.
- The series is itself checked. Its eigenvalues agree with an independent 50-digit Python solution to a largest relative difference of 3.7 × 10<sup>-13</sup>. At the end time the series agrees with both the Python solution and the spatially extrapolated finite-volume value within 1.3 × 10<sup>-12</sup>.

The verification driver first runs simpler controls, a homogeneous sphere with a classical series and a two-layer case.

## A caveat on temporal order

The printed temporal orders are 0.98, 0.97, 0.94 and 0.89, below the expected value of 1. Each error is measured against the exact series, so it includes the spatial error of the 200-cell mesh, about 5.5 × 10<sup>-6</sup>, which does not shrink as the step is refined. Against a same-mesh reference the orders are 0.999 to 1.000.

## Verification and validation

Both solvers share the same model equations and the inputs are synthetic, so agreement shows that the code solves its equations correctly. It says nothing yet about whether the equations match measured release. Comparison with measured AGR-1 data is planned for v2.0. Two claims stay open. Accuracy of the series for diffusivity contrasts near 10<sup>6</sup> is only claimed, because the synthetic case reaches 2 × 10<sup>4</sup>. At very early times the series can also return a slightly negative release, -8.5 × 10<sup>-14</sup> at 2 × 10<sup>3</sup> s, which lies inside its stated accuracy floor.

This note summarises the public project documentation.
