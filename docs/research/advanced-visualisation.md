# Would 3D or 4D Gaussian splatting improve any project?

Checked on 2026-11-15 by the `research` agent. Facts come from the repositories' READMEs, licence files and `.gitmodules` (via `gh api`), `npm view`, the Bundlephobia API (BP, gzip size of the latest npm entry bundle) and HTTP headers of public files. Anything not fetched is written "not checked". This is an optional enhancement; the redesign does not depend on it.

## Short answer

For five of the six projects there is nothing photographed, so there is nothing for Gaussian splatting to reconstruct. The sixth (ThickSense) could use it only if a physical prototype exists, someone has captured it, and the team agrees to publish it. Conventional SVG, canvas and Three.js with analytic geometry serve the simulation projects better, cost far less and stay honest about what the data is.

## Two different things called "3D visualisation"

**(a) Reconstruction of a captured scene.** Gaussian splatting takes many photographs or video frames of a real object, works out where each camera stood (COLMAP is the usual tool, mentioned in the 4DGaussians README), and fits millions of small translucent 3D blobs (Gaussians) so that rendering them from any angle reproduces the photographs. The result is a picture-like model of what the camera saw. It contains colour and shape as they appeared, and nothing about temperature, concentration or flow. "4D" variants add time, so a moving scene captured by several cameras (or one moving camera) can be replayed from new viewpoints.

**(b) Physical simulation output.** The owner's projects compute fields and numbers from equations: a concentration c(r,t), a release fraction, a flow rate, a cost. No camera is involved and no real scene exists to photograph. Any 3D picture of such data is a drawing of numbers, so the right tool is one that maps data to colour and geometry exactly, with a legend and units.

The two cannot be swapped. A splat looks real because it copies reality. A simulation plot looks honest because each pixel traces to a number. Showing simulation output as a photorealistic splat would invent a scene that was never photographed.

## The repositories (read today)

| Repository | Role | Licence (SPDX as reported, plus what I read) | Last push | Stars | Notes |
|---|---|---|---|---|---|
| graphdeco-inria/gaussian-splatting | Original method and trainer | NOASSERTION; `LICENSE.md` grants rights for "research purposes ... non-commercially", for evaluation only, with no right to sublicense; commercial use prohibited without consent | 2025-10-17 | 24470 | README: CUDA GPU, compute capability 7.0 or above, 24 GB VRAM to reach paper quality; pre-trained models download is 14 GB for the whole benchmark set |
| hustvl/4DGaussians | 4D (time) Gaussians from multi-view video | Apache-2.0 (file is the Apache text) | 2024-10-27 | 4026 | README: training "only 8 mins" on D-NeRF synthetic data and 30 min on HyperNeRF (GPU model not stated in the lines I searched); uses submodules including `simple-knn` from gitlab.inria.fr, whose licence I did not check |
| JonathonLuiten/Dynamic3DGaussians | Dynamic scenes with tracking | NOASSERTION; README: MIT except `external.py`, and it needs a rasteriser under the "much more restrictive" Inria licence | 2023-12-22 | 2307 | Open3D viewer is 800 FPS rendering but about 30 FPS on screen per the README; last push nearly three years ago |
| ingra14m/Deformable-3D-Gaussians | Dynamic scenes from monocular video | MIT (file text); submodules include `simple-knn` from gitlab.inria.fr | 2024-06-25 | 1269 | README points to a lighter successor; uses D-NeRF, NeRF-DS and HyperNeRF datasets |
| mkkellogg/GaussianSplats3D | Three.js viewer | MIT | 2025-10-19 | 2958 | Reads `.ply`, `.splat`, `.ksplat`. README states "sub-optimal performance on mobile devices". BP 64 kB gzip (version 0.4.7), no dependencies |
| antimatter15/splat | Small WebGL viewer | MIT | 2025-11-16 | 3089 | WebGL 1.0, no dependencies; `main.js` is 51 kB raw and about 12 kB gzip (my gzip -9); `.splat` and `.ply` input |
| sparkjsdev/spark | Three.js renderer, dynamic splats | MIT | 2026-10-20 | 3903 | README targets "98%+ WebGL2 support" and claims fast mobile rendering (vendor claim, not tested). Formats: PLY, SPZ, SPLAT, KSPLAT, SOG. BP 968 kB gzip (2.8 MB raw) for version 2.4.0 |
| playcanvas/supersplat | Browser editor and publisher for splats | MIT | 2026-11-13 | 10641 | A tool for cleaning and compressing splats; not a page component |

