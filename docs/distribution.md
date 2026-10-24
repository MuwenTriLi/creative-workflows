# Source, releases and local use

[← Repository map](../README.md#repository-map) · [Interactive board](https://muwentrili.github.io/creative-workflows/collage-motion/)

Use the public web app to review the portfolio without installing anything. Use a **GitHub Release** for a versioned local demo; browse the repository for source and documentation.

## Animated Storyboard local demo

[Open release v0.1.0](https://github.com/MuwenTriLi/creative-workflows/releases/tag/animated-storyboard-v0.1.0) and download **animated-storyboard-v0.1.0.zip** from its Assets section. The package contains the current static application, its vendored browser dependencies and licenses, and the 35-shot example with preview/export atlases. It supersedes the older Collage Motion ZIP that was stored in the repository.

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
| Model Breakdown | [Separate repository](https://github.com/MuwenTriLi/model-breakdown-studio), with its existing scoped MIT code license |
| Clockwork Blender library | [Commercial product](https://superhivemarket.com/products/steampunk-clockwork-animated-assets); the [public showcase](https://github.com/MuwenTriLi/steampunk-clockwork-showcase) documents its workflow |
| Company work | Approved presentation material only; source scenes and internal Skills are not distributed |

[Export steps and device limits](studio-delivery.md) · [Completed functional checks](functional-review.md)
