# Collage Motion

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**Browser tool · Portfolio 04 · Downloadable local demo**

Turn imported images into an animated collage with layout and flash controls.

## Workflow

Import images → arrange the composition and flash timing → preview → export a video.

## Current evidence and packaging status

The local tool has been recovered. A synthetic-image test produced a playable 720p, 5-second H.264 export. The recovered application and its local dependencies are available as a portable ZIP; 4K and long exports have not been verified.

## Demo access

[Download the local demo ZIP](https://github.com/MuwenTriLi/creative-workflows/raw/refs/heads/main/downloads/collage-motion-local-demo.zip)

This entry downloads the actual tool. It is not an online hosted demo.

1. Extract the ZIP. Open a terminal in its `collage-motion` folder.
2. With Python 3 installed, run `python -m http.server 8766 --bind 127.0.0.1` (or `py -m http.server 8766 --bind 127.0.0.1` on Windows).
3. Open `http://127.0.0.1:8766/per-cell-flash-studio.html` in Chrome.
4. Import your images, adjust layout and flash timing, preview and export. Press Ctrl+C in the terminal when finished.

The local address is created on the visitor's own computer after starting the server. If the port is busy, use another port in both the command and address.

## Planned case evidence

A representative finished collage and a short recording showing how the layout or timing changes the output.

The full case will document the problem, a concrete interaction example, Muwen's contribution and use of AI, supported inputs and outputs, setup instructions, and known limitations. Performance claims and implementation details will be added only after verification.

## Source release

The ZIP includes the recovered app, local browser dependencies, license notices and setup instructions. It starts with an empty asset list. Private media, the personal tools portal and conversation backups are excluded.
