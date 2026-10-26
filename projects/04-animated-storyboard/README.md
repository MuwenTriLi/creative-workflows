# 04 / Animated Storyboard

**Compare moving shots on one labeled board, revise a source and export the accepted composition.**

**[Open the board →](https://muwentrili.github.io/creative-workflows/collage-motion/)** · [Canonical source](../../docs/collage-motion/) · [Local demo / Releases](../../docs/distribution.md) · [Workflow](docs/workflow.md) · [Implementation](docs/implementation.md) · [Validation](docs/validation.md) · [All projects](../../README.md#selected-work)

[![04 / Animated Storyboard: workflow preview](../../media/collage-review-board.webp)](https://muwentrili.github.io/creative-workflows/collage-motion/)

## Input → output

| Input | Output |
| --- | --- |
| Local clips or images, shot order, captions and a layout. The supplied example contains 35 selected shots. | A silent moving review board; the accepted page can be exported as a 4K MP4. |

**Implementation:** HTML/JavaScript, Canvas, shared video atlas, WebCodecs and MP4 muxing. No runtime generative model.

## Try one useful task

Open the 35-shot board. Under Source clips, preview one clip, hide it, reorder another and inspect the stable source IDs before reviewing export.

[Full walkthrough and design decisions](docs/workflow.md). For video tools, inspect the downloaded file as well as the preview: dimensions alone do not establish correct motion, timing or readability.

## Workflow and creator control

The system lays out and plays media. The creator owns shot choice, order, framing, captions, timing and acceptance. Hiding a source is separate from deleting it.

The [workflow notes](docs/workflow.md) distinguish current behavior from proposed automation. **Contribution:** Visual direction, supplied material selection, shot-review workflow and iterative critique; Codex-assisted implementation.

## Evidence and next step

Recorded 8 s / 4K24 / 192-frame output has motion in all 35 tiles; a hidden-source export also passed. Mixed uploaded libraries, undo and persistence remain open work. [Reproduction steps and acceptance boundary](docs/validation.md).

## Project map

| Entry | Purpose |
| --- | --- |
| [docs/workflow.md](docs/workflow.md) | Production problem, interaction decisions, walkthrough and creator authority |
| [docs/implementation.md](docs/implementation.md) | Components, source locations and engineering boundaries |
| [docs/validation.md](docs/validation.md) | Reproducible task, recorded evidence, failure cases and next decision |
| [Canonical source](../../docs/collage-motion/) · [Local demo / Releases](../../docs/distribution.md) | Available implementation or presentation materials |

The static source stays in `docs/collage-motion/` because that is the published GitHub Pages path. This project directory provides its workflow and engineering entry points without duplicating the application.
