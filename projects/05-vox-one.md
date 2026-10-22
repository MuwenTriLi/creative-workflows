# VOX / ONE / Speech to Motion Type

[← All projects](https://github.com/MuwenTriLi/creative-workflows#selected-work)

**06 / Browser tool · Speech timing & kinetic typography**

Turn spoken English into editable, timed typography, with control over phrasing, visual emphasis and synchronization.

**[Open web app ↗](https://vox-one.limuwen9.chatgpt.site)** · No sign-in required

![VOX ONE source, transcript, live composition and typography controls](../media/vox-one-editor.png)
*Current editor before audio import. A paired audio-and-type example is pending.*

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

## Evidence and current limits

The public interface is accessible and its controls are documented here. It identifies the speech engine as **local Whisper Base with word timestamps**; that is the implementation described by the interface, not a new transcription benchmark. This portfolio update did not run speech recognition or verify the advertised 4K MP4/AAC and alpha WebM exports. The current interface is focused on English speech, not visual OCR.

## Case evidence to add

A short authorized voice sample, the corrected transcript, and two typography treatments using the same audio. Include one real correction and its effect on the final sequence, with Muwen's specific role and implementation details.
