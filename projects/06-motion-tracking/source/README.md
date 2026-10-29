# Browser source

The [project README](../README.md) contains the workflow, local setup, features and evidence.

The October 29, 2026 revision extends hosted client version **19** with bounded bright-marker tracking, three selectable example clips, replay/end-frame fixes and an export-review player. It is published through the repository's GitHub Pages build. The original hosted URL and source commit remain in [source-manifest.json](source-manifest.json) as provenance, not a claim that the revised files are byte-identical to that version.

`pnpm verify:source` checks the documented hashes; `pnpm test` runs marker and export-timing checks. The Vite entry point replaces the original hosting wrapper. No API key or cloud model is used by the tracker.

[RIGHTS.md](RIGHTS.md) covers source and media. The three supplied example clips remain presentation assets, not a stock library. Dependencies retain their respective license notices.
