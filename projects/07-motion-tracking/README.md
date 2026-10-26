# 07 / Motion Tracking Studio

**Attach a readable locator and information overlay to a chosen target or a fixed position.**

**[Try the prototype →](https://trace-01-motion-tracker.limuwen9.chatgpt.site)** · [Source + local setup](source/) · [Workflow](docs/workflow.md) · [Implementation](docs/implementation.md) · [Validation](docs/validation.md) · [All projects](../../README.md#selected-work)

[![07 / Motion Tracking Studio: workflow preview](../../media/trace-01-editor.png)](https://trace-01-motion-tracker.limuwen9.chatgpt.site)

## Input → output

| Input | Output |
| --- | --- |
| User-supplied video, a selected target or position anchor, overlay text and reveal timing. | A previewed target path and staged HUD. Encoded export is experimental because a recorded timing check fails. |

**Implementation:** React/TypeScript, Canvas template matching, confidence/reacquire state and browser MediaRecorder. This is not a learned object-recognition or agent system.

## Try one useful task

Import a short high-contrast clip. Pause on a clear frame, choose Track a target or Position anchor, place it, then inspect the path and separate LOCK IN / HUD IN times.

[Full walkthrough and design decisions](docs/workflow.md). For video tools, inspect the downloaded file as well as the preview: dimensions alone do not establish correct motion, timing or readability.

## Workflow and creator control

The tracker estimates motion for the selected target. The creator chooses identity, tracking versus pinning, annotation and reveal timing; smoothing cannot correct the wrong subject.

The [workflow notes](docs/workflow.md) distinguish current behavior from proposed automation. **Contribution:** Target/anchor workflow, staged visual hierarchy and review criteria; Codex-assisted implementation.

## Evidence and next step

The 4 s fixture exports as 3.8267 s / 97 frames, failing its stated 60 fps contract. Keep this a prototype until timing and target recovery pass. [Reproduction steps and acceptance boundary](docs/validation.md).

## Project map

| Entry | Purpose |
| --- | --- |
| [docs/workflow.md](docs/workflow.md) | Production problem, interaction decisions, walkthrough and creator authority |
| [docs/implementation.md](docs/implementation.md) | Components, source locations and engineering boundaries |
| [docs/validation.md](docs/validation.md) | Reproducible task, recorded evidence, failure cases and next decision |
| [Source + local setup](source/) | Available implementation or presentation materials |

The `source/` directory includes the hosted browser application and a local-only Vite runner. Its manifest records source hashes, hosted version and the differences from the deployment wrapper.
