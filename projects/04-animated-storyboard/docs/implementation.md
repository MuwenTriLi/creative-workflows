# Implementation

[← Project](../README.md) · [Canonical source](../../../docs/collage-motion/) · [Detailed function and test map](../../../docs/animated-storyboard-handoff.md)

```text
Example manifest / local media
  → source collection with stable IDs and inclusion flags
  → visible assignment + grid + crop + captions + HUD
  → Canvas preview
  → fixed-time source sampling + higher-resolution example atlas
  → WebCodecs + MP4 muxer → review file
```

The built-in 35-shot example shares one video decoder through an atlas. Individual source playback loads on demand. Uploaded clips do not receive this atlas optimization automatically. The 4K board describes the whole canvas, not the resolution of every tile.

| Component | Source |
| --- | --- |
| Media loading and render/export loop | [index.html](../../../docs/collage-motion/index.html): `loadSampleAtlas`, `sourceForAsset`, `seekExportSources`, `exportStandardMp4` |
| Creator corrections | Same file: `previewSource`, `moveSelectedAsset`, `visibleAssetIndices`, `assignmentFor` |
| Example data | [examples/manifest.json](../../../docs/collage-motion/examples/manifest.json) and [example notes](../../../docs/collage-motion/examples/README.md) |
| Focused regression checks | [tests/visibility.cjs](../../../docs/collage-motion/tests/visibility.cjs) |
| Offline distribution | [Versioned release](https://github.com/MuwenTriLi/creative-workflows/releases/tag/animated-storyboard-v0.1.0) with source/file hashes |

The app remains a monolithic prototype. A production handoff should isolate source loading, project state, rendering and encoding, then define persistence, undo and a supported-device budget. Those are next engineering decisions, not features supplied by this restructuring.
