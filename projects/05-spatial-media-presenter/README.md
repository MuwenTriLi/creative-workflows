# 05 / Spatial Media Presenter

**Arrange stills and clips into a spatial presentation with editable order and readable holds.**

**[Open the presenter →](https://flipframe-motion-lab.limuwen9.chatgpt.site)** · [Source + local setup](source/) · [Workflow](docs/workflow.md) · [Implementation](docs/implementation.md) · [Validation](docs/validation.md) · [All projects](../../README.md#selected-work)

[![05 / Spatial Media Presenter: workflow preview](../../media/flipframe-editor.png)](https://flipframe-motion-lab.limuwen9.chatgpt.site)

## Input → output

| Input | Output |
| --- | --- |
| Images and video clips, editorial order, showcase range, framing and transition/hold settings. | A timed spatial sequence with white overlays and reviewed MP4 output. |

**Implementation:** React/TypeScript, browser media, Canvas, WebCodecs and mp4-muxer. The motion system is deterministic; it does not choose a story.

## Try one useful task

Pause the opening Orbital Shift example. Select a card, change its hold or framing, then replay the sequence and inspect the reading time.

[Full walkthrough and design decisions](docs/workflow.md). For video tools, inspect the downloaded file as well as the preview: dimensions alone do not establish correct motion, timing or readability.

## Workflow and creator control

The system calculates transitions and draws the accepted sequence. The creator chooses content, order, range, crop, dwell time and graphic treatment.

The [workflow notes](docs/workflow.md) distinguish current behavior from proposed automation. **Contribution:** Supplied visual collection, motion direction, control hierarchy and critique; Codex-assisted implementation.

## Evidence and next step

Recorded direct 4K60 outputs match 7.45 s / 447 frames and 25 s / 1,500 frames. Compatibility capture, long-project responsiveness and viewer readability need further validation. [Reproduction steps and acceptance boundary](docs/validation.md).

## Project map

| Entry | Purpose |
| --- | --- |
| [docs/workflow.md](docs/workflow.md) | Production problem, interaction decisions, walkthrough and creator authority |
| [docs/implementation.md](docs/implementation.md) | Components, source locations and engineering boundaries |
| [docs/validation.md](docs/validation.md) | Reproducible task, recorded evidence, failure cases and next decision |
| [Source + local setup](source/) | Available implementation or presentation materials |

The `source/` directory includes the hosted browser application and a local-only Vite runner. Its manifest records source hashes, hosted version and the differences from the deployment wrapper.
