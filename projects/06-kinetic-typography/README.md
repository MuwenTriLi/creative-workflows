# 06 / Kinetic Typography Studio

**Turn spoken English into timed typography that the creator can correct and shape.**

**[Open the typography studio →](https://vox-one.limuwen9.chatgpt.site)** · [Source + local setup](source/) · [Workflow](docs/workflow.md) · [Implementation](docs/implementation.md) · [Validation](docs/validation.md) · [All projects](../../README.md#selected-work)

[![06 / Kinetic Typography Studio: workflow preview](../../media/vox-one-editor.png)](https://vox-one.limuwen9.chatgpt.site)

## Input → output

| Input | Output |
| --- | --- |
| An English voice clip, corrected words, phrase layout and visual settings. The opening silent demo uses authored text. | Timed kinetic type with audio in MP4; a transparent WebM option exists but has not completed the recorded delivery checks. |

**Implementation:** React/TypeScript, Transformers.js, quantized Whisper Base on browser WASM, Canvas and Mediabunny. Speech inference runs locally after model download.

## Try one useful task

Explore the silent example first. For the speech task, import an authorized English clip, confirm the corrected transcript, compare layouts and review against the audio.

[Full walkthrough and design decisions](docs/workflow.md). For video tools, inspect the downloaded file as well as the preview: dimensions alone do not establish correct motion, timing or readability.

## Workflow and creator control

The model proposes words and timestamps. The creator corrects wording and punctuation, chooses grouping and emphasis, and accepts synchronization. Meaning must not change to fit the graphic.

The [workflow notes](docs/workflow.md) distinguish current behavior from proposed automation. **Contribution:** Speech-to-type interaction, correction loop, visual direction and acceptance criteria; Codex-assisted implementation. Whisper is the existing inference model, not a model trained for this project.

## Evidence and next step

A clean 16-word synthetic fixture, punctuation correction and 4K H.264/AAC export passed. Real names/noise, measured perceptual sync and alpha output remain unverified. [Reproduction steps and acceptance boundary](docs/validation.md).

## Project map

| Entry | Purpose |
| --- | --- |
| [docs/workflow.md](docs/workflow.md) | Production problem, interaction decisions, walkthrough and creator authority |
| [docs/implementation.md](docs/implementation.md) | Components, source locations and engineering boundaries |
| [docs/validation.md](docs/validation.md) | Reproducible task, recorded evidence, failure cases and next decision |
| [Source + local setup](source/) | Available implementation or presentation materials |

The `source/` directory includes the hosted browser application and a local-only Vite runner. Its manifest records source hashes, hosted version and the differences from the deployment wrapper.
