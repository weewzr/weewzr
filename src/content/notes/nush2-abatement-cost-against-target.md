---
title: "Reading a levelised abatement cost against a S$100 per tonne target"
description: "How NUS-H2 builds its levelised abatement cost from an annual ledger, why the S$100 per tonne target is missed in every central case, and what the scenario that meets it assumes."
category: "Hydrogen Technologies"
kind: "Research note"
date: 2026-11-10
draft: false
sourceUrl: "https://github.com/weewzr/NUSH2/blob/main/docs/FINAL_DESIGN_DECISIONS.md"
sourceLabel: "NUS-H2 final design decisions, sections 1 and 6"
tags: ["Levelised cost", "HTGR", "Steam methane reforming", "Carbon capture"]
---

## What the number measures

NUS-H2 studies a hydrogen plant in which a high-temperature gas-cooled reactor supplies process heat to steam methane reforming (SMR) and an amine unit captures the CO<sub>2</sub>. Its economics are reported as a levelised abatement cost: the extra annual cost over an unabated SMR of equal hydrogen output, divided by the tonnes of CO<sub>2</sub> abated. The headline Case B plant makes 100,000 Nm<sup>3</sup>/h of hydrogen and abates 578,052 t/y.

Dividing this way turns the target into an annual budget. At S$100 per tonne, the extra cost may not exceed about S$57.8M per year. On the BOAK cost basis, which INL places between first-of-a-kind and nth-of-a-kind, the full ledger over 25 years is S$109.7M per year, or S$189.7 per tonne.

## Building the ledger

The ledger adds lines in stages named L0 to L5. L5 is the full cost set and L3 is kept as a named step. The values below are cumulative and are for BOAK over 25 years.

| Stage | Lines added | S$/t |
|---|---|---|
| L3 | Gas saved, reactor and capture capital, capture fixed O&M, CO<sub>2</sub> transport and storage, reactor O&M and fuel, intermediate heat exchanger loop, licensing, decommissioning | 137.7 |
| L4 | Interest during construction, power island add-back, recycle and cryogenic train | 174.5 |
| L5 | Lost steam export, avoided grid power | 189.7 |

The reactor capital charge is S$69.58M per year over 25 years and S$60.01M over 60 years, so either value alone exceeds the whole S$57.8M budget. The gas saved against the unabated plant is a credit of S$64.80M per year, which does not cover the other lines of the ledger.

## Why the target is missed

All 8 central cases miss: L5 and the discounted cash flow, BOAK and first-of-a-kind (FOAK) costs, 25 and 60 years. On L5, BOAK gives S$189.7 and S$165.6 per tonne, and FOAK gives S$277.9 and S$241.7. A discounted cash flow at 8% real is a separate method on the same cost set. It gives S$190.1 for the base case, and across all 72 of its points the largest difference from L5 is 0.47%, so the miss does not depend on the accounting method.

The repository also solves for the single input that would reach S$100 per tonne, at L5, BOAK and 25 years. Gas would have to cost S$30.70 per GJ against the central S$15. Reactor capital cost would have to fall from US$2,184 to US$824 per kWth (2019 dollars). Transport and storage would need a price of minus S$84.2 per tonne, so no tariff cut can close the gap alone.

## The scenario that meets it

The named scenario MATURE_60Y reaches the target by stacking conditions, each changing the one above it.

| Step | Condition | L5, S$/t |
|---|---|---|
| 1 | BOAK, 25 years, gas at S$15/GJ | 189.7 |
| 2 | Tenth-of-a-kind cost stage, 25 years | 146.3 |
| 3 | Tenth-of-a-kind cost stage, 60 years | 128.2 |
| 4 | Tenth-of-a-kind cost stage, 60 years, gas at S$20.7/GJ | 95.6 |

Dearer gas lowers the cost because NUS-H2 burns less gas than the SMR it is compared with. The repository flags that S$20.7 per GJ lies above the S$10 to S$20 range its evidence supports. At S$20 per GJ the scenario gives S$99.6 per tonne. The target test counts only central cases, so the base result stays the reference.

## Limits

Reactor capital comes from INL's literature review of cost estimates, and no vendor quote is held. The transport and storage tariff of S$60 per tonne and the 85% availability are assumptions. The validation record lists failed benchmarks openly and states that no part of the engine carries the author's sign-off yet.

This note summarises the public project documentation.
