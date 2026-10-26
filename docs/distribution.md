# Source, releases and local use

[← Repository map](../README.md#repository-map) · [Interactive board](https://muwentrili.github.io/creative-workflows/collage-motion/)

Use the public web app to review the portfolio without installing anything. Use a **GitHub Release** for a versioned local demo; browse the repository for source and documentation.

## Animated Storyboard local demo

[Open release v0.1.0](https://github.com/MuwenTriLi/creative-workflows/releases/tag/animated-storyboard-v0.1.0) and download **animated-storyboard-v0.1.0.zip** from its Assets section. The package freezes the application at that release's recorded source commit; it contains the static application, its vendored browser dependencies and licenses, and the 35-shot example with preview/export atlases. It supersedes the older Collage Motion ZIP that was stored in the repository.

1. Extract the ZIP and open a terminal inside its `animated-storyboard` folder.
2. With Python 3 installed, run `python -m http.server 8766 --bind 127.0.0.1` (on Windows, `py -3` can replace `python`). No Python packages or build step are needed.
3. Open **http://127.0.0.1:8766/** in a desktop browser. Use Chrome or Edge for the reviewed video-encoding path.
4. Inspect the moving sample board or choose **Import media**. Source clips below the canvas support preview, reorder, framing and include/hide controls.
5. Choose **Review & export**, review dimensions and duration, then inspect the downloaded file. Keep the tab in the foreground during rendering. Stop the local server with Ctrl+C when finished.

Serve the files over local HTTP; opening `index.html` directly can block module and example loading. The core example is bundled; navigation links to the portfolio and other studios still need an internet connection. Visitor files remain in the tab, and reloading clears edits. Exports are silent. Hardware, browser codecs and imported footage affect performance.

The release includes `release-manifest.json` with its source commit and per-file SHA-256 hashes, plus an external `SHA256SUMS.txt` for the ZIP. For a downloaded archive, compare `Get-FileHash -Algorithm SHA256 animated-storyboard-v0.1.0.zip` on Windows or `shasum -a 256 animated-storyboard-v0.1.0.zip` on macOS/Linux with that checksum.

## Why some media remains in the repository

`docs/collage-motion/` is the GitHub Pages application. Its example videos are runtime inputs, so they stay alongside the code. `media/` supplies the README and case illustrations. Versioned installable/demo archives belong in **Releases**, rather than a root download folder. Removing an old ZIP from the current tree does not erase previous Git history.

## Source and rights

| Material | Location / scope |
| --- | --- |
| Storyboard application | [Source](collage-motion/) and the tagged release; this public demo does not add a new open-source license |
| Bundled dependencies | Their license files are retained in `licenses/` |
| Example footage and visual work | Portfolio demonstration only; no separate reuse license is granted |
| Model Breakdown | [Separate repository](https://github.com/MuwenTriLi/model-breakdown-studio): `studio/` records current browser source; the root adaptation retains its existing scoped MIT license |
| Clockwork Blender library | [Commercial product](https://superhivemarket.com/products/steampunk-clockwork-animated-assets); the [public showcase](https://github.com/MuwenTriLi/steampunk-clockwork-showcase) documents its workflow |
| Company work | Approved presentation material only; source scenes and internal Skills are not distributed |

[Export steps and device limits](studio-delivery.md) · [Completed functional checks](functional-review.md)


## Browser source and local runners

| Project | Start here | Recorded hosted version |
| --- | --- | --- |
| Model Breakdown | [Current browser source](https://github.com/MuwenTriLi/model-breakdown-studio/tree/main/studio) | 31 |
| Animated Storyboard | [Static application](collage-motion/) / [Project](../projects/04-animated-storyboard/) | GitHub Pages source in this repository; Release v0.1.0 is a frozen distribution |
| Spatial Media Presenter | [Source and local setup](../projects/05-spatial-media-presenter/source/) | 50 |
| Kinetic Typography | [Source and local setup](../projects/06-kinetic-typography/source/) | 22 |
| Motion Tracking | [Source and local setup](../projects/07-motion-tracking/source/) | 19 |

Each React source package includes `source-manifest.json` with the hosted commit and SHA-256 hashes of copied browser files. The hosted deployments above were confirmed successful on October 26, 2026. The added Vite runners are local adaptations of the hosting entry point, with the browser implementation unchanged. These are recorded snapshots, not automatically synchronized mirrors.

Use Node 22.13+ and pnpm 11.25.0. Enter the selected source directory and run:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm verify:source
pnpm dev
```

`pnpm build` and `pnpm preview` inspect the production bundle. Model Breakdown and Spatial Media Presenter also expose focused `pnpm test` checks. See each package's README and rights notice before reusing code or example assets. This publication grants no new license to source snapshots or media; the earlier Model Breakdown code license retains its stated scope.

The typography demo runs without a speech model. Starting transcription downloads the public Whisper weights and runs inference in the browser; no paid API or API key is configured. Internet is needed for initial package/model downloads and links to other studios. Model and media examples are bundled where stated; private visitor files should never be committed.

Download archives remain in Releases. Source directories are inspectable projects, not download folders. The new source snapshots have not been packaged into new Releases; the Storyboard release above remains the available versioned demo archive. [This publication's checks](publication-checks.md).
