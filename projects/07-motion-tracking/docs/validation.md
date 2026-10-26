# Validation and next decision

[← Project](../README.md) · [Workflow and detailed limits](workflow.md) · [Cross-project functional record](../../../docs/functional-review.md)

## Reproduce the task

Import a short high-contrast clip. Pause on a clear frame, choose Track a target or Position anchor, place it, then inspect the path and separate LOCK IN / HUD IN times.

Record the input, settings, browser/hardware, actual output and one meaningful correction. For video, inspect the full encoded duration, frame count, continuous motion and legibility. Keep technical success distinct from whether an unfamiliar creator can complete the job.

## Existing evidence

The revised exporter produces **4.000 s / 240 frames / 60 fps** on a four-second 4K fixture. FHD with source audio also passes video timing, with 10.667 ms AAC padding. [Exact inputs, outputs and results](export-check.md). Target identity through occlusion remains unverified.

The linked October 26 export repair is a new bounded fixture result, not a compatibility certification. Historical failures remain in the cross-project record. The [publication check](../../../docs/publication-checks.md) separately records the source/build checks performed for this repository restructuring.

## Check the published package

From `source/`, run `pnpm verify:source` and `pnpm build`. These verify snapshot integrity and compilation, not tracking accuracy or speech recognition.

## Next decision

Follow the project-specific task and decision in [workflow.md](workflow.md). Capture actual errors, help needed and correction effort with the [creator validation record](../../../docs/creator-validation.md). Continue when the accepted task succeeds; revise the failing control or delivery stage before adding scope. No time-saving, adoption or broad reliability metric is inferred from the current examples.
