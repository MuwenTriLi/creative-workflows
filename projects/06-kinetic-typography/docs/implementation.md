# Implementation

[← Project](../README.md) · [Local source and setup](../source/) · [Validation](validation.md)

```text
Imported audio → browser decode → local Whisper words/timestamps → creator correction → phrase/layout state → Canvas + audio mux → review
```

| Responsibility | Source | Inspect |
| --- | --- | --- |
| Speech and correction | [app/page.tsx](../source/app/page.tsx) | `beginTranscription`, `chunksToWords`, `alignEditedWords`, `autoPunctuateTranscript` |
| Layout, preview and output | [app/page.tsx](../source/app/page.tsx) | Canvas typography and Mediabunny export; dynamic model loading |
| Editable controls | [components/ui/](../source/components/ui/) | Button and Slider components with base-ui primitives |

## Engineering boundary

Whisper uses `onnx-community/whisper-base_timestamped`, q8, WASM. Model files are fetched on first transcription; browser caching is enabled. No paid model API or API key is configured. The opening demo does not download the speech model. Isolate recognition, transcript revision, timing and rendering before adding regional retries. First-use download failures, names, noise and sync tolerance need explicit acceptance tests.

The [source manifest](../source/source-manifest.json) maps the copied browser files to a successfully deployed source version. The local runner replaces hosting-specific server/bootstrap files; it does not reproduce the provider's deployment infrastructure. AI-assisted implementation is distinct from runtime agent behavior.
