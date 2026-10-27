# Validation and next decision

[← Project](../README.md) · [Cross-project functional record](../../../docs/functional-review.md)

## Reproduce the task

Open the 35-shot board. Under Source clips, preview one clip, hide it, reorder another and inspect the stable source IDs before reviewing export.

Record the input, settings, browser/hardware, actual output and one meaningful correction. For video, inspect the full encoded duration, frame count, continuous motion and legibility. Keep technical success distinct from whether an unfamiliar creator can complete the job.

## Existing evidence

Recorded 8 s / 4K24 / 192-frame output has motion in all 35 tiles; a hidden-source export also passed. Mixed uploaded libraries, undo and persistence remain open work.

These are previously recorded fixture results, not a new compatibility certification. The [publication check](../../../docs/publication-checks.md) separately records the source/build checks performed for this repository restructuring.

## Check the published package

From the repository root, run `node docs/collage-motion/tests/visibility.cjs` for inclusion, reorder, empty-board and export-source filtering checks.

## Next decision

Follow the task and next-step decision in the project README. Capture actual errors, help needed and correction effort with the [creator validation record](../../../docs/creator-validation.md). Continue when the accepted task succeeds; revise the failing control or delivery stage before adding scope. No time-saving, adoption or broad reliability metric is inferred from the current examples.
