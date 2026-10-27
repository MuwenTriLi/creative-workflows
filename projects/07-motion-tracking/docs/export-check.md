# Export repair: input → encoded file

[← Project](../README.md) · [Implementation](../README.md) · [Measured results](../evidence/export-results.json)

The earlier real-time capture produced **3.8267 seconds / 97 frames** from a four-second fixture. That failed the advertised 60 fps contract. The revised exporter seeks, renders and encodes every planned frame using WebCodecs, then muxes H.264 into MP4. Wall-clock render speed no longer determines the file's timestamps. No successful real-time fallback is implied.

## Reproduce the bounded check

1. Run the version-mapped source using the [local setup](../source/README.md), or open the published studio. Import [the four-second moving-target fixture](../evidence/input-moving-target.mp4). It is generated test geometry, not footage from a client.
2. At the first frame, choose **Track a target** and click the white cross. Keep the default HUD; open **Review & export**, select **4K**, leave source audio off and export.
3. Inspect [the actual 4K result](../evidence/4k-moving-target.mp4). Independently probe and fully decode the file; check the moving input and overlay at several times.
4. Import [the same fixture with a 440 Hz test tone](../evidence/input-target-tone.mp4), choose **Position anchor**, place it, select **FHD** and enable **Include source audio**. Inspect [the actual audio result](../evidence/fhd-static-anchor-audio.mp4).

## Measured October 26, 2026

| Test | Video result | Audio / container | Result |
| --- | --- | --- | --- |
| Moving target, 4K, silent | H.264 · 3840×2160 · 240 decoded frames · 60 fps · 4.000000 s | Silent MP4 · 4.000000 s | Timing contract passes this fixture |
| Static anchor, FHD, source tone enabled | H.264 · 1920×1080 · 240 decoded frames · 60 fps · 4.000000 s | AAC · 48 kHz mono · container 4.010667 s | Video timing passes; AAC packet padding adds 10.667 ms |

Both files fully decoded without errors. The source is 30 fps: rendering a 60 fps container does not invent additional source-motion frames. The test tone exercises audio preservation, not speech recognition or perceived lip sync.

The six Node tests cover frame-plan duration, frame counts, gapless timestamps, a short last frame and invalid inputs. Run `pnpm test` in `source/`. Browser encoding and visual quality require the actual export tests above.

## Scope and next decision

This check used one local Chromium environment. WebCodecs/H.264/AAC availability, long inputs, memory, another physical computer and other codecs remain separate compatibility checks. The app reports unsupported encoding instead of silently substituting a timing-incorrect file.

Tracking is still a prototype. Template matching and smoothing may drift or lag; confidence is not a ground-truth accuracy score. This timing repair does not prove identity preservation through occlusion. The next task is a short authorized real clip with a known target, an occlusion and a creator-reviewed correction. Keep **Position anchor** available when the task only requires a fixed annotation.
