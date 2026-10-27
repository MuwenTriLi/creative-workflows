# Documented validation scope

[← Clockwork overview](../README.md) · [Build process](process.md)

This summary is based on the supplied package documentation. The initial portfolio restructuring did not rerun that full animation audit. A later bounded, single-asset run is recorded separately below; the source library was not modified.

- The README records Blender 5.2.0 LTS, Windows and Cycles as the tested environment.
- The release validation record is dated 2026-09-06. It reports default-animation checks across 46 assets and 2,640 drivers over frames 1-1,441, with no invalid or non-finite driver results.
- Targeted clearance checks cover seven selected pairs over 25 sampled frames. They do not establish collision-free behavior for all parts, frames or arbitrary controller values.
- Controls and run/reset semantics vary by asset; they should not be described as universal pause controls.
- The assets are detailed visualization models; no real-time performance or game-export compatibility is promised.

The supplied package contains files with later modification dates. The earlier audit must not be treated as a fresh verification of every later file revision.

Before a new product release, checks should be rerun against that exact release package. This repository is a case study, not a new product release.

## Packaged workflow Skill

`skills/clockwork-assembly/SKILL.md` is a newly packaged instruction workflow based on the documented controls and reuse method. Its frontmatter and package structure were validated. The initial documentation update did not exercise the Skill. The subsequent [CLK32 control study](control-study.md) used a separate working scene to inspect dependencies, adjust one speed input, evaluate 601 frames per setting and render a comparison in Blender 5.2. This validates that bounded procedure, not autonomous redesign or the entire library.
