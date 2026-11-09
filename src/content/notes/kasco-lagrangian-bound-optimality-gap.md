---
title: "How a Lagrangian bound gives a facility-location search a proven gap"
description: "How KASCO relaxes supply and demand constraints to obtain a lower bound on network cost, and how that bound was checked against an independent solver."
category: "Sustainability"
kind: "Computational study"
date: 2026-11-10
draft: false
sourceUrl: "https://github.com/weewzr/KASCO/blob/main/docs/MODEL.md"
sourceLabel: "KASCO mathematical model, solution method and status of results"
tags: ["Lagrangian relaxation", "Facility location", "Branch and bound", "Sustainable aviation fuel"]
---

## The question a heuristic cannot answer

KASCO plans a Sustainable Aviation Fuel network across Kalimantan. It decides which refineries to open, how large they should be, and how biomass and fuel flow to four airports. A good layout is easy to propose. A planner also needs to know how far it could be from the best possible one. KASCO answers with a lower bound on cost, so every reported cost carries a proven gap to the optimum.

## Relaxing the coupling constraints

On candidate sites the problem is a capacitated facility location model. Two sets of constraints tie the sites together: each biomass site can supply only the biomass it has, and each airport must receive its demand. KASCO relaxes both with non-negative multipliers: a price `u_i` on the biomass at site `i` and a reward `lambda_a` for delivery to airport `a`.

With those terms in the objective, the sites no longer interact. Each one solves a small subproblem exactly: it buys the cheapest biomass and sells to the best-paying airports, within its capacity. The bound is the value of the cheapest set of sites that still covers the required capacity, minus each price times the biomass available at its site, plus each reward times its airport's requirement.

Any design that meets the original constraints pays a penalty of zero or less on both relaxed terms, so its penalised cost is no higher than its true cost. The best penalised cost over every design the relaxed problem allows is therefore at most the true optimum, for any non-negative multipliers. Subgradient steps then tighten the bound by moving each multiplier in the direction in which the relaxed plan violates its constraint.

## Branch and bound

Branch and bound over refinery sites forces a site open or closed and recomputes the bound in each branch. A branch closes when its bound lies within the target gap of the best known design, and the engine's default target is 0.2%. The reported bound is the lowest value among closed and still-open branches, so it is only as strong as the weakest one. The model document adds that biomass sites are near-substitutes, so most of the bound comes from the root relaxation.

## Reading the base case

The gap is the difference between cost and bound, taken relative to the cost. In the published base case on candidate sites, the best design costs USD 890.32M per year and the bound is USD 883.60M, a proven gap of 0.75% (`docs/data/official_base.json`). That run used a 60-second limit and a 0.2% target, and it stopped after 3,975 nodes at the 0.75% gap. The proof covers candidate sites under the model's official inputs. A later step moves plants anywhere on land and lowers the cost to USD 890.09M per year. It finds a local optimum with no global proof, and the repository labels it so.

## Checking the bound itself

A wrong bound is worse than none, so `scripts/verify_bound.py` tests it on five smaller instances, with total demand from 20 to 300 kt, that HiGHS can solve to proven optimality. Each case must show the Rust bound at most the HiGHS optimum, which is at most the Rust cost, within solver tolerances. All five do. The Rust cost matches the HiGHS optimum to within 2 × 10<sup>-6</sup> percent, and the Rust gaps run from 0.11% to 0.31%.

## Limits

The 80 biomass points are modelling inputs and the results are model results. Field depots are a heuristic with no optimality proof.

This note summarises the public project documentation.
