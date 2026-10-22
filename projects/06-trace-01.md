# TRACE / 01 / Motion Tracking & HUD

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**07 / Browser tool · Target tracking & motion annotation**

Make a moving target easier to follow by connecting its position to a readable path, locator and information overlay.

**[Open web app ↗](https://trace-01-motion-tracker.limuwen9.chatgpt.site)** · No sign-in required

![TRACE 01 video workspace, positioning mode and HUD inspector](../media/trace-01-editor.png)
*Current editor before a source clip is loaded; tracking-result footage is pending.*

## The problem

A motion annotation has two separate requirements: stay attached to the correct subject and remain readable. Tracking may drift, while labels can arrive too early, cover the subject or distract from it. Treating the tracker and graphic styling as separate tasks makes those problems harder to inspect together.

## The approach

Bring source video, frame navigation, target positioning and HUD design into one workspace. Expose **Follow object** and **Static pin** as distinct choices. Separate the locator's entrance from the expanded data panel so the viewer first sees the target, then reads its context.

| Creative decision | Visible control | Purpose |
| --- | --- | --- |
| Follow a subject or mark a place? | Automatic tracking / static pin | Match the overlay's behavior to the explanation |
| How should the path behave? | Search radius and trajectory smoothing | Balance target search and visual stability |
| When should information appear? | LOCK IN and HUD IN timeline markers | Stage attention before adding detail |
| How much visual emphasis is needed? | Locator size, panel size and entrance mode | Keep the source footage legible |
| What information belongs in the graphic? | Title, text fields, color and HUD presets | Adapt the annotation to the scene |

## Walkthrough

1. Import a short clip with a clearly visible, high-contrast target. The upload interface lists MP4, MOV and WebM.
2. Choose **Follow object** (自动追踪) and select a target, or **Static pin** (静态钉住) for a fixed annotation.
3. Scrub through the clip and inspect the target position. Adjust tracking controls if the path drifts; compare against a fixed pin when appropriate.
4. Set **LOCK IN** and **HUD IN** separately. Tune size and text so the overlay explains the subject without covering it.
5. Preview the complete sequence before using the export panel.

## Design contribution and reusable workflow

The design focus is combining motion analysis with visual hierarchy: locating a subject, deciding when to reveal detail, and controlling how much information appears. The same annotation recipe can be adapted to another clip. This entry presents a browser prototype and its workflow, not an installable agent Skill.

## Automation, creator control and delivery

**Hypothesis:** reviewing a target path and its annotation in one place improves the creator's ability to catch drift and control attention. Tracking accuracy and workflow efficiency remain to be measured.

**Current behavior:** the UI exposes tracking, smoothing, static pinning and HUD timing controls. The creator selects the subject and decides whether tracking or a fixed annotation is appropriate. Tracking behavior on difficult clips has not been benchmarked here.

**Proposed agent behavior:** propose a path for the selected target, identify suspect intervals for review, then apply accepted graphic settings. A target switch or an occluded interval should be surfaced, not silently accepted as a correct result. Per-frame confidence, an editable correction path and retained revisions are design requirements to explore; their implementation is not claimed.

**Acceptance:** inspect target identity across the complete sequence, especially occlusions and re-entry; the path does not jump to another subject; HUD text stays readable and does not obscure essential action; the encoded output preserves the reviewed timing and frame alignment. A smooth line can still be attached to the wrong object.

**Next test / decision:** compare a simple high-contrast clip with one containing an occlusion. Record wrong-target intervals, correction effort and the final output. Expand to harder inputs only after failure detection and recovery work; iterate on repeated drift; use a static annotation or stop automatic tracking when target identity cannot be maintained. [Control model and handoff](../docs/creative-control.md).

## Evidence and current limits

The public editor and its positioning, timing and appearance controls are available. Tracking accuracy, occlusion handling and exported-video quality have not been independently benchmarked for this portfolio. Start with a short, simple clip; a clean interface is not evidence that difficult tracking cases work reliably. No measured accuracy or time-saving claim is included.

## Case evidence to add

Show the original clip beside the annotated result, then a short recording of one tracking adjustment and one readability decision. A difficult frame or a corrected drift will communicate the product reasoning better than an uninterrupted ideal result alone.
