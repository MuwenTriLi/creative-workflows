# Collage Motion

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**04 / Browser tool · Media composition & motion**

Turn a collection of images and clips into a timed collage, with direct control over layout, movement and the rhythm of individual cells.

**[Open web app ↗](https://muwentrili.github.io/creative-workflows/collage-motion/)** · [Browse the source](../docs/collage-motion/) · [Local backup ZIP](../downloads/collage-motion-local-demo.zip)

![Collage Motion editor with an empty canvas ready for media](../media/collage-motion-editor.png)
*The editor opens with an empty canvas. Import your own images or clips to create a composition.*

## The smallest useful task

**Task:** import three authorized images with mixed proportions, make a five-second collage, revise one asset's framing or one timing decision, then export a 720p clip. A short image-based export has been functionally checked; an unfamiliar creator completing the task unaided remains the next test.

**Local correction:** select the relevant asset and adjust its crop/position/scale, or revise timing while retaining the imported sources. Do not use global randomization for a local framing correction. Parameter editing exists; durable project saving, version comparison and automatic rollback do not. Reloading clears the session.

**Decision now:** test discovery of Import, Timeline and Export before adding new visual modes or an agent. Iterate where people hesitate or corrections affect the wrong scope. Expand automation only after users can retain accepted choices and deliver an output they approve.

## The problem

An animated image wall combines two jobs: composing many differently sized assets and controlling when each one appears or changes. A new image order, grid size or pacing decision can mean revisiting many individual layers and keyframes. The creative decision is the composition and rhythm; the repetitive work is keeping all those cells coordinated.

## The approach

Put the media library, canvas and timing controls in one browser workspace. Layout rules handle the grid; reusable motion settings handle entry and sequencing; per-cell flash controls shape the transition from a quick visual burst to a readable hold. The same collection can be rearranged and previewed without rebuilding the composition.

| Creative decision | Control in the tool | Purpose |
| --- | --- | --- |
| How much content fits? | Rows, columns, spacing, scale and aspect ratio | Explore density while keeping assets legible |
| What should appear first? | Numbered asset order, reorder and randomization | Make sequencing an explicit choice |
| How should the grid move? | Motion direction, stagger, easing and grouping | Coordinate movement across cells |
| How fast should images change? | Flash timing, holds and speed curve | Balance energy with reading time |
| What needs individual attention? | Per-asset crop, position, scale and opacity | Refine one asset without changing the entire wall |

## Try it in one minute

1. Open the app in desktop Chrome. Choose **Import media**, or drag your images/clips into the import area.
2. In **Layout**, change the row or column count and compare the composition.
3. Open **Motion** or **Flash**, adjust one timing control, then use play/pause and the timeline to inspect the change.
4. Refine an individual asset, or use **Clear all** to start a new composition.
5. In **Export**, start with a short **720p MP4**. Save the result and compare it with the preview.

## From prototype to a usable first session

The interface makes three steps explicit: **Import media → Compose & preview → Review & export**. A first-time creator begins with an empty canvas and a visible import action. The timeline stays above the preview; it supports scrubbing, frame-rate-based keyboard stepping, restart and replay. Rectangular media thumbnails show the full source proportions without oval cropping.

The system calculates layout, applies the selected motion rules and reports media readiness. The creator decides the sequence, subject framing and timing. The export panel summarizes dimensions, frame rate and duration; it blocks export while media is missing or unready and locks editing while rendering. The creator then reviews the downloaded result. This is implemented interaction behavior, not a claim of autonomous AI editing.

The iteration began with Muwen's direct review of the public editor. This is practitioner feedback, not a recruited user study:

| Observed problem | Implemented response | Verification and remaining question |
| --- | --- | --- |
| Import and output were hard to locate | Numbered import/compose/export stages, an empty-state import action and a persistent export entry | Controls and empty state checked; unassisted discovery remains to test |
| The timeline sat below a large preview and playback was difficult to control | Timeline above the preview, frame stepping, restart and replay at the end | Scrub, keyboard step and end/replay checked |
| White margins, pill shapes and oval thumbnails departed from the intended editor | Dark full-page surface, default sans font, restrained rectangular controls and uncropped rectangular source thumbnails | Desktop and narrow-screen layout checked with landscape, portrait and square media |
| Starting an export did not make readiness or review clear enough | Output summary, missing/unready-media gate and locked editing during render | Short H.264 exports decoded; controls restore after completion. The creator still judges the visual result |

**Usability question to validate next:** can a new creator import their own media, change one composition or timing decision, and download a suitable clip without help? Observe the first point of hesitation and whether they find Import, Timeline and Export. No first-user test or completion-rate claim is made yet.

## Design contribution and reusable workflow

The project brings layout, sequencing and motion controls into a focused creative tool. Muwen's direction is expressed through the control model and iterative visual decisions, with Codex-assisted implementation. Reuse happens through the editor's parameters: replace the inputs, keep or change the timing recipe, and produce a new sequence.

This is a browser application with a repeatable workflow. An installable agent Skill is not included in this project.

## Automation, creator control and delivery

**Hypothesis:** a shared layout and timing system can reduce repetitive per-layer adjustments while preserving editorial choices. This is a design hypothesis; comparative creator testing has not been performed.

**Current behavior:** after media import, the editor calculates grid layout and motion from the selected parameters. The creator controls source selection, ordering, crops, timing and output format. It starts empty and paused. AI assisted implementation; the app does not autonomously choose the story or its media.

**Proposed agent behavior:** prepare a layout and timing draft within the selected brief, then show it for adjustment. Replacing chosen media, cropping a key subject or materially changing the sequence needs review. Routine recalculation within accepted parameters should proceed directly. A plan preview and revision rollback are proposed extensions, not existing guarantees.

**Acceptance:** key subjects are not unintentionally cropped, holds allow the intended reading time, no source goes missing, and the decoded export matches the reviewed composition, duration and dimensions. Technical encoding success alone does not establish visual quality.

**Next test / decision:** use the same authorized media and brief to compare the creator's existing workflow with this editor. Record one crop/timing correction and the result. Expand if a new creator completes the task with an acceptable output; iterate if controls or timing cause repeated correction; stop automatic layout for cases where it consistently obscures the intended subject. [Control model and handoff](../docs/creative-control.md).

## Evidence and current limits

- The export path was tested with temporary test images: a **720p, five-second H.264** MP4 with **150 frames at 30 fps** was fully decoded successfully. The editor now starts empty and paused; test graphics are not bundled or loaded. The updated interface was checked with landscape, portrait and square images, timeline scrubbing, frame stepping, end-of-playback replay and a fresh five-second 720p export. English/Chinese switching and the empty state were also checked. This is functional verification, not usability research.
- Media is read through browser file inputs and object URLs; this static app has no media-upload backend. Keep originals separately: reloading clears the working session.
- Export support depends on browser codecs and device resources. Start in desktop Chrome or Edge. Long clips, large mixed-media projects and 4K output still need broader testing.
- A creator-selected finished example and narrated workflow recording will be added next. No measured time-saving or user-research result is claimed here.

## Case evidence to add

One finished collage, a short recording of changing the grid or timing, and the matching exported clip. The comparison should show what changed and why the revised rhythm communicates better.
