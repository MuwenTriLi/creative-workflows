# Automation, creator control and delivery

[← Project index](../README.md#selected-work) · [Flagship production case](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/production-case.md)

My design question is: **which parts of a creative job can a system complete reliably, and which decisions need a creator's judgment?** The answer should be visible in the interface and in the delivered work.

## What exists and what is proposed

- **Observed VOX confirmation:** a punctuation-only draft edit waits for Confirm & Apply; the test preserved displayed word timestamps. A broader semantic approval system is not claimed.
- **Observed TRACE feedback:** live confidence and REACQUIRE exist; regional repair/history is still unverified.
- **Implemented Collage gates:** media readiness blocks premature export; editing is locked during rendering and restored afterward. These are local application controls, not a semantic approval system.
- **Existing tools:** parameter-driven Blender assets and interactive browser applications. Their case pages identify observed controls and the scope of actual tests.
- **AI during development:** Muwen modeled and organized Clockwork's original source collection. Codex assisted source inspection, mechanism/linkage development and implementation under his direction. This is distinct from an AI agent operating the finished tool for its user.
- **Company-internal method:** Architecture Growth now shows completed illoca output and a repeatable styling/growth workflow. Its Skill implementation remains private; a fresh public execution is not claimed.
- **Packaged instructions:** the Clockwork Skill describes an adaptation procedure. A fresh end-to-end execution remains unverified.
- **Proposed agent behavior:** the approval points, change records, state model and engineering contracts below are product specifications. They are not already implemented across these applications.

## Decisions across the seven projects

| Case | Repeatable work the system handles or is intended to handle | Creator retains | Acceptance question |
| --- | --- | --- | --- |
| [Clockwork](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/production-case.md) | Existing drivers propagate controller inputs through linked parts | Design language, choice of module, rhythm and any dependency-changing recomposition | Does the changed copy preserve dependencies and produce readable, continuous motion? |
| [Architecture Growth](../projects/blue-white-architecture-growth.md) | Internal workflow: adapt confirmed visual rules and staged growth to a scene; implementation not released | Construction dependencies, cut plane, visual hierarchy and storytelling | Are section geometry, outlines and growth transitions correct across consecutive frames? |
| [Model Breakdown](https://github.com/MuwenTriLi/model-breakdown-studio/blob/main/docs/product-case.md) | Import, part selection and parameter-driven exploded presentation | What the model is explaining, focal part, framing and reveal order | Can the viewer identify the intended component and its relationship to the assembly? |
| [Animated Storyboard](../projects/03-collage-motion.md) | Load the selected sample board; calculate grid layout, cell timing and movement from parameters | Source media, order, crops, pacing and final composition | Are key subjects visible and does the encoded video match the reviewed sequence? |
| [Spatial Media Presenter](../projects/04-flipframe.md) | Calculate card movement and timing from the selected sequence | Editorial order, entry/exit range and readable dwell | Can viewers inspect the intended content without clipping or rushed transitions? |
| [VOX / ONE](../projects/05-vox-one.md) | Interface advertises local speech recognition and word timing; processing is not benchmarked here | Transcript corrections, phrase meaning, emphasis and final synchronization | Does the typography preserve the spoken meaning and remain readable against the audio? |
| [TRACE / 01](../projects/06-trace-01.md) | Interface exposes target following and trajectory smoothing; accuracy remains unbenchmarked | Target identity, follow/static mode, correction and graphic hierarchy | Does the annotation stay on the intended target and communicate without obscuring it? |

## Change one thing without restarting the job

Local correction is a product requirement, not the same as offering a global “regenerate” button. Preserve the source, the accepted choices and a visible scope for the next edit. Each case now states its [bounded task and correction limits](review-guide.md#what-each-project-currently-supports).

| Case | Smallest useful correction | Boundary to preserve |
| --- | --- | --- |
| Clockwork | A documented controller value in a working copy | Unrelated assemblies, visual direction and driver dependencies |
| Architecture Growth | One system or transition, with neighboring-frame review | Reference, scale, camera and construction order; finished outputs supplied, correction recording pending |
| Model Breakdown | Focal part, explode amount or framing | Imported geometry and the explanation; revision rollback remains proposed |
| Animated Storyboard | One selected cell's source or framing, or a chosen timing control | Imported media and accepted editorial choices; session persistence is absent |
| Spatial Media Presenter | One card's framing or hold | Archive order and accepted sequence; revised 7.45 s and 25 s 4K exports pass their stated timing checks; readability remains to be studied |
| VOX / ONE | Wrong word or mistimed span | Spoken meaning and neighboring timing; word-level recovery needs verification |
| TRACE / 01 | Failed target interval | Subject identity and good intervals; regional repair remains unverified |

For a future agent, show the proposed change and its affected scope before applying changes to meaning, identity or structure. Recompute dependent output after a local edit, but avoid changing unrelated creative decisions. Keeping a parameter editable does not establish rollback or non-destructive revision history.

## An agent should proceed within the brief

After a creator chooses inputs, goal and output constraints, routine inspection, parameter application and inexpensive local previews should proceed without a confirmation at every step. The system should show progress and allow interruption. It should keep the chosen composition and constraints stable unless the creator changes them.

Pause for a decision when the next action changes the meaning or scope of the work: replacing a chosen reference, altering a mechanism's dependencies, changing a transcript's wording, substituting a tracked subject, or publishing an output. Show the exact affected item and a before/after preview. A request to approve everything at the start is insufficient to communicate a later material change.

For an agent using paid inference or cloud rendering, show the provider, scope and cost limit before execution; a retry stays inside the approved scope. None of these case studies establishes an operating paid agent service.

## Controls I would give the creator

These are proposed extensions, to validate before implementation:

| Control | What the creator sees | Why it matters |
| --- | --- | --- |
| Brief and constraints | Selected inputs, desired outcome, protected choices, duration and format | Makes the system's understanding inspectable before a long run |
| Plan and preview | Steps, affected items and a small preview of the proposed change | Allows correction before committing to a direction |
| Editable automation | The same parameters and timeline remain accessible after automation | The creator can refine a draft without starting over |
| Revision recovery | Original input, working revision, changed parameters and a reset/revert path | A failed experiment does not destroy an accepted result |
| Visible failure | Failed stage, affected asset or frame, reason and retry options | Prevents a plausible-looking partial result from being called complete |
| Delivery review | Output file, preview, checks performed and unresolved issues | Distinguishes a generated artifact from accepted work |

## What counts as done

Use separate statuses for **draft → preview ready → needs review → accepted → delivered**. A processing error is a visible failed stage with a recovery action. This complete state model is proposed. Collage already has readiness, rendering and completion feedback, but those statuses do not automatically certify creative acceptance.

Technical checks and creative acceptance answer different questions. File existence alone is insufficient. An encoded file should decode, have the requested dimensions and duration, and cover the reviewed timeline. The creator then judges the visual story: framing, hierarchy, rhythm, meaning and reference consistency. The case-specific criteria apply to the actual output and revision, not an old audit or a screenshot.

A delivery record should include the source identifiers, relevant tool/version, changed settings, output path, tested frame range, checks with **pass / fail / not checked**, and known limits. A missing check must remain visible.

## From prototype to an engineering handoff

For each workflow, provide the user task and hypothesis; reproducible input and output examples; parameter and state definitions; automation scope and review points; failure examples; and an acceptance checklist. The [handoff template](handoff-template.md) gives the concrete fields. The code, source provenance and hosted/local distinction must travel with the handoff.

## How I would validate the next iteration

The next validation is a small, exploratory session with three relevant creators using the same brief and source material in their existing workflow and the prototype. This is a proposed study, not completed research or a statistical effectiveness claim.

Record task completion, assistance required, active adjustment time, end-to-end elapsed time, output defects and time spent correcting automation. Ask the creator to identify the intended visual message before reviewing the final result. Keep the comparison task and output quality criteria fixed.

- **Expand the scope** only after all three can finish the core task without critical help, the outputs pass the task's checks, and correction work is recorded.
- **Iterate** if the task is useful but control discovery, error recovery or output quality repeatedly breaks down.
- **Stop that automation approach** if it hides important decisions, creates more correction work than it removes, or cannot meet the output criteria on the intended input class.

Use the [blank validation record](creator-validation.md) for source/version, assistance, local correction, output checks and the resulting decision. No user study, efficiency percentage or engineering adoption is claimed in this portfolio. The existing visual work and current interaction checks are the starting evidence.
