# White-marker tracking demo

[Project](../README.md) · [Interactive studio](https://muwentrili.github.io/creative-workflows/motion-tracking/)

Three supplied BITFLIP shots replace the synthetic cross as the main demonstration. Each shot starts with an explicit click on its white marker. The application tracks that selection and draws a locator followed by an information panel. These are rendered footage examples, not a general object-tracking benchmark.

## Files and sequence

| Shot | Original source name | Duration | Example input |
| --- | --- | --- | --- |
| Cube leaps | BITFLIP_026_02m19s00f_cube_leaps.mp4 | 4.5 s | [4K clip](../source/public/demo/cube-leaps.mp4) |
| Ravine flight | BITFLIP_027_02m25s12f_ravine_flight.mp4 | 4.5 s | [4K clip](../source/public/demo/ravine-flight.mp4) |
| Buried machine | BITFLIP_034_03m18s12f_buried_machine.mp4 | 5 s | [4K clip](../source/public/demo/buried-machine.mp4) |

The public inputs are H.264 viewing copies at the original 3840 × 2160 resolution, 24 fps and duration. The supplied originals were not changed. Media rights remain with their existing owners.

The project page shows exactly two silent, matched 14-second players:

- [Source sequence, 1080p](../evidence/white-marker/white-marker-input.mp4)
- [Actual app result, 1080p](../evidence/white-marker/white-marker-tracked.mp4)

[Full-resolution 4K result](../evidence/white-marker/white-marker-tracked-4k.mp4) · [Encoded dimensions, durations, frame counts and SHA-256 hashes](../evidence/white-marker/encoded-results.json)

## Reproduce

1. Open the studio or run the local source. Select an Example footage button; no target is chosen automatically.
2. At the first frame, click the white marker. Approximate seed centers in the 960 × 540 analysis canvas are Cube **(520, 170)**, Ravine **(683, 356)** and Machine **(599, 440)**.
3. Use **Code array**, locator size **70%**, data panel **100%**, and title **SIGNAL / TARGET 01**. Let the locator enter at the start; the data panel enters at **0.9 s** for Cube/Ravine and **1.0 s** for Machine.
4. Select **4K**, **High quality · Smaller file**, source audio off. Export, inspect the review player, then download the MP4.
5. Join Cube → Ravine → Machine with straight cuts. The web copies use 1080p; the retained delivery copy uses 4K. Both are encoded at the original 24 fps cadence, with no speed change, crop or generated intermediate motion.

The three initial browser exports were 4K/60 fps: **270, 270 and 300 frames**, respectively. Their hashes remain in the measurement file; those raw browser files are retained locally. The repository delivery copies are re-encoded at 24 fps. A 60 fps container does not increase source-motion detail.

## Checks on October 29, 2026

- Selected all three markers through the actual browser UI and exported using the application's Canvas/WebCodecs pipeline.
- Decoded every frame of all three browser exports and the three delivery files without decoder errors. Both web videos and the 4K delivery contain **336 frames / 14.000 seconds / 24 fps**.
- Reviewed quarter-second contact sheets across each exported shot and consecutive source-cadence frames during the final half-second of Buried machine, where the marker approaches similarly bright geometry. The locator remains on the white marker in those reviewed frames.
- Ran the same marker detector across all **336 source frames** as a separate diagnostic. No missed detections were reported in that run; this is not an annotated accuracy score. Export checks and visual review are independent of the confidence readout.
- Passed **4 marker tests**, **6 export-timing tests**, TypeScript checking and the Vite production build.

[Cube review](../evidence/white-marker/cube-review.jpg) · [Ravine review](../evidence/white-marker/ravine-review.jpg) · [Machine review](../evidence/white-marker/machine-review.jpg) · [Machine final consecutive frames](../evidence/white-marker/machine-final-frames.jpg)

## Scope and remaining work

The bright-marker branch uses local connected components at several luminance thresholds, size/shape checks and a motion prediction. It holds the last accepted point on detection loss; it does not infer a hidden object's identity. Other selections use the existing template matcher. Browser display callbacks can skip frames; the bright-marker search accounts for elapsed video time, while export seeks and encodes its planned frames sequentially.

This validates the selected white markers in these three shots. It does not establish tracking through full occlusion, robustness to multiple indistinguishable lights, arbitrary camera cuts or semantic object recognition. Ground-truth error measurement, regional retracking and unfamiliar-creator testing remain next steps. The [earlier synthetic fixtures](export-check.md) still document timing and optional audio separately.
