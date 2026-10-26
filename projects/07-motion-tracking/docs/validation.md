# Validation and next decision

[← Project](../README.md) · [Workflow and detailed limits](workflow.md) · [Cross-project functional record](../../../docs/functional-review.md)

## Reproduce the task

Import a short high-contrast clip. Pause on a clear frame, choose Track a target or Position anchor, place it, then inspect the path and separate LOCK IN / HUD IN times.

Record the input, settings, browser/hardware, actual output and one meaningful correction. For video, inspect the full encoded duration, frame count, continuous motion and legibility. Keep technical success distinct from whether an unfamiliar creator can complete the job.

## Existing evidence

The 4 s fixture exports as 3.8267 s / 97 frames, failing its stated 60 fps contract. Keep this a prototype until timing and target recovery pass.

These are previously recorded fixture results, not a new compatibility certification. The [publication check](../../../docs/publication-checks.md) separately records the source/build checks performed for this repository restructuring.

## Check the published package

From `source/`, run `pnpm verify:source` and `pnpm build`. These verify snapshot integrity and compilation, not tracking accuracy or speech recognition.

## Next decision

Follow the project-specific task and decision in [workflow.md](workflow.md). Capture actual errors, help needed and correction effort with the [creator validation record](../../../docs/creator-validation.md). Continue when the accepted task succeeds; revise the failing control or delivery stage before adding scope. No time-saving, adoption or broad reliability metric is inferred from the current examples.
