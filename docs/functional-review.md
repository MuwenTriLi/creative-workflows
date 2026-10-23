# Functional review · 22 October 2026

[← Project index](../README.md) · [Product decisions](review-guide.md) · [Evidence to add](evidence-to-add.md)

These are bounded checks on Windows in the Codex in-app Chromium browser. They are not a cross-browser certification or a creator study. Synthetic geometry, speech and tracking clips are QA fixtures, not portfolio artwork. A file that decodes can still fail the creative or timing requirements.

| Case | What was actually exercised | Observed result | Boundary |
| --- | --- | --- | --- |
| 01 Clockwork | Original supplied linework, render and viewport recordings; separate presentation derivatives | Paired stills and two workflow clips prepared; 6 s / 9 s H.264 viewing copies decode fully | No fresh Blender driver or end-to-end Skill execution in this review |
| 02 Model Breakdown | Original hosted app: three-part synthetic GLB → orientation/explode/selection → 2 s export. Later, supplied Wood House / Press Manufacturing Line / Car Production Line: loading, switching/cancel, explode, selection; local Wood House file import | Synthetic export: H.264, 3840 × 2160, 30 fps, 60 frames, 2.000 s, full decode. Three real inputs retain 18 / 32 / 30 named parts; 19 tests and production build pass. [Library check](https://github.com/MuwenTriLi/model-breakdown-studio/blob/main/docs/example-model-review.md) | Full export and continuous-frame quality from the three real inputs remain unverified. Four supplied architectural films are separate final-output evidence, not newly reproduced exports |
| 03 Architecture Growth | Newly supplied completed illoca films, selected frame extraction and presentation-copy decoding | Tennis, detail, tower and office visuals now accompany the method; MP4/GIF viewing copies decode | No new Blender render, internal Skill execution or comprehensive original-scene verification; local correction recording still pending |
| 04 Collage Motion | Supplied 40-clip library, nine-shot default board, sample switching, single-cell replacement, local test-image import and replacement/cancel gate; earlier mixed-proportion image and timeline checks | New nine-video board export: H.264, 1280 × 720, 24 fps, 192 frames, 8.000 s; full decode; all nine cells change. All 40 viewing copies decode | One browser/configuration; large visitor videos, long projects, 4K and an unassisted creator session remain to check |
| 05 FLIPFRAME | Import a synthetic 4 s clip; trim that clip to 2 s; set a two-card showcase; export 4K | The UI expected 4.65 s. The downloaded H.264 compatibility-path file is **95.0367 s**, with 278 decoded frames and average frame rate about 2.96 fps. **Timing acceptance fails.** | This is one environment/configuration. A completion message is not evidence of a timing-correct export. Existing archive media was not republished |
| 06 VOX / ONE | Import 7.55 s local synthetic English speech → automatic transcript → punctuation correction → Confirm & Apply → Build 2 Lines → MP4 | All 16 spoken words matched this fixture. Punctuation-only edit preserved displayed word times. H.264 4K / 30 fps / 227 frames with AAC audio; container 7.5733 s; full decode passes | Not a speech accuracy benchmark. No proper-noun/noise/accent test, precise perceptual sync measurement, alpha export or NLE round trip |
| 07 TRACE / 01 | 4 s moving target with an occluder → Follow Object → target selection → playback → FHD export | Confidence fell during the run and ended at 88%; the exported midpoint shows REACQUIRE. H.264 file decodes, but **3.8267 s / 97 frames / about 25.35 average fps** does not meet the stated 60 fps timing contract | No target-accuracy score or reliable occlusion recovery claim. Local frame/interval repair remains unverified |

## Export issues that change the product decision

### FLIPFRAME: do not equate encoding completion with delivery

Reproduction: import a four-second clip, trim it to two seconds, select a two-card slow showcase, set rail deceleration to 1200 ms and retain 0.45 s transition / 0.9 s hold / 1.2 s ending hold. The interface reports 4.65 s. The observed `spectra-16x9-4k-direct.mp4` does not preserve that duration.

Read-only source inspection found a direct encoder and a MediaRecorder compatibility path. The output filename identifies the compatibility path; its timestamp behavior is a plausible cause, not a proven root-cause fix. The panel's unconditional offscreen/60 fps wording needs to match the actual path.

**Next acceptance fixture:** 4.65 s at 60 fps should produce the intended 279-frame sequence with monotonic presentation timestamps and duration within one output frame of the agreed endpoint convention. Inspect the first/last frame and card order. Unsupported devices should receive a clear limitation instead of a success claim for a mistimed file. Iterate export before adding 6K/8K features.

### TRACE: verify encoded timing and target identity separately

Reproduction: import the 960 × 540 / 30 fps / 4 s synthetic occlusion clip, select Follow Object, click the target, preview and export at FHD. The current file is decodable but shorter and less evenly sampled than the interface promises.

**Next acceptance fixture:** define whether the output contract is constant 60 fps or source-rate/VFR. For a four-second constant-60-fps contract, verify 240 frames, correct endpoint handling and monotonic 1/60 s timestamps. Then inspect the entire path through occlusion and re-entry. Do not count a smooth path or high final confidence as proof of correct target identity. Provide a reviewable failed interval before claiming local recovery.

## Where processing happens

Read-only source checks found browser-local handling on the tested paths: FLIPFRAME canvas/video encoding, TRACE image-template tracking and MediaRecorder export, and VOX Whisper inference via Transformers.js/WASM plus local video/audio encoding. VOX downloads public model weights on first use. No paid inference API invocation was found in these tested paths or made during this audit. This is not a general security or billing audit of every dependency.

The three source checkouts were left unchanged. Their code and existing private/media content were not copied into this public repository.

## Source and verification scope

Original hosted source revisions inspected: FLIPFRAME `0ccc833`, VOX `a72b85a`, TRACE `1ad6a04`. Collage UI revision: `0593cef`. Model Breakdown's hosted check is separate from the repository's earlier local-adaptation tests.

Encoded files were inspected with ffprobe and decoded with FFmpeg while retaining their source time base. Sampled frames were visually checked. This does not establish uninterrupted visual quality or a completed professional editor round trip. No efficiency, adoption or general accuracy percentage is claimed.

## 2026-10-23 / Moving storyboard update

The sample-board file was exported from the actual Collage editor. Native-frame-rate, 640 × 360 viewing copies replace the need to load 40 original 4K clips. Only a selected example group is loaded for editing; the complete library uses thumbnails. Technical frame checks establish that all nine exported cells change, but do not measure the filmmaker’s communication quality or general device performance. [Case and next test](../projects/03-collage-motion.md).
