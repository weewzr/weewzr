# Wee Zhern Ray

<img align="right" src="assets/readme/perry.png" width="130" title="Perry the Platypus (Disney). Unofficial fan tribute." alt="Perry the Platypus as Agent P, crouching in a dark maroon fedora, shown as fan artwork">

I am a Chemical Engineering student at the National University of Singapore (NUS), with a minor in Hydrogen and Low Carbon Technology, Physics and Community Engagement and Leadership and a specialisation in Safety and Sustainability. I am involved in nuclear engineering research at NUS.

I build computational models of chemical and energy systems, from fission-product transport in fuel particles to low-carbon hydrogen and aviation fuel systems. I care about models that can be checked. Each project below states its assumptions and checks its results against an independent method where one exists. The write-ups also say what each model leaves out.

[Portfolio website](https://weewzr.github.io/weewzr/) | [LinkedIn](https://www.linkedin.com/in/wee-zhern-ray/)

**Affiliations:** [Singapore Nuclear Research and Safety Institute (SNRSI), NUS](https://snrsi.nus.edu.sg) (Dr Ong Kay Chen Theodore, Dr Xiao Sicong); [Department of Chemical and Biomolecular Engineering, NUS](https://cde.nus.edu.sg/chbe/) (Dr Suraj Vasudevan).

<br clear="right">

## Projects

### AmCraX: Ammonia Cracking Simulation and Optimisation Platform

Aspen Plus simulation and interactive platform | [Live app](https://weewzr.github.io/AmCraX/) | [Repository](https://github.com/weewzr/AmCraX) | [Case study](https://weewzr.github.io/weewzr/projects/amcrax/)

Developed from my CN5190 Hydrogen Energy and Technology review essay at NUS. A process simulation and optimisation platform for hydrogen production through ammonia cracking, integrating Aspen Plus V15 with independent Python models to investigate reactor performance, heat integration, hydrogen purification and techno-economic feasibility.

- Automated Aspen Plus simulations with 279 converged runs, independently cross-checked against Python thermodynamic and process models.
- Kinetic modelling of nickel- and ruthenium-based catalysts, alongside sensitivity studies of operating temperature, pressure and ammonia conversion.
- Interactive dashboard for process visualisation, optimisation, techno-economic analysis and model validation. The public site opens on a process simulator that runs in the browser and labels every value with its source.

Stack: Aspen Plus V15, Python, FastAPI, React, TypeScript, SciPy, Cantera, GitHub Pages

### KASCO: Kalimantan SAF Supply Chain Optimiser

Live prototype | [Live app](https://weewzr.github.io/KASCO/) | [Repository](https://github.com/weewzr/KASCO) | [Case study](https://weewzr.github.io/weewzr/projects/kasco/)

Built for Autonomous SG 2026 (Airbus Challenge 3), organised by Acacia Hackathon Society and NUS Product Club. A working planning tool for a Sustainable Aviation Fuel network across Kalimantan, with a Rust solver compiled to WebAssembly so that the whole product runs in the browser with no server.

- Lagrangian branch-and-bound over refinery sites with exact min-cost flow.
- Independent checks: balances recomputed from flow records, with a HiGHS second opinion.
- Interactive network map and an editable scenario simulator that reruns the real solver in the browser.

Stack: Rust, WebAssembly, HiGHS, Python, GitHub Pages

### NUS-H2: Nuclear-upgraded steam methane reforming with carbon capture for low-carbon hydrogen in Singapore

Study with live simulator | [Live simulator](https://weewzr.github.io/NUSH2/) | [Repository](https://github.com/weewzr/NUSH2) | [Case study](https://weewzr.github.io/weewzr/projects/nush2/)

Built for CN4252 Hydrogen and Low Carbon Technologies: Industry Perspectives at NUS. Lecturer: Prof Yan Ning. A low-carbon hydrogen study for Singapore with an open engine and a browser simulator. A high-temperature gas-cooled reactor supplies process heat to steam methane reforming, and an amine unit captures the carbon dioxide.

- Layered Rust engine with every input in a sourced parameter register.
- Mass and energy balances, an emissions ledger, a levelised cost ledger and a discounted cash flow cross-check.
- Interactive process flow diagram, parameter editing, results export and a validation matrix.

Stack: Rust, WebAssembly, JavaScript, Python, LaTeX, GitHub Actions

### STRATO: Spherical TRISO Analysis and Transport Operations

v1.0.1, Phase 2 in design | Website coming soon | [Repository](https://github.com/weewzr/STRATO) | [Case study](https://weewzr.github.io/weewzr/projects/strato/)

A transparent, verifiable model of fission-product release from a single TRISO (tristructural isotropic) coated fuel particle. It solves the same multilayer spherical diffusion problem with a finite-volume method and with an exact eigenfunction series, so each method checks the other.

- Five-layer particle: kernel, buffer, inner pyrolytic carbon, silicon carbide and outer pyrolytic carbon.
- Finite-volume solver with exact shell geometry, series interface conductances and Backward Euler stepping.
- Analytical multilayer eigenfunction solver and full written derivations of both methods.

Stack: Rust, Python, finite volume, Sturm-Liouville expansion, GitHub Actions

## Research interests

Nuclear engineering is the area where I have research involvement. The others are interests that shape my studies and public projects.

| Area | Focus |
| --- | --- |
| Nuclear engineering and energy systems | Nuclear engineering research at NUS, plus a public computational project on fission-product release from TRISO fuel particles. |
| Hydrogen and low-carbon technologies | Low-carbon hydrogen for Singapore through nuclear-upgraded steam methane reforming with carbon capture, and sustainable aviation fuel supply chains across Kalimantan. |
| Chemical process modelling and simulation | Mass and energy balances and flowsheet logic in reproducible process models, with inputs traced to a source and results checked against independent calculations. |
| Techno-economic analysis | Levelised cost and abatement cost ledgers, with sensitivity and scenario studies that show which assumptions drive a result. |
| Process safety and sustainability | Applying process safety and sustainability principles to energy systems, following my specialisation in Safety and Sustainability at NUS. |
| Scientific computing and numerical methods | Finite-volume and eigenfunction methods for diffusion, and mixed-integer optimisation for supply networks, written in Rust and Python and verified with convergence and balance checks. |

## Tools

Listed without proficiency ratings. The repositories above show how each one is used.

| Category | Tools and methods |
| --- | --- |
| Programming | Python, Rust, WebAssembly, JavaScript, LaTeX |
| Engineering | process simulation, process modelling, engineering optimisation, techno-economic analysis |
| Scientific computing | numerical modelling, data analysis, computational methods, verification and validation |
| Development | Git, GitHub, GitHub Actions, GitHub Pages, Cargo |

## More on the website

- **Research and academic work:** [a low-carbon data centre case study for Singapore](https://weewzr.github.io/weewzr/research/cn5303-low-carbon-data-centre/) and [a review essay on ammonia cracking for hydrogen](https://weewzr.github.io/weewzr/research/cn5190-ammonia-cracking/), the essay that AmCraX grew out of.
- **Writing:** [technical notes](https://weewzr.github.io/weewzr/writing/) on the methods behind STRATO, NUS-H2 and KASCO.
- **Community engagement:** [Grant A Wish XXIV](https://weewzr.github.io/weewzr/community/grant-a-wish-xxiv/), which I lead as Project Director.
- **Innovation and competitions:** [ThickSense](https://weewzr.github.io/weewzr/innovation/thicksense/), an iDEATE 2026 semifinalist concept for checking thickened drinks.

## About this repository

This repository holds this profile page and the source of the [portfolio website](https://weewzr.github.io/weewzr/), an Astro site deployed by GitHub Actions. [docs/MAINTAINING.md](docs/MAINTAINING.md) explains how it is built, [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) how to add content, and [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) the colours, type and README conventions used across my repositories.

<sub>Perry the Platypus is a Disney character. Unofficial fan tribute. Not affiliated with or endorsed by Disney.</sub>