The Inria licence is the important one. Anything that trains with the original rasteriser code is limited to non-commercial research and evaluation. A personal portfolio is arguably not commercial, but the portfolio's audience includes employers, so I would take advice before treating it as clean. Permissive trainer wrappers still depend on Inria-licensed pieces in at least two of the three dynamic repositories.

## File sizes, training cost and viewer cost

- **Splat files.** Public `.splat` examples hosted for the antimatter15 viewer (HTTP `content-length` today): plush 9.0 MB, truck 81.3 MB, garden 186.7 MB, bicycle 196.2 MB. The 9.0 MB file divides evenly into about 281,000 splats at 32 bytes each (my arithmetic, assuming the format's 32 bytes per splat). GitHub Pages serves files up to 100 MB per file in a repository (GitHub's documented repository limit, not checked today), so large scenes would need other hosting.
- **Training.** The original trainer asks for a CUDA GPU with 24 GB VRAM. The owner's laptop GPU was not checked. A cloud GPU is a recurring cost I did not price.
- **Viewer.** 12 kB (antimatter15, WebGL 1) up to 968 kB gzip (Spark, BP). The site's own JS is about 1 kB on the deployed home page. Even the smallest viewer is a 12-fold increase, and a splat file adds megabytes on top.
- **Mobile.** Spark claims low-power mobile support; GaussianSplats3D says its mobile performance is sub-optimal. I tested neither.
- **WebGL or WebGPU.** All four viewers work on WebGL (WebGL 1.0 for antimatter15, WebGL2 for Spark). I did not confirm WebGPU requirements for any.
- **4D replay.** 4D scenes multiply storage by time. I found no web viewer in the four above whose README documents playing a trained 4D scene from 4DGaussians or Deformable-3D-Gaussians. Spark describes dynamic splats and animation, which is not the same as loading those trained models. Treat 4D on the web as unproven.

## Project assessment

| Project | Real captured scene? | Verdict | Better tool |
|---|---|---|---|
| STRATO (1D radial diffusion, five-layer spherical TRISO particle) | No. The particle is a model and the output is c(r,t) and release curves | Not suitable | Three.js with analytic geometry: five concentric shells coloured by concentration at a chosen time, with a time slider and a legend; a cut-away quarter sphere; small canvas or SVG line plots for release fraction |
| NUS-H2 (nuclear-heated SMR with carbon capture) | No. A flowsheet and a cost model | Not suitable | The existing interactive process flow diagram and live WASM app; inline SVG with pan and zoom if the diagram grows |
| KASCO (SAF supply chain, Kalimantan) | No scene to reconstruct; map of sites and flows | Not suitable | The existing WASM map; an SVG or canvas map with flow lines scaled to tonnes |
| AmCraX (planned ammonia cracking simulator, no code) | No | Not suitable | Decide after code exists; reactor profiles are 1D curves, so plots first |
| CN5303 (desk study, 100 MW data centre in Singapore) | No. No physical asset | Not suitable | Static figures and an inline SVG block diagram |
| ThickSense (vibration-sensing spoon) | Only if a physical prototype exists; the source shows it only on a competition poster | Possible later | Until then, a photograph or a drawing. A splat could show the object from all angles if a prototype is built and a multi-view capture is made |

Conditions for ThickSense: (1) a working or presentable prototype exists; (2) 100 or more overlapping photographs can be taken with consistent lighting (the original trainer's own datasets use COLMAP input; this count is my estimate, not a README figure); (3) the team agrees to publish; (4) no person appears in the capture; (5) a static 360-degree set of WebP photographs or a short video is judged insufficient.

## Recommendation

Do not add Gaussian splatting to the redesign. None of the simulation projects has a captured scene, the cheapest viewer is a 12-fold increase on the site's JS, and a splat of a simulation would mislead. Where a 3D picture helps, use analytic Three.js geometry that is already in the dependency list, starting with the STRATO shells. Revisit only for a physical ThickSense prototype.

## If revisited: checklist

- A prototype exists, is allowed to be published, and the team agrees in writing.
- A capture was made (photographs or video, no faces, no names visible, no student IDs).
- Decide the licence path first: the Inria trainer is non-commercial research only, so confirm the use is acceptable, or use a trainer whose full dependency chain is permissive (check `gsplat`, Apache-2.0, 2026-09-19 push, which I saw in the repository metadata but did not read in detail).
- Train on a rented or university GPU with at least 24 GB VRAM; record the cost.
- Compress and clean in SuperSplat; target a file under a size you choose (for example 20 MB) and measure.
- Load the viewer only on that page, after a click, so the other pages pay nothing.
- Provide a static fallback (a poster image and a short video) and keyboard access.
- Test on a phone and record frames per second.
- Re-measure the built page against the site's current JS budget before merging.
