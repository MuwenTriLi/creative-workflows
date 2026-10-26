# Validation and next decision

[← Project](../README.md) · [Workflow and detailed limits](workflow.md) · [Cross-project functional record](../../../docs/functional-review.md)

## Reproduce the task

Explore the silent example first. For the speech task, import an authorized English clip, confirm the corrected transcript, compare layouts and review against the audio.

Record the input, settings, browser/hardware, actual output and one meaningful correction. For video, inspect the full encoded duration, frame count, continuous motion and legibility. Keep technical success distinct from whether an unfamiliar creator can complete the job.

## Existing evidence

A clean 16-word synthetic fixture, punctuation correction and 4K H.264/AAC export passed. Real names/noise, measured perceptual sync and alpha output remain unverified.

These are previously recorded fixture results, not a new compatibility certification. The [publication check](../../../docs/publication-checks.md) separately records the source/build checks performed for this repository restructuring.

## Check the published package

From `source/`, run `pnpm verify:source` and `pnpm build`. These verify snapshot integrity and compilation, not tracking accuracy or speech recognition.

## Next decision

Follow the project-specific task and decision in [workflow.md](workflow.md). Capture actual errors, help needed and correction effort with the [creator validation record](../../../docs/creator-validation.md). Continue when the accepted task succeeds; revise the failing control or delivery stage before adding scope. No time-saving, adoption or broad reliability metric is inferred from the current examples.
