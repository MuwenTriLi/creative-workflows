# Collage Motion / Animated Storyboard

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**04 / From scattered clips to a presentation-ready moving shot board**

I built an editable review surface for a production problem I recognize: a collection of video files is difficult to compare, discuss and present as one visual direction. Collage Motion brings the shots, their identity and their timing into a single board that a creator can adjust and export.

**[Open the interactive demo ↗](https://muwentrili.github.io/creative-workflows/collage-motion/)** · [Watch the full 8 s review board](https://muwentrili.github.io/creative-workflows/collage-motion/examples/review-board-demo.mp4) · [Browse the source](../docs/collage-motion/)

[![Twenty moving shots with source IDs, editable captions, clip time and review framing](../media/collage-review-board.webp)](https://muwentrili.github.io/creative-workflows/collage-motion/)

*An excerpt from the editor's actual export. The app opens with 20 different shots in a 5 × 4 presentation, with all 40 supplied clips in Asset order and a second board page. The order is curated for this showcase; source IDs remain visible. The complete MP4 preserves the eight-second output.*

## A working instruction demo

The finished example is also the starting project. Its borders, dividers, captions and time displays are editable controls, rendered into the output. The surrounding editor and walkthrough remain working UI.

[![Live Collage Motion workspace with the full presentation and four-step walkthrough](../media/collage-review-interface.png)](https://muwentrili.github.io/creative-workflows/collage-motion/)

| Step | Try it | What the interaction demonstrates |
| --- | --- | --- |
| **01 / Inspect** | Play the board, switch between shots 1–20 and 21–40, or select any of the 40 assets below | Start from a visible result; identify a shot without reopening separate files |
| **02 / Style** | Use **Full presentation**, **Clean board**, or **Customize overlays**; adjust spacing and the grid in Layout | Separate content from presentation; change the overlay without replacing media |
| **03 / Refine** | Select one shot, edit **Shot caption** in Assets, adjust its crop, or choose a replacement from the example library | Make a local correction while retaining the other shots and layout |
| **04 / Deliver** | Choose **Review & export**, check the current page, then export and play the downloaded MP4 | Treat a successful encode and an acceptable creative result as separate checks |

**Use your own material:** the prominent **Import media** button replaces the example with local images or clips. Subsequent imports add to your working library. Restoring the example over personal media asks for confirmation. Source files are unchanged.

**Read the shot card:** `S037` is the supplied source ID; `#06` is its current position. The caption is an editable shot description. `SRC 00:02:00 / 5.0s` shows clip-relative time and duration, with the frame field using the selected output frame rate. It is not an original film timeline, shooting date, or transcribed dialogue. The bottom bar shows clip progress; the outer footer shows the board's time and export frame rate.

## The production problem

In a director's treatment, visual pitch or shot review, teams need to compare composition, atmosphere and motion. Individual files interrupt the comparison; static boards lose movement. Rebuilding a moving contact sheet in an editing package adds layout and labeling work each time a shot changes.

This prototype concentrates on **review and presentation**: show enough context to discuss a visual direction, then change the part that needs attention. It plays clips in parallel and silently. Dialogue, sound mixing and a sequential editorial cut belong to a different task.

## From production experience to product decisions

| Production judgment | Implemented mechanism | Acceptance check |
| --- | --- | --- |
| A first-time viewer needs to understand the outcome before uploading | Complete 20-shot example, 40-source order list and four-step walkthrough | The viewer can find input, preview, local editing and output |
| A dense board needs traceable shot identity | Source IDs, editable descriptions, clip duration/time and progress strips | Every visible shot can be identified and discussed; labels remain readable |
| Presentation styling should not destroy editorial work | Independent full/clean overlay presets and detailed Border controls | Switching appearance retains the media, order and captions |
| Feedback is often about one shot | Selected-source replacement, caption editing and framing controls | Other cells remain unchanged; selecting an asset opens its board page |
| More footage should not mean loading the 4K originals | Approximately 13 MB of 640 × 360 viewing copies for the supplied 1.73 GB library | All 40 source copies decode; the displayed page controls active playback |

Muwen supplied the creative direction, material selection and iterative production critique; Codex assisted implementation. This is evidence of turning production judgment into working interaction. It does not establish autonomous story editing or a completed user study.

## Automation, creator authority and recovery

**The system handles:** loading examples, laying out the grid, rendering accepted overlays, calculating clip time/progress, looping visible clips and encoding the requested page. Clips outside the visible board page are paused. Reduced-motion preferences prevent automatic playback.

**The creator decides:** shot choice, order, captions, crop, density, rhythm, overlay intensity and final acceptance. Descriptive captions can be changed; the app does not infer a narrative or generate dialogue. A curated sample is labeled as sample media.

**Local correction:** revise a caption, crop or source without rebuilding the whole board. **Confirmation boundary:** importing replaces the sample, while loading an example over personal work requests confirmation. Media readiness blocks premature export; editing is locked during rendering.

**Delivery gate:** review the selected page, text legibility, subject framing, motion, duration, frame rate and downloaded playback. Export includes the board overlays; it does not include the editor controls, sound, or all pages automatically. Persistent saving and undo are not implemented; refreshing clears visitor edits.

## Hypothesis, evidence and next decision

**Hypothesis:** a complete moving board with traceable shot labels and local editing lets creators explain a visual direction with less setup. This remains a hypothesis; no time-saving or adoption figure is claimed.

The current 20-shot export is **1920 × 1080 H.264, 24 fps, 192 frames, 8.000 s**, and fully decodes. Functional checks cover the 40-source list, board paging, presentation/clean switching, caption editing, source selection and export. These checks establish a bounded working path, not a general performance guarantee or evidence that unfamiliar users can complete the task unaided. Viewing copies do not regain original 4K detail through a larger export.

**Next creator test:** give an unfamiliar filmmaker five clips and a presentation brief. Observe whether they find Import, make one meaningful crop/caption/spacing correction and deliver an understandable board. Record hesitation, actual completion time and revision effort.

- **Expand** when the board improves the review conversation and the creator finishes without coaching.
- **Iterate** when dense labels, import discovery or correction scope cause confusion.
- **Narrow or stop** this approach when the real need is a sound-synchronized editorial cut rather than a parallel review board.

This connects the case to the creative-technologist role: identify the production bottleneck, build an interactive prototype, expose meaningful creator controls, define delivery checks and decide what to validate next. Agent tool orchestration and engineering adoption are not claimed. [Functional review](../docs/functional-review.md) · [Next evidence](../docs/evidence-to-add.md).

## Media and privacy

BITFLIP clips were supplied by Muwen for this portfolio demonstration. Their inclusion does not grant a separate reuse license. Visitor files are read locally in the browser; the app has no upload backend. Keep originals and export any work you need before reloading.
