# Functional review · updated 23 October 2026

[← Project index](../README.md) · [Product decisions](review-guide.md) · [Evidence to add](evidence-to-add.md)

These are bounded checks on Windows in the Codex in-app Chromium browser. They are not a cross-browser certification or a creator study. Synthetic geometry, speech and tracking clips are QA fixtures, not portfolio artwork. A file that decodes can still fail the creative or timing requirements.

## Latest studio revision / 23 October

Projects 04–07 now share Model Breakdown's font, numbered navigation and workspace language. English is the default; a Chinese switch is available. Local builds and TypeScript checks passed for Spatial Media Presenter, Kinetic Typography Studio and Motion Tracking Studio. The latest entrances state each tool’s input, main action and output. Spatial Media Presenter starts Orbital Shift; Motion Tracking Studio starts empty. Model Breakdown uses one public name and a larger, prominent explode control. These presentation changes do not erase the earlier functional limits recorded below.

Anonymous HTTPS requests to all five public tool entrances returned HTTP 200 after publication. Model Breakdown's Worker-only first-response failure was reproduced locally and fixed by loading the browser Draco decoder during model import instead of server rendering. The production-runtime check now returns 200 and loads the default Press model. This verifies public availability, not equivalent performance on other hardware.

| Current check | Result | Remaining boundary |
| --- | --- | --- |
| Model Breakdown / Press Manufacturing Line | Default 32-part model opens at 1500% explode. Actual local-browser H.264 export: 3840 × 2160, 30 fps, 60 decoded frames, 2.000 s; complete decode passes | This is a two-second technical check. Long sequences, the other two real inputs, all camera angles and other physical devices are not certified |
| Collage selected 35-shot example | Actual 4K H.264 export: 8 s, 24 fps, 192 frames. All frames decode; image-content checks across all 35 tile interiors show motion rather than a frozen board | Uploaded libraries, many independent video decoders and other devices still require stress testing. The built-in example uses one preview atlas and a higher-resolution export atlas |
| Spatial Media Presenter revised direct encoder | Two-card 7.45 s / 447 frames and full 25 s / 1,500 frames; both 4K / 60 fps. Sampled frames show the new media and HUD | Long encoding can make the browser unresponsive. Compatibility capture, 6K/8K and other devices are not revalidated |
| Kinetic Typography Studio initial example | Eight-second authored silent typography example, with live style controls | This is not a fresh speech-recognition or export test; the earlier synthetic-speech result below has a separate scope |
| Motion Tracking Studio import-first entrance | No bundled video. Local synthetic clip imports paused with a visible first frame; no target is chosen automatically. Basic moving-target playback and explicit anchor placement checked | Difficult motion and occlusion are not benchmarked. The previous encoded timing failure remains unresolved |

The Collage 4K fix loads the export atlas as a seekable local Blob before frame sampling. An earlier non-seekable media response had produced repeated image content even while the HUD moved. The acceptance check therefore inspects the shot interiors, not just the container duration. Spatial Media Presenter now considers a supported no-preference WebCodecs configuration before falling back to real-time recording.

