# 05 / FLIPFRAME

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**05 / Browser tool · Sequencing & spatial presentation**

Arrange images and clips along a controlled spatial sequence, from a fast overview to a slower, readable card-by-card presentation.

**[Open web app ↗](https://flipframe-motion-lab.limuwen9.chatgpt.site)** · No sign-in required

The studio uses the same typography, dark workspace and input–preview–inspector logic as Model Breakdown. It opens in English, with a Chinese interface option.

![FLIPFRAME media archive, spatial preview and motion controls](../media/flipframe-editor.png)
*Fifteen supplied images and moving clips replace the earlier architectural sample. Import your own media, keep the sequence order, and revise one local framing or timing choice.*

[Watch the actual 25 s sequence](https://muwentrili.github.io/creative-workflows/collage-motion/process/#flipframe).

## The smallest useful task

**Task:** present a short media sequence with one key card that needs a longer readable hold. Keep the editorial order fixed, change that hold, and inspect the complete transition and output.

**Local correction:** use the card's framing and hold controls instead of rebuilding or reshuffling the archive. These controls are visible in the editor. The revised direct export passed a 7.45 s two-card check and a complete 25 s sample sequence. Protected-card locks and revision rollback are proposed, not implemented guarantees.

**Decision now:** test whether viewers can read the verified sequence before adding more motion modes. Ask viewers what they could identify at the intended playback speed. Expand a preset only if it preserves order, framing and readability; stop a timing rule that sacrifices the content to fit a duration.

## The problem

A sequence needs both impact and enough time to read each image. Reordering the source media or changing the pace of a spatial presentation can require adjusting many transitions, holds and camera-like moves. A visually impressive transition is not useful if viewers cannot understand the content it reveals.

## The approach

Use one ordered **Visual Archive** as the sequence source, with a spatial preview and visible timing controls. Separate the fast introductory scan from the slower showcase range. Keep cards readable while the sequence moves through space, and make the transition between speed and pause adjustable.

| Creative decision | Visible control | Purpose |
| --- | --- | --- |
| Which stories appear, and in what order? | Drag-to-reorder archive; IN/OUT showcase range | Connect content order to presentation order |
| How does the sequence move? | Wave rail, step showcase and rapid lock modes | Compare different presentation rhythms |
| When does the motion settle? | Peak speed, deceleration duration and curve strength | Shape the transition from overview to detail |
| How long can viewers inspect an image? | Per-card transition and hold duration | Give each item readable screen time |
| How should each source fit? | Clip trim, size and position; 16:9 / 9:16 canvas | Adapt mixed media to the presentation |

## Try the interaction

1. Open the English-default app and inspect the supplied visual sequence; use the language switch for Chinese.
2. Select an existing card in **Visual Archive**, then use **Next card** to inspect the sequence.
3. Compare **Wave rail** and **Step showcase**. Adjust the per-card hold or rail deceleration.
4. Use **Preview full animation** and scrub the timeline. Notice the relationship between the fast opening and the slower presentation.

## Design contribution and reusable workflow

The design focus is turning a motion treatment into an editable system: content order, readable dwell time and spatial movement are separate decisions. The sequence can be reused with a new media collection while retaining a consistent visual rhythm. This is a browser tool; the current portfolio does not include an installable agent Skill or a separate source release.

## Automation, creator control and delivery

**Hypothesis:** separating fast scanning from readable holds makes spatial motion reusable without sacrificing the content. This remains a hypothesis to test with creators and viewers.

**Current behavior:** the selected sequence and parameters drive card motion. The creator determines order, showcase range, hold duration and source framing. AI-assisted development does not imply an autonomous editor in the published tool.

**Proposed agent behavior:** suggest a timing draft from a selected sequence and intended duration. Keep the editorial order and IN/OUT range fixed unless the creator reviews a change. Show any crop and dwell-time change on the affected card. Version comparison, semantic locks and automatic readability checks are proposed, not implemented claims.

**Acceptance:** the intended cards appear in the right order; subjects remain framed; each key card can be read at playback speed; transitions do not jump or obscure the content; the encoded output matches the reviewed timing. The revised direct export passes the bounded timing checks below; compatibility export on other devices remains unverified.

**Next test / decision:** record the same sequence with two dwell settings, ask viewers which content they can identify, and document the creator's correction steps. Expand the timing preset if readability and editability both hold; iterate on rushed cards or disorienting transitions; stop an automatic timing rule if it sacrifices the story to fit duration. [Control model and handoff](../docs/creative-control.md).

## Evidence and current limits

The revised encoder selects a supported WebCodecs configuration rather than falling unnecessarily into the real-time compatibility path. Two locally exercised H.264 outputs match their displayed durations: **7.45 s / 447 frames** and the full **25.00 s / 1,500 frames**, both **3840 × 2160 at 60 fps**. Sampled frames across the complete sequence show the new content and white HUD. The 25 s result is linked above as a lighter viewing copy.

The earlier compatibility-path failure remains recorded in the [functional review](../docs/functional-review.md#flipframe-do-not-equate-encoding-completion-with-delivery). This fix does not certify compatibility capture on other devices, 6K/8K output, long projects or perceptual readability. Long 4K encoding can make the browser unresponsive; its completion is separate from a smooth editing experience.

## Case evidence to add

[Specific input package and recording outline](../docs/evidence-to-add.md).

A short finished sequence and an A/B recording with identical media: change only the showcase order or hold time, then explain how that improves readability. Add the specific design iteration and Muwen's implementation contribution alongside that evidence.

## Example-first workflow

The opening example, visible Import action, shared studio navigation and English default are implemented. The creator can replace the supplied content or adjust one local choice. No automated story judgment, protected-card locking or revision rollback is claimed. Media rights remain separate from the application.
