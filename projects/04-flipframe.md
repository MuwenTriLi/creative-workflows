# FLIPFRAME / Spatial Media Sequencer

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**05 / Browser tool · Sequencing & spatial presentation**

Arrange images and clips along a controlled spatial sequence, from a fast overview to a slower, readable card-by-card presentation.

**[Open web app ↗](https://flipframe-motion-lab.limuwen9.chatgpt.site)** · No sign-in required

*The hosted interface is titled **SPECTRA**. This is the same project, retained under FLIPFRAME in this portfolio.*

![FLIPFRAME / SPECTRA media archive, spatial preview and motion controls](../media/flipframe-editor.png)
*Current interactive editor; the final showcase recording is still being prepared.*

## The smallest useful task

**Task:** present a short media sequence with one key card that needs a longer readable hold. Keep the editorial order fixed, change that hold, and inspect the complete transition and output.

**Local correction:** use the card's framing and hold controls instead of rebuilding or reshuffling the archive. These controls are visible in the editor; an end-to-end exported correction remains to be demonstrated. Protected-card locks and revision rollback are proposed, not implemented guarantees.

**Decision now:** iterate one readable sequence and verify export before adding motion modes. Ask viewers what they could identify at the intended playback speed. Expand a preset only if it preserves order, framing and readability; stop a timing rule that sacrifices the content to fit a duration.

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

1. Open the app; use **EN** if the interface starts in Chinese.
2. Select an existing card in **Visual Archive**, then use **Next card** to inspect the sequence.
3. Compare **Wave rail** and **Step showcase**. Adjust the per-card hold or rail deceleration.
4. Use **Preview full animation** and scrub the timeline. Notice the relationship between the fast opening and the slower presentation.

## Design contribution and reusable workflow

The design focus is turning a motion treatment into an editable system: content order, readable dwell time and spatial movement are separate decisions. The sequence can be reused with a new media collection while retaining a consistent visual rhythm. This is a browser tool; the current portfolio does not include an installable agent Skill or a separate source release.

## Automation, creator control and delivery

**Hypothesis:** separating fast scanning from readable holds makes spatial motion reusable without sacrificing the content. This remains a hypothesis to test with creators and viewers.

**Current behavior:** the selected sequence and parameters drive card motion. The creator determines order, showcase range, hold duration and source framing. AI-assisted development does not imply an autonomous editor in the published tool.

**Proposed agent behavior:** suggest a timing draft from a selected sequence and intended duration. Keep the editorial order and IN/OUT range fixed unless the creator reviews a change. Show any crop and dwell-time change on the affected card. Version comparison, semantic locks and automatic readability checks are proposed, not implemented claims.

**Acceptance:** the intended cards appear in the right order; subjects remain framed; each key card can be read at playback speed; transitions do not jump or obscure the content; the encoded output matches the reviewed timing. Export reliability is still to verify here.

**Next test / decision:** record the same sequence with two dwell settings, ask viewers which content they can identify, and document the creator's correction steps. Expand the timing preset if readability and editability both hold; iterate on rushed cards or disorienting transitions; stop an automatic timing rule if it sacrifices the story to fit duration. [Control model and handoff](../docs/creative-control.md).

## Evidence and current limits

The public editor, existing media archive and parameter interface are available to inspect. The app exposes an export panel, but its full export workflow and 4K output have not been independently rechecked for this case. No production reliability or measured efficiency claim is made.

## Case evidence to add

A short finished sequence and an A/B recording with identical media: change only the showcase order or hold time, then explain how that improves readability. Add the specific design iteration and Muwen's implementation contribution alongside that evidence.
