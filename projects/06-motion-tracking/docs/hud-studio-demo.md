# Seven-shot HUD studio demonstration



[Project](../README.md) · [Synchronized demo](https://muwentrili.github.io/creative-workflows/motion-tracking/compare/) · [Editable studio](https://muwentrili.github.io/creative-workflows/motion-tracking/)



## Recreate the result in the web app



Load an example, then choose **Use demo target**. This explicitly restores the target, selection time and HUD preset listed below. The app prepares the bright-marker path at 24 samples/s. Review it by playing or scrubbing; change the preset, copy, color, scale, offset, entrance or peripheral detail intensity; export using the same Canvas renderer.



The Ruins white cube enters after the shot begins: selection starts at **1.50 s**, without an invented target before it appears. All other selections start at the opening frame. Seed coordinates below use the **960 × 540 analysis canvas**, not 4K display pixels.



| Shot | Duration | Preset | Selection time | Seed X, Y | Source |

| --- | --- | --- | --- | --- | --- |

| Cube leaps | 4.5 s | Signal Lock | 0 s | (520, 171) | [Input](../source/public/demo/cube-leaps.mp4) |

| Ravine flight | 4.5 s | Vector Scope | 0 s | (682, 356) | [Input](../source/public/demo/ravine-flight.mp4) |

| Ruins focus | 4.5 s | Signal Lock | 1.5 s | (48, 151) | [Input](../source/public/demo/ruins-focus.mp4) |

| Aerial landscape | 4.5 s | Signal Lock | 0 s | (520, 429) | [Input](../source/public/demo/aerial-landscape.mp4) |

| Buried machine | 5 s | Data Grid | 0 s | (598, 439) | [Input](../source/public/demo/buried-machine.mp4) |

| Rotating tunnel | 4 s | Vector Scope | 0 s | (504, 265) | [Input](../source/public/demo/rotating-tunnel.mp4) |

| Wireframe chamber | 3.75 s | Data Grid | 0 s | (81, 378) | [Input](../source/public/demo/wireframe-chamber.mp4) |



The seven source files are 4K/24 fps viewing copies of the supplied footage; originals were not modified. Panel entrance is 2 s (2.4 s for Ruins after its later selection); peripheral intensity is 58%, source audio is off. Preset-specific locator and panel scales are defined in `HUD_PRESETS` in [peripheral-hud.ts](../source/app/peripheral-hud.ts). Titles and descriptive copy are authored labels; changing coordinate and time readouts come from the media and selected track.



## Deliveries and synchronization



- [4K HUD sequence](https://muwentrili.github.io/creative-workflows/motion-tracking/demo/hud-studio-4k.mp4): 3840 × 2160, 24 fps, 738 frames, 30.75 s.

- [Synchronized source / HUD comparison](https://muwentrili.github.io/creative-workflows/motion-tracking/demo/hud-comparison.mp4): 3840 × 1080, 24 fps, 738 frames, 30.75 s. Each side is 1920 × 1080.

- [README preview](../evidence/hud-studio/hud-comparison.webp): 1280 × 360, 12 fps, automatic silent loop. Click it for the higher-resolution player.

- [Encoded-file measurements and SHA-256 hashes](../evidence/hud-studio/encoded-results.json).



Each HUD shot was selected and exported through the actual web interface. The retained local browser exports are joined in sequence; FFmpeg performs delivery encoding, scaling and side-by-side assembly only. It does not draw a second HUD. Source and output are contained within one encoded comparison frame, so play, pause, seek and loop cannot put the two sides on separate clocks. The standalone demo and studio play this video muted automatically; browser autoplay preferences may still require pressing Play.



## Checks and boundaries



All seven browser exports and both final MP4 deliveries were decoded in full and their dimensions, durations and frame counts recorded. Contact-sheet review covers all seven shots, with consecutive-frame review of the late white-to-wireframe transition. Unit checks cover small-marker growth, wireframe appearance, selection, motion, loss, reacquisition, cached-path replay and export timing.



The prepared trajectory makes preview and output deterministic for the demonstrated marker selections; shared drawing code keeps style controls aligned. This does not establish semantic recognition or general tracking accuracy. Occlusion, indistinguishable nearby lights and arbitrary cuts still require review. Full path editing and regional retracking are not implemented. The clip source remains in the browser in the published app; no inference API or account is required.



[Cube](../evidence/hud-studio/cube-leaps-review.jpg) · [Ravine](../evidence/hud-studio/ravine-flight-review.jpg) · [Ruins](../evidence/hud-studio/ruins-focus-review.jpg) · [Aerial](../evidence/hud-studio/aerial-landscape-review.jpg) · [Machine](../evidence/hud-studio/buried-machine-review.jpg) · [Tunnel](../evidence/hud-studio/rotating-tunnel-review.jpg) · [Chamber](../evidence/hud-studio/wireframe-chamber-review.jpg) · [Consecutive final frames](../evidence/hud-studio/wireframe-final-frames.jpg)
