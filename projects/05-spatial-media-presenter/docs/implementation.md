# Implementation

[← Project](../README.md) · [Local source and setup](../source/) · [Validation](validation.md)

```text
Media archive → ordered showcase range → timeline state → spatial preview / Canvas render → encoded sequence
```

| Responsibility | Source | Inspect |
| --- | --- | --- |
| Archive, imports, framing and playback | [app/page.tsx](../source/app/page.tsx) | UI state, media persistence and preview composition |
| Sequence and output | [app/exporter.ts](../source/app/exporter.ts) | `stepSequenceDuration`, `stepSequenceState`, `hookShowcaseState`, `rollMotionOffset`; media loading, Canvas drawing and export |
| Sample migration | [app/sample-project.ts](../source/app/sample-project.ts) | `needsSampleUpgrade` preserves imported media when archiving an older board |

## Engineering boundary

Order, transition and hold durations must produce the same accepted sequence in preview and encoded output. Stored backups exist, but the current UI does not expose saved-board recovery. Long encodes can block interaction. Isolate timeline evaluation from media IO before expanding modes.

The [source manifest](../source/source-manifest.json) maps the copied browser files to a successfully deployed source version. The local runner replaces hosting-specific server/bootstrap files; it does not reproduce the provider's deployment infrastructure. AI-assisted implementation is distinct from runtime agent behavior.
