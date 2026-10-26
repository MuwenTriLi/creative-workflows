# Repository publication checks — October 26, 2026

[← Overview](../README.md) · [Source and setup](distribution.md) · [Prior functional export record](functional-review.md)

This revision changes the repository's project structure and publishes browser-source snapshots with local runners. It does not redeploy the hosted studios, change their media/rendering behavior or claim a new end-to-end export benchmark.

## Reproducible package checks

| Package | Check performed for this revision | Result |
| --- | --- | --- |
| Model Breakdown `studio/` | Independent pinned dependency installation, production build, copied-file hashes, model-integrity and explode-layout tests | Build passed; 16 hashes matched; 17 tests passed |
| Animated Storyboard | Existing `tests/visibility.cjs` checks | Passed inclusion/exclusion, ordering, empty boards, motion placement and export-source filtering |
| Spatial Media Presenter `source/` | Independent pinned dependency installation, production build, copied-file hashes and existing sample-migration check | Build passed; 20 hashes matched; 7 migration assertions passed |
| Kinetic Typography `source/` | Independent pinned dependency installation, production build and copied-file hashes | Build passed; 5 hashes matched |
| Motion Tracking `source/` | Independent pinned dependency installation, production build and copied-file hashes | Build passed; 2 hashes matched |

Installations used the public npm registry with dependency install scripts disabled. Model/typography bundles produced size warnings; splitting and download/performance budgets remain engineering work. No speech-model download, paid model inference, cloud provisioning or new site deployment was performed for these checks.

## Source identity

The four hosted source versions (Model 31, Presenter 50, Typography 22, Tracking 18) were read from Sites metadata and their successful deployments confirmed. Copied client source and included media are byte-identical to those recorded commits. Each package includes a manifest and hash verifier.

The Vite runner replaces the hosted server/layout bootstrap. Different bundling, browser state and device capabilities can affect execution. The original Model Breakdown root implementation is retained and clearly labeled as the earlier adaptation.

## Browser checks of the local production builds

Using a 1600 × 1000 desktop viewport, the browser opened each local build without recorded console errors:

- Model Breakdown loaded the 32-part Press Manufacturing Line at 1500% explode. Assembled/exploded switching and Hydraulic Equipment selection worked.
- Spatial Media Presenter loaded the 15-work collection; all observed images and four video sources were ready. Orbital Shift and the Calibration HUD were selectable.
- Kinetic Typography played its authored example. Switching to Build 2 Lines and confirming a punctuation correction updated the displayed words. Speech inference was not rerun.
- Motion Tracking opened without preset media. Position anchor selected the static-pin mode. Tracking a new clip and export were not rerun.
- Animated Storyboard loaded 35 sources. Hiding one changed the board to 34 included while retaining 35 sources; Include all restored the board.

This is a startup/control smoke check of the published source packages, not a full device matrix. The Model Breakdown inspector needs more horizontal space than the initial 1166 px browser viewport; narrower layouts are not certified by the desktop check. Existing codec, performance and timing limits still apply.

## Review boundary

The older 4K export results remain linked from each project rather than being silently re-dated. Motion Tracking's 4 s fixture still fails its timing contract. No human usability study, measured speed improvement, broad browser certification or engineering-team adoption is claimed.

The new source packages make inspection and local reproduction possible. The next product evidence remains one complete input → correction → accepted output recording, followed by an unfamiliar creator performing the same bounded task.

## Navigation review

The local repository review checked 860 internal file and section links across the three repositories with no missing targets. Earlier project filenames and Clockwork gallery anchors remain as compatibility entry points. The Storyboard project-navigation link now goes directly to its new project directory; playback and export code are unchanged.
