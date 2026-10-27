# Validation and next decision

[← Project](../README.md) · [Cross-project functional record](../../../docs/functional-review.md)

## Reproduce the task

Pause the opening Orbital Shift example. Select a card, change its hold or framing, then replay the sequence and inspect the reading time.

Record the input, settings, browser/hardware, actual output and one meaningful correction. For video, inspect the full encoded duration, frame count, continuous motion and legibility. Keep technical success distinct from whether an unfamiliar creator can complete the job.

## Existing evidence

Recorded direct 4K60 outputs match 7.45 s / 447 frames and 25 s / 1,500 frames. Compatibility capture, long-project responsiveness and viewer readability need further validation.

These are previously recorded fixture results, not a new compatibility certification. The [publication check](../../../docs/publication-checks.md) separately records the source/build checks performed for this repository restructuring.

## Check the published package

From `source/`, run `pnpm verify:source`, `pnpm test` and `pnpm build`. The focused test checks sample migration and preservation of user media; it is not a timing or usability benchmark.

## Next decision

Follow the task and next-step decision in the project README. Capture actual errors, help needed and correction effort with the [creator validation record](../../../docs/creator-validation.md). Continue when the accepted task succeeds; revise the failing control or delivery stage before adding scope. No time-saving, adoption or broad reliability metric is inferred from the current examples.
