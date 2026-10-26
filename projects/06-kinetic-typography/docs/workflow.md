# 06 / Kinetic Typography Studio

[← Project overview](../README.md) · [Implementation](implementation.md)

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**06 / Browser tool · Speech timing & kinetic typography**

Turn spoken English into editable, timed typography, with control over phrasing, visual emphasis and synchronization.

**[Open web app ↗](https://vox-one.limuwen9.chatgpt.site)** · No sign-in required

![Kinetic Typography Studio source, transcript, live composition and typography controls](../../../media/vox-one-editor.png)
*The English-default studio starts with an eight-second silent typography example. Its text and timing are authored demo data, not an automatic transcription. Import a voice clip to exercise the speech workflow; a Chinese interface switch is available.*

## The smallest useful task

**Task:** use a short authorized English clip containing a proper noun, a pause and a phrase boundary. Correct its transcript, create one readable treatment and verify the encoded result against the audio. A clean synthetic English fixture has passed the core path; this harder real-speech task remains pending.

**Local correction:** the interface offers editable text and sync offset. Correct a misspelled word without rewriting the speaker's meaning; use a global offset only for uniform drift. Whether one word can be retimed without disturbing neighboring words must be tested. Region-level reprocessing and retained revisions are proposed requirements.

**Decision now:** validate recognition, correction and synchronized export before adding languages or agent features. Expand only when wording and timing can be corrected reliably. Iterate local timing recovery; stop a phrasing rule that changes meaning. No recognition-accuracy or time-saving result is claimed.

## The problem

Speech-led motion graphics require more than a transcript. Words need readable grouping, accurate timing and a visual rhythm that follows the speaker. A text correction can affect both the layout and timing; treating transcription, typography and animation as disconnected steps makes iteration harder.

## The approach

Connect the source audio, editable transcript, word timeline and composition in one workspace. Let creators switch between single-word emphasis and a two-line phrase layout, then tune motion intensity, type scale, safe area and synchronization without changing tools.

| Creative decision | Visible control | Purpose |
| --- | --- | --- |
| What was actually said? | Editable transcript and punctuation | Keep human correction in the workflow |
| How should viewers read it? | Single word / Build 2 lines | Compare emphasis with phrase readability |
| How should type feel? | Motion calm, font scale, alignment and color | Tune expression without obscuring speech |
| Does it follow the voice? | Timeline and sync offset | Inspect and adjust audio/type alignment |
| How will it be composited? | Black-background MP4 / transparent WebM options | Prepare output for different editing workflows |

## Walkthrough

1. Bring a short English voice clip in a format listed by the app: WAV, MP3, M4A or MP4.
2. Review the transcript and correct words or punctuation before refining the visual treatment.
3. Compare **Single word** with **Build 2 lines**. Adjust alignment, scale and motion calm.
4. Preview against the audio and check phrase boundaries and sync offset.
5. Choose the output style that fits the destination editor; check the resulting file before using it in a production edit.

## Design contribution and reusable workflow

The design focus is the correction loop between speech and presentation: automatic timing is useful only when the creator can revise its wording, phrasing and visual emphasis. The reusable unit is a typography treatment applied to a new voice clip. Video output makes this a creative application; it does not by itself make the project an installable agent Skill.

## Automation, creator control and delivery

**Hypothesis:** connecting transcript correction, phrase layout and timing reduces the cost of revising speech-led motion graphics. This has not yet been established by comparative testing.

**Current behavior:** the interface describes automatic local transcription and word timing, followed by editable text and visual controls. The review ran local Whisper on a 16-word synthetic English clip, confirmed a punctuation-only correction and checked the resulting 4K H.264/AAC file. The creator owns wording, punctuation, phrase meaning, emphasis and final sync.

**Proposed agent behavior:** generate a first transcript and layout, make doubtful spans easy to inspect against the audio, and apply approved style settings. An agent should request review before rewriting meaning, removing words or substituting names. A confidence display, semantic approval and revision history are proposed requirements, not verified current UI.

**Acceptance:** names and wording match the source; grouping preserves meaning; text stays inside the safe area and remains readable; the full encoded output is checked against audio for synchronization. Define the acceptable sync tolerance for the intended use before the test. A plausible transcript or attractive screenshot is insufficient evidence.

**Next test / decision:** use a short authorized clip with a proper noun, a pause and a phrase boundary. Record recognition errors, correction time, sync adjustment and exported playback. Expand only when these are correctable and the output passes; iterate if corrections are awkward; stop an automatic phrasing rule when it changes meaning. [Control model and handoff](../../../docs/creative-control.md).

## Evidence and current limits

The hosted app and read-only source inspection confirm local Whisper Base/WASM on the tested path. The clean 7.55 s synthetic clip produced the expected 16 words. Changing one punctuation mark required **Confirm & Apply** and retained the displayed word times. **Build 2 Lines** exported 4K H.264 / 30 fps / 227 frames plus AAC audio; full decoding passed. Names, noise, perceptual sync tolerance, alpha WebM and a production-editor round trip remain untested. This is not a recognition benchmark. [Functional record](../../../docs/functional-review.md).

## Case evidence to add

[Specific input package and recording outline](../../../docs/evidence-to-add.md).

A short authorized voice sample, the corrected transcript, and two typography treatments using the same audio. Include one real correction and its effect on the final sequence, with Muwen's specific role and implementation details.

## Shared studio, distinct responsibility

The opening example, visible input/output actions, shared navigation, default Arial/Helvetica typography and rectangular dark controls follow Model Breakdown's workspace language. The tool's specific acceptance criteria above remain separate; a common appearance does not imply equal production readiness.
