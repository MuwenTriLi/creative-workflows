# 07 / Motion Tracking Studio

[← Project overview](../README.md) · [Implementation](implementation.md)

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**07 / Browser prototype · Target tracking & motion annotation · Export timing under review**

Make a moving target easier to follow by connecting its position to a readable path, locator and information overlay.

**[Open web app ↗](https://trace-01-motion-tracker.limuwen9.chatgpt.site)** · No sign-in required

![Motion Tracking Studio video workspace, positioning mode and HUD inspector](../../../media/trace-01-editor.png)
*The English-default studio starts empty. Import your own video, pause on a clear frame, then click a subject for Target 01 tracking or choose Position anchor for a fixed annotation. No footage or anchor is selected for you. Playback, language and three white HUD presets sit above the preview; output controls sit on the right.*

## The smallest useful task

**Task:** follow one identifiable subject in a short clip, reveal its HUD after the locator settles, and inspect one occlusion or difficult interval. Compare with a static-pin treatment when that better serves the explanation.

**Local correction:** visible controls allow tracking/search, smoothing and HUD timing changes. Smoothing is not a repair for the wrong target. Frame-level correction of a failed interval, locked good segments and regional retracking still need implementation verification; the case does not claim that recovery already works.

**Decision now:** validate target identity and recovery before expanding tracker scope. Preserve the selected subject as a creator decision. If the path cannot recover after an occlusion, narrow the supported shot or use an explicitly chosen static annotation; do not silently accept the wrong subject.

## The problem

A motion annotation has two separate requirements: stay attached to the correct subject and remain readable. Tracking may drift, while labels can arrive too early, cover the subject or distract from it. Treating the tracker and graphic styling as separate tasks makes those problems harder to inspect together.

## The approach

Bring source video, frame navigation, target positioning and HUD design into one workspace. Expose **Track a target** and **Position anchor** as distinct choices. Separate the locator's entrance from the expanded data panel so the viewer first sees the target, then reads its context.

| Creative decision | Visible control | Purpose |
| --- | --- | --- |
| Follow a subject or mark a place? | Track a target / Position anchor | Match the overlay's behavior to the explanation |
| How should the path behave? | Search radius and trajectory smoothing | Balance target search and visual stability |
| When should information appear? | LOCK IN and HUD IN timeline markers | Stage attention before adding detail |
| How much visual emphasis is needed? | Locator size, panel size and entrance mode | Keep the source footage legible |
| What information belongs in the graphic? | Title, text fields, color and HUD presets | Adapt the annotation to the scene |

## Walkthrough

1. Import a short clip with a clearly visible, high-contrast target. The upload interface lists MP4, MOV and WebM.
2. Choose **Track a target** and click the subject for Target 01, or **Position anchor** and click a location for a fixed annotation.
3. Scrub through the clip and inspect the target position. Adjust tracking controls if the path drifts; compare against a fixed pin when appropriate.
4. Set **LOCK IN** and **HUD IN** separately. Tune size and text so the overlay explains the subject without covering it.
5. Preview the complete sequence before using the export panel.

## Design contribution and reusable workflow

The design focus is combining motion analysis with visual hierarchy: locating a subject, deciding when to reveal detail, and controlling how much information appears. The same annotation recipe can be adapted to another clip. This entry presents a browser prototype and its workflow, not an installable agent Skill.

## Automation, creator control and delivery

**Hypothesis:** reviewing a target path and its annotation in one place improves the creator's ability to catch drift and control attention. Tracking accuracy and workflow efficiency remain to be measured.

**Current behavior:** the UI exposes tracking, smoothing, static pinning and HUD timing controls. The creator selects the subject and decides whether tracking or a fixed annotation is appropriate. Tracking behavior on difficult clips has not been benchmarked here.

**Proposed agent behavior:** propose a path for the selected target, identify suspect intervals for review, then apply accepted graphic settings. A target switch or an occluded interval should be surfaced, not silently accepted as a correct result. The current tracker does expose confidence and a REACQUIRE state. A reviewable interval-confidence history, editable correction path and retained revisions remain proposed; a live confidence number alone does not establish recovery.

**Acceptance:** inspect target identity across the complete sequence, especially occlusions and re-entry; the path does not jump to another subject; HUD text stays readable and does not obscure essential action; the encoded output preserves the reviewed timing and frame alignment. A smooth line can still be attached to the wrong object.

**Next test / decision:** compare a simple high-contrast clip with one containing an occlusion. Record wrong-target intervals, correction effort and the final output. Expand to harder inputs only after failure detection and recovery work; iterate on repeated drift; use a static annotation or stop automatic tracking when target identity cannot be maintained. [Control model and handoff](../../../docs/creative-control.md).

## Evidence and current limits

A four-second synthetic occlusion clip was imported, a target selected in Follow Object mode, playback inspected and an FHD H.264 file downloaded. Confidence fell during the run; the exported midpoint shows REACQUIRE. The file decodes, but its **3.8267 s duration, 97 frames and approximately 25.35 average fps fail the stated 60 fps timing contract**. Repair and retest export before presenting it as delivery-ready. This is not an accuracy benchmark or proof of reliable occlusion recovery. [Reproduction and acceptance criteria](../../../docs/functional-review.md#trace-verify-encoded-timing-and-target-identity-separately).

## Case evidence to add

[Specific input package and recording outline](../../../docs/evidence-to-add.md).

Show the original clip beside the annotated result, then a short recording of one tracking adjustment and one readability decision. A difficult frame or a corrected drift will communicate the product reasoning better than an uninterrupted ideal result alone.

## Shared studio, distinct responsibility

The import-first workspace, visible input/output actions, shared navigation, default Arial/Helvetica typography and rectangular dark controls follow Model Breakdown's workspace language. The tool's specific acceptance criteria above remain separate; a common appearance does not imply equal production readiness.

## Export follow-up — October 26, 2026

The earlier timing failure above is superseded for the two bounded fixtures in the [export repair record](export-check.md). Sequential frame encoding now passes 4K and FHD video timing. Tracking accuracy and occlusion recovery remain separate open tests.
