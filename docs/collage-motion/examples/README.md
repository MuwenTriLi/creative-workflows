# BITFLIP / selected storyboard media

[← Animated Storyboard case](../../../projects/03-collage-motion.md) · [Open web app](https://muwentrili.github.io/creative-workflows/collage-motion/)

The current example contains **35 creator-selected clips**, arranged on one 7 × 5 board. `manifest.json` records each source ID, title, duration and location within the shared video atlas. Individual viewing copies are silent 640 × 360 H.264 at their source frame rates and retain the complete supplied clip durations.

The board uses one optimized preview atlas for simultaneous playback and a higher-resolution atlas for export. Individual source videos open on demand in **Source clips** below the canvas. Stable source IDs stay with their clips when the creator changes order or hides a shot.

`review-board-demo.mp4` is the 1080p viewing copy of the current eight-second, 35-shot editor export. `review-board-4k.mp4` is the checked 3840 × 2160 / 24 fps / 192-frame output. `board-demo.mp4` retains the earlier nine-shot demonstration; it is not the default opening state.

Original source files remain separate. These clips are supplied for portfolio demonstration; inclusion does not grant a separate media reuse license. [Implementation and checks](../../animated-storyboard-handoff.md).
