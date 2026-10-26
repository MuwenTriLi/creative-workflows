# Implementation

[← Project](../README.md) · [Local source and setup](../source/) · [Validation](validation.md)

```text
Imported video + creator target → template search/confidence → trajectory → locator and HUD timing → Canvas preview → experimental recording
```

| Responsibility | Source | Inspect |
| --- | --- | --- |
| Input and targeting | [app/page.tsx](../source/app/page.tsx) | `importVideo`, `selectTarget`, `placeStaticAnchor` |
| Tracking and overlay | [app/page.tsx](../source/app/page.tsx) | `buildTemplate`, local `search`, confidence/reacquire state and Canvas rendering |
| Delivery | [app/page.tsx](../source/app/page.tsx) | `exportVideo`, `paintExport` and MediaRecorder timing |

## Engineering boundary

The tracker matches a selected image template; it does not perform semantic object recognition. Separate target identity, trajectory smoothing and graphic readability when reviewing failure. The real-time recorder is not a verified deterministic frame-clock pipeline. Fix the documented timing mismatch before adding harder tracking scenarios; frame-level correction and preserved good intervals remain unverified.

The [source manifest](../source/source-manifest.json) maps the copied browser files to a successfully deployed source version. The local runner replaces hosting-specific server/bootstrap files; it does not reproduce the provider's deployment infrastructure. AI-assisted implementation is distinct from runtime agent behavior.

## Frame-by-frame export revision

`app/export-timing.mjs` plans timestamps; `app/export-mp4.mjs` seeks and encodes with WebCodecs, applies backpressure and muxes MP4 using the vendored, licensed mp4-muxer module. `page.tsx` supplies tracking/HUD rendering and locks editing during export. Source audio is optional and off by default. Cancellation and unsupported-codec errors return control without claiming a completed file. [Tests and measured outputs](export-check.md).
