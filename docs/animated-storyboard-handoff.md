# Animated Storyboard: implementation and test map

[← Case study](../projects/03-collage-motion.md) · [Source](collage-motion/) · [Local demo and releases](distribution.md)

**Task:** put moving shots on one readable board, revise an individual source and export the accepted composition. The working prototype supports this bounded task. This document maps it to code and checks; it is not a claim of an engineering team adopting the feature.

## The decisions behind the implementation

| Observed production issue / feedback | Implemented decision | Inspect in source |
| --- | --- | --- |
| A dense board can stall with many simultaneous videos | Share one video atlas across the built-in 35 shots; fetch a higher-resolution atlas for export | `loadSampleAtlas`, `makeSampleAsset`, `sourceForAsset` in [index.html](collage-motion/index.html); shot IDs and atlas positions in [manifest.json](collage-motion/examples/manifest.json) |
| A reviewer needs to inspect the underlying clip | Open individual playback on demand rather than creating 35 extra players | `previewSource` and `closeSourcePreview` in [index.html](collage-motion/index.html) |
| Removing a shot from the presentation should not require deleting its source | Keep an include/hide flag; derive visible assignments and export sources from it | `visibleAssetIndices`, `assignmentFor`, `exportVideoAssets` in [index.html](collage-motion/index.html) |
| Presentation order changes during review | Move the selected source while preserving its identity and metadata | `moveSelectedAsset`; the `#001` position is separate from the `S053` source ID |
| A file can encode successfully while its pictures or timing are wrong | Seek source media for each output time and inspect decoded frames and duration | `seekExportSources`, `exportStandardMp4`; [functional review](functional-review.md) |

These mechanisms apply to the supplied example and current local-media paths. Uploaded libraries are not automatically converted into a shared atlas. The remaining UI and rendering logic live in one HTML application; a future engineering integration should separate media loading, state, rendering and export behind tested interfaces.

## Reproduce a local correction

1. [Run the release locally](distribution.md) or open the [public board](https://muwentrili.github.io/creative-workflows/collage-motion/).
2. Start from the 35-shot example. Open **Source clips** below the canvas and preview a source.
3. Uncheck **Included in board** for that source. Confirm it remains in the source collection and disappears from the board.
4. Reorder an included source; verify its source ID stays with it. Restore the hidden source with **Include all** when needed.
5. Export the chosen board and inspect the downloaded video for the selected order, exclusions, motion, labels and timing.

For the focused source-filtering checks, run `node docs/collage-motion/tests/visibility.cjs` from the repository root. Node is only needed for this check, not for using the static app. The check covers hidden-source exclusion, reorder, empty boards and export-source filtering; it does not measure usability or GPU performance.

## Acceptance evidence and remaining work

The recorded 8 s sample exports at 3840 × 2160 / 24 fps / 192 frames, with decoded motion in every one of the 35 tiles. A later 2 s / 48-frame 4K check covers a board with a hidden source. These are bounded fixtures described in the [functional review](functional-review.md), not broad compatibility certification.

The next product test is an unfamiliar filmmaker importing five clips, making one local correction and delivering the result without coaching. Record hesitation, help required, correction effort and output quality. Session persistence and undo remain unimplemented. Prioritize those needs from observed use before expanding automatic editorial behavior.

For a larger handoff, add an observed creator session, explicit supported-device bounds and a completed [acceptance record](creator-validation.md). Current code and the release make the prototype inspectable; those missing records remain visible work.
