# Animated Storyboard — canonical application source

[Project overview](../../projects/04-animated-storyboard/) · [Implementation and tests](../animated-storyboard-handoff.md) · [Open the board](https://muwentrili.github.io/creative-workflows/collage-motion/) · [Versioned demo](https://github.com/MuwenTriLi/creative-workflows/releases/tag/animated-storyboard-v0.1.0)

This directory is both the canonical static source and its GitHub Pages publishing location. It remains here to preserve the existing app URL. The project directory supplies the workflow and validation entry points; there is only one copy of the application.

## Run locally

From this directory, with Python 3 installed:

```sh
python -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/`. On Windows, `py -3` can replace `python`. Stop with Ctrl+C. Use local HTTP rather than opening `index.html` as a file; no package installation or build step is needed.

With Node installed, run `node tests/visibility.cjs` here for the focused source-visibility regression checks. The [Release guide](../distribution.md) explains archive checksums and its frozen version.

## Files

- `index.html`: application, Canvas rendering, source management and export.
- `studio-ui.css`, `visualize-base.css`: workspace styling.
- `examples/`: 35-shot manifest, source previews and shared video atlases.
- `process/`: earlier design demos and separately labeled current outputs.
- `tests/`: inclusion, ordering and export filtering checks.
- `licenses/`: vendored dependency notices.

The built-in board shares one preview atlas; uploaded clips do not receive this optimization automatically. Source preview opens on demand. Visitor edits clear on reload; export is silent. See the project validation notes for device, codec and performance boundaries. No additional open-source or media-reuse license is granted by publishing this demo.
