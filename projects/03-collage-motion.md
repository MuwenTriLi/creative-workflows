# Collage Motion / Animated Storyboard

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**04 / Browser tool · Shot review, visual pitches and moving storyboards**

Put moving shots on one editable board so a director, designer or client can compare framing, atmosphere and motion before discussing the next edit.

**[Open the interactive board ↗](https://muwentrili.github.io/creative-workflows/collage-motion/)** · [Watch the 8 s sample board](https://muwentrili.github.io/creative-workflows/collage-motion/examples/board-demo.mp4) · [Browse the source](../docs/collage-motion/)

[![Nine moving shots arranged as a review board](../media/collage-storyboard-board.jpg)](https://muwentrili.github.io/creative-workflows/collage-motion/)

*A real export from the editor using Muwen's supplied BITFLIP clips. The interactive app opens with these nine sample shots; all 40 clips are available in the example library. Import media replaces the example with your own images or clips.*

## The production problem

When presenting a film direction, individual video files make comparison awkward: viewers keep opening clips and lose the relationship between shots. A static storyboard shows composition, but cannot convey a camera move, a reveal or a change in atmosphere. Preparing an animated contact sheet in an editing or motion-design package adds repeated layout, scaling and timing work each time the selection changes.

Collage Motion focuses on the **review and presentation stage**: a moving storyboard for a director's treatment, a visual pitch, a shot-selection conversation or a gallery-style presentation. The board shows shots in parallel and loops their motion silently. A sequential animatic with dialogue, sound and an editorial cut is outside the current tool's scope.

## The prototype hypothesis

**If creators can start from a readable moving board, replace its inputs and revise one cell without rebuilding the rest, they can explain a visual direction with less setup.** This is a hypothesis to test with creators; no measured time saving or user-study result is claimed.

The smallest useful task is to replace the example with a few authorized clips, choose a readable grid and spacing, correct one shot's framing, then export an eight-second review board. This tests the core loop before investing in a full editing system.

## Try it in one minute

1. Open the app. The **Featured / 9 shots** board plays immediately, silently. If reduced motion is enabled, press **Play** to begin.
2. Switch **Example board** to explore the supplied sequences, or open **Browse all 40 shots**. Select a cell and choose another shot to replace just that cell.
3. Change **Rows**, **Columns**, **Frame gap** or **Grid scale**. **Storyboard** keeps the board still while clips move; **Motion collage** adds the existing entry and sequencing controls.
4. Press **Import media**, or drop files into the import area, to replace the sample board with your own media. Later imports add to your working library. **Start blank** and **Restore example** are also available; replacing a board containing your media asks for confirmation.
5. Pause or scrub the timeline, correct one source's crop/position/scale in **Assets**, then choose **Review & export**. Start with **720p / 24 fps / 8 s** and play the downloaded result through.

## From production experience to product decisions

| Production need | Implemented decision | Creator retains control of |
| --- | --- | --- |
| Explain the tool before requesting uploads | A complete, editable nine-shot board on first entry; 40 labeled example clips | Which sample or personal media to use |
| Compare shots without visual distractions | Quiet rectangular grid; optional motion mode; no decorative HUD or flash in the default board | Density, spacing, proportions and visual hierarchy |
| Revise one shot during a review | Select a cell and replace only its asset; existing crop and ordering controls remain available | The subject, shot choice and local correction |
| Show a larger library without overloading the browser | 640 × 360 H.264 viewing copies at the source's 24 fps; only the current example board loads its videos | Board selection and playback; originals stay separate |
| Keep unfamiliar users oriented | Visible Import media and Review & export actions; timeline above the board; distinct Storyboard and Motion collage modes | When to import, pause, inspect and deliver |

The supplied 40 source clips total approximately **1.73 GB**. Their silent web viewing copies total approximately **13 MB**, retaining the full supplied clip durations and source frame rate. This is a measured file-size reduction, not a device-performance or productivity claim. The example assets are preview-resolution media; exporting at a larger size does not restore their original 4K detail.

## Automation, confirmation and delivery

**Automatic:** load the selected example board, calculate the grid, loop visible clips, apply accepted parameters and encode the requested output. The bundled example has nine active sources; the other clips are browsed as lightweight thumbnails. Playback pauses when the page is hidden.

**Creator decisions:** story intent, media selection, order, framing, presentation density, duration and final acceptance. The app does not infer a story or autonomously choose an edit. AI/Codex assisted implementation; Muwen supplied the creative direction, source selection and iterative critique.

**Local correction:** swap a selected cell or adjust that asset's framing while retaining the other cells. Restoring an example over imported media requires an in-app confirmation. Media readiness blocks premature export, and editing is locked during rendering. Persistent project saving, revision history and undo remain future work; reloading restores the example and clears unsaved visitor work.

**Delivery checks:** every intended shot is present, key subjects remain readable, motion has no unintended frozen cell, the board's density suits its audience, and the decoded file matches the agreed dimensions, frame rate and duration. Audio is not included in the board export. A successful encode is one technical check; the creator still judges the visual result.

## Verification and next decision

The example's exported **1280 × 720 H.264** file contains **192 frames at 24 fps / 8.000 s** and fully decodes. All nine cells change during the sequence. All 40 compressed source clips fully decode. Browser checks covered example switching, the 40-thumbnail library, replacing one cell, importing a mixture of personal test video and images, and canceling replacement to retain that media. These are functional checks, not an unassisted usability study or a guarantee of playback speed on every device.

**Next creator test:** give an unfamiliar filmmaker or motion designer five clips and a short presentation brief. Observe whether they discover Import, change one crop/spacing decision, and export an acceptable review board without coaching. Record hesitation, corrections and actual completion time.

- **Expand** if the board helps viewers compare shots and the creator completes the task with a usable export.
- **Iterate** if examples obscure the upload entry, the board becomes too dense, or local changes affect the wrong scope.
- **Stop or redirect** this approach when the actual need is a sound-synchronized editorial cut; that calls for a sequential timeline rather than more grid effects.

Further evidence to add: one recorded creative review, the specific local correction it prompted, and the corresponding before/after output. [Functional review](../docs/functional-review.md) · [Material checklist](../docs/evidence-to-add.md) · [Example-first workflow across 04–07](../docs/example-first-workflows.md).

## Media and privacy

BITFLIP clips were supplied and selected by Muwen for this portfolio demonstration. Their inclusion does not grant a separate reuse license. The app reads visitor files locally through browser file inputs; it has no upload backend. Keep your originals and export any work you need before reloading.
