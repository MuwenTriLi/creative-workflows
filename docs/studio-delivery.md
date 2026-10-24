# First task → review → export

[All projects](../README.md) · [Test results and known limits](functional-review.md)

Each studio has one primary task. Use the opening example to understand the output, then replace the input with your own work. Motion Tracking Studio starts empty because a tracking target must come from the creator's footage.

| Studio | Input | First useful action | Output |
| --- | --- | --- | --- |
| [03 Model Breakdown](https://meshroom-breakdown-studio.limuwen9.chatgpt.site) | A GLB with separate named parts | Compare Assembled / Exploded view; select a component | An explanatory model animation |
| [04 Animated Storyboard](https://muwentrili.github.io/creative-workflows/collage-motion/) | Clips or images | Compare the 35-shot board; replace one cell, adjust spacing and captions | A moving storyboard for shot review |
| [05 Spatial Media Presenter](https://flipframe-motion-lab.limuwen9.chatgpt.site) | Images and clips | Pause Orbital Shift; arrange the archive and set readable holds | A spatial media presentation |
| [06 Kinetic Typography Studio](https://vox-one.limuwen9.chatgpt.site) | English speech in audio/video | Import, check the transcript, correct words and timing, then Confirm & Apply | Timed typography with the source audio |
| [07 Motion Tracking Studio](https://trace-01-motion-tracker.limuwen9.chatgpt.site) | Your video | Find a clear frame, click target 01 or choose Position anchor and click a location | Numbered motion annotation with a path and HUD |

## Model Breakdown: a first 4K export

1. The app loads **Press Manufacturing Line**, with its 32 named parts separated. Compare the two states using **Assembled** and **Exploded view**. The slider controls separation continuously.
2. Select a component in the left list. Pause **ROTATE** to inspect a detail, or keep it on for a turntable. Use the timeline when an emphasis must occur at a particular moment.
3. Choose **EXPORT 4K**. This opens the output panel so you can review the aspect, duration and frame rate before rendering.
4. For landscape, select **16:9 / 3840 × 2160**, then **RENDER**. Allow the tab to finish and save the MP4.
5. Play the downloaded file. Check the beginning, middle and end for cropping, readable emphasis, continuity and correct duration. A completion toast is not the acceptance check.

The revised Press model completed an actual two-second, 4K30 H.264 export: 60 decoded frames, 2.000 seconds, full decode without errors. This is a short technical check, not certification of every model or long sequence.

## Review controls before delivery

- **Collage:** keep shot numbers visible; check captions, spacing and movement inside every cell. Review & export opens resolution and timing controls. The selected example uses an optimized preview atlas; imported high-resolution clips can require more resources.
- **Spatial Media Presenter:** the opening 25-second sequence demonstrates Orbital Shift. Pause to edit; replay the full sequence to inspect order, transitions and holds. Choose Review & export, select 4K and render. The direct encoder has verified 4K60 sample outputs; the compatibility capture path has a separately recorded timing limitation.
- **Kinetic Typography Studio:** the opening animation is a silent, authored example. Import English speech to generate a transcript locally, review the words and apply corrections. Use Premiere MP4 for black-background H.264/AAC; the optional transparent WebM path has a separate validation scope.
- **Motion Tracking Studio:** importing a video does not create an anchor. Click to select one, play to inspect whether it follows the intended subject, and use Position anchor for a fixed annotation. Review & export exposes output settings. The earlier real-time export did not preserve its stated frame-rate/timing contract; treat Motion Tracking Studio output as a prototype until that issue is resolved.

## Opening on another computer

Use the public HTTPS links above; a local file path or this computer's saved board is not required. The provided Model, Collage and Spatial Media Presenter examples load from public presentation assets. A visitor's own media is imported into that browser. Kinetic Typography Studio downloads public speech-model weights on first use, so that first transcription can take longer.

Editing speed and 4K encoding depend on the browser, codec support, GPU, memory and input size. The desktop-browser checks are recorded precisely in the functional review. Other physical computers, mobile browsers and large user libraries still need testing; identical performance is not claimed.

For a useful creator test, ask an unfamiliar person to complete one row in the table, make one local correction and inspect one export. Record where they hesitate and any help needed. Only add completion times, rework counts or quality scores after that test actually happens.