The supplied process clips are earlier design references; current exported demonstrations are labeled separately in the [demo gallery](https://muwentrili.github.io/creative-workflows/collage-motion/process/). No paid inference API was invoked. Publication used the existing portfolio hosting.

## Earlier audit / retained historical results

The table and reproduction notes below describe the earlier source revisions, before the studio update. The newer results above supersede only the specific paths retested.

| Case | What was actually exercised | Observed result | Boundary |
| --- | --- | --- | --- |
| 01 Clockwork | Original supplied linework, render and viewport recordings; separate presentation derivatives | Paired stills and two workflow clips prepared; 6 s / 9 s H.264 viewing copies decode fully | No fresh Blender driver or end-to-end Skill execution in this review |
| 02 Architecture Growth | Newly supplied completed illoca films, selected frame extraction and presentation-copy decoding | Tennis, detail, tower and office visuals now accompany the method; MP4/GIF viewing copies decode | No new Blender render, internal Skill execution or comprehensive original-scene verification; local correction recording still pending |
| 03 Model Breakdown | Original hosted app: three-part synthetic GLB → orientation/explode/selection → 2 s export. Later, supplied Wood House / Press Manufacturing Line / Car Production Line: loading, switching/cancel, explode, selection; local Wood House file import | Synthetic export: H.264, 3840 × 2160, 30 fps, 60 frames, 2.000 s, full decode. Three real inputs retain 18 / 32 / 30 named parts; 19 tests and production build pass. [Library check](https://github.com/MuwenTriLi/model-breakdown-studio/blob/main/docs/example-model-review.md) | Full export and continuous-frame quality from the three real inputs remain unverified. Four supplied architectural films are separate final-output evidence, not newly reproduced exports |
| 04 Animated Storyboard | Supplied 40-clip library, 20-shot default presentation with source captions and board paging, sample switching, single-cell replacement, local test-image import and replacement/cancel gate; earlier mixed-proportion image and timeline checks | New 20-shot board export: H.264, 1920 × 1080, 24 fps, 192 frames, 8.000 s; full decode; source captions and review framing included. All 40 viewing copies decode | One browser/configuration; large visitor videos, long projects, 4K and an unassisted creator session remain to check |
| 05 Spatial Media Presenter | Import a synthetic 4 s clip; trim that clip to 2 s; set a two-card showcase; export 4K | The UI expected 4.65 s. The downloaded H.264 compatibility-path file is **95.0367 s**, with 278 decoded frames and average frame rate about 2.96 fps. **Timing acceptance fails.** | This is one environment/configuration. A completion message is not evidence of a timing-correct export. Existing archive media was not republished |
| 06 Kinetic Typography Studio | Import 7.55 s local synthetic English speech → automatic transcript → punctuation correction → Confirm & Apply → Build 2 Lines → MP4 | All 16 spoken words matched this fixture. Punctuation-only edit preserved displayed word times. H.264 4K / 30 fps / 227 frames with AAC audio; container 7.5733 s; full decode passes | Not a speech accuracy benchmark. No proper-noun/noise/accent test, precise perceptual sync measurement, alpha export or NLE round trip |
| 07 Motion Tracking Studio | 4 s moving target with an occluder → Follow Object → target selection → playback → FHD export | Confidence fell during the run and ended at 88%; the exported midpoint shows REACQUIRE. H.264 file decodes, but **3.8267 s / 97 frames / about 25.35 average fps** does not meet the stated 60 fps timing contract | No target-accuracy score or reliable occlusion recovery claim. Local frame/interval repair remains unverified |

## Export issues that change the product decision

### Spatial Media Presenter: do not equate encoding completion with delivery

Reproduction: import a four-second clip, trim it to two seconds, select a two-card slow showcase, set rail deceleration to 1200 ms and retain 0.45 s transition / 0.9 s hold / 1.2 s ending hold. The interface reports 4.65 s. The observed `spectra-16x9-4k-direct.mp4` does not preserve that duration.

Read-only source inspection found a direct encoder and a MediaRecorder compatibility path. The output filename identifies the compatibility path; its timestamp behavior is a plausible cause, not a proven root-cause fix. The panel's unconditional offscreen/60 fps wording needs to match the actual path.

**Next acceptance fixture:** 4.65 s at 60 fps should produce the intended 279-frame sequence with monotonic presentation timestamps and duration within one output frame of the agreed endpoint convention. Inspect the first/last frame and card order. Unsupported devices should receive a clear limitation instead of a success claim for a mistimed file. Iterate export before adding 6K/8K features.

<a id="trace-verify-encoded-timing-and-target-identity-separately"></a>

### Motion Tracking Studio: verify encoded timing and target identity separately

Reproduction: import the 960 × 540 / 30 fps / 4 s synthetic occlusion clip, select Follow Object, click the target, preview and export at FHD. The current file is decodable but shorter and less evenly sampled than the interface promises.

**Next acceptance fixture:** define whether the output contract is constant 60 fps or source-rate/VFR. For a four-second constant-60-fps contract, verify 240 frames, correct endpoint handling and monotonic 1/60 s timestamps. Then inspect the entire path through occlusion and re-entry. Do not count a smooth path or high final confidence as proof of correct target identity. Provide a reviewable failed interval before claiming local recovery.

## Where processing happens

Read-only source checks found browser-local handling on the tested paths: Spatial Media Presenter canvas/video encoding, Motion Tracking Studio image-template tracking and MediaRecorder export, and Kinetic Typography Studio Whisper inference via Transformers.js/WASM plus local video/audio encoding. Kinetic Typography Studio downloads public model weights on first use. No paid inference API invocation was found in these tested paths or made during this audit. This is not a general security or billing audit of every dependency.

That initial read-only audit left the three source checkouts unchanged. The later authorized studio revision modified and published the Sites apps; their full source was not copied into this portfolio repository. Only user-approved display media and documentation were added.

## Source and verification scope

Original hosted source revisions inspected: Spatial Media Presenter `0ccc833`, Kinetic Typography Studio `a72b85a`, Motion Tracking Studio `1ad6a04`. Collage UI revision: `0593cef`. Model Breakdown's hosted check is separate from the repository's earlier local-adaptation tests.

Encoded files were inspected with ffprobe and decoded with FFmpeg while retaining their source time base. Sampled frames were visually checked. This does not establish uninterrupted visual quality or a completed professional editor round trip. No efficiency, adoption or general accuracy percentage is claimed.

## 2026-10-23 / Earlier moving storyboard update (superseded)

This earlier revision exported its sample board from the Collage editor. It used native-frame-rate, 640 × 360 viewing copies of 40 supplied clips and showed 20 at a time. That opening state was superseded by the current 35-shot selection and shared atlas described at the top of this record. The earlier export included review overlays and captions. Decode and frame checks do not measure the filmmaker’s communication quality or general device performance. [Case and next test](../projects/03-collage-motion.md).

## First-visit acceptance scope

The revised Model, Spatial Media Presenter, Kinetic Typography Studio and Motion Tracking Studio production builds completed locally. Spatial Media Presenter, Kinetic Typography Studio and Motion Tracking Studio pass TypeScript. Model’s 19 geometry, integrity and application checks pass; its whole-repository TypeScript command still encounters the pre-existing Cloudflare worker declarations described in the model-library review. UI review used a 1280-pixel desktop browser. Anonymous public entry and asset loading are checked after publication; no claim is made that every physical computer performs identically.

See the [first task and export guide](studio-delivery.md) for the actions a reviewer can follow.

## 2026-10-23 / Source management and clearer studio names

04 is now **Animated Storyboard**; 05 is **Spatial Media Presenter**. Existing URLs remain valid, and the shared navigation in 04–07 uses the same names. The former names remain only where needed to identify earlier revisions or files.

Animated Storyboard now exposes the source collection directly below its canvas. Browser checks exercised independent source playback, exclude/include, move earlier/later, remove from board and restore the supplied example. The source preview played a 4.5-second clip; excluded sources remained available in the collection. Assignment regression checks cover hidden sources, board packing without duplicate filler shots, reordered sources, an empty included set, motion-mode assignment and export filtering.

An actual 4K MP4 was exported with source 053 excluded: H.264, **3840 × 2160, 24 fps, 48 frames, 2.000 seconds**. FFmpeg decoded the complete file without errors. A sampled frame confirmed source 053 was absent, the other 34 sources retained their order and the final unused cell stayed empty. This is a bounded export check, not an export-speed or all-device benchmark.

The two replacement Model Breakdown films preserve the complete supplied durations (11.5 and 11 seconds) at 30 fps. The web MP4s are 1080 × 1920 derivatives of the supplied 2160 × 3840 originals; README animations are smaller previews. [Watch the complete films](https://muwentrili.github.io/creative-workflows/model-breakdown-films/).

The three Sites affected by the navigation/name update built successfully before publication. The [sharing guide](share-and-review.md) distinguishes public access checks from physical-device performance and keeps Motion Tracking Studio's existing export-timing limitation explicit.

Post-publication anonymous checks returned HTTP 200 for all five studio entrances and **98 hosted resources**: the 35 storyboard source clips and posters, both playback/export atlases, 15 spatial-presentation visuals, six model-library resources and the five new film-page files. The requests used no account cookies or credentials. Public UI checks confirmed the renamed navigation and the 35-source manager. This verifies availability and the exercised desktop workflows, not identical performance on another physical device.

## 2026-10-23 / Versioned local demo distribution

Animated Storyboard v0.1.0 packages the existing public runtime from commit `7949297b8b3cb8f0c8a8d2b45f3e19d8154aa906`, its dependencies and licenses, and the 35 selected sources with preview/export atlases. No application behavior changed in this documentation/release iteration. The 75.1 MB ZIP passed archive-integrity and required-file checks; SHA-256 values identify the archive and all 83 runtime/media files. GitHub's uploaded-asset digest matches the local ZIP.

The packaged copy was served on local HTTP and opened in the review browser: the 35-shot example loaded, the timeline advanced, and the source manager and six HUD choices were present. The existing source-visibility regression check also passes. These are packaging and startup checks, not a new 4K benchmark or a second-physical-computer certification. Earlier export results and unresolved limits remain scoped above. [Release and local setup](distribution.md).

## 2026-10-23 / Portfolio navigation and documentation review

The presentation follows projects 01–07: Clockwork, Architecture Growth, Model Breakdown, Animated Storyboard, Spatial Media Presenter, Kinetic Typography Studio and Motion Tracking Studio. The project index separates case-study links from direct app/film entrances; implementation, controls and source remain available inside the cases. The repository map and versioned local demo release remain in place.

This review checked 49 Markdown documents across the three public portfolio repositories and 629 internal or cross-repository file/heading references. One stale Spatial Media Presenter anchor was repaired. All 84 distinct public URLs checked returned HTTP 200 or 206 without account credentials, including 17 film files and their covers. The five studio entrances were also opened in the desktop review browser: the model loaded, Storyboard showed its 35-shot board, Spatial Media Presenter loaded its 15-work example, Kinetic Typography Studio showed its authored text demo, and Motion Tracking Studio opened empty for import.

Outdated sample counts, historical-result labels and current control names were reconciled. These are navigation, availability and initial-interface checks. No fresh export benchmark, independent creator study or second-physical-computer certification was performed in this documentation revision; the existing delivery limitations above still apply.
