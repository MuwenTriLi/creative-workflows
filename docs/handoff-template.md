# Prototype handoff template

[← Control and delivery model](creative-control.md)

Use this for one bounded workflow. Unfilled fields are work still to do, not evidence of a completed handoff.

| Field | Required information |
| --- | --- |
| Production task | Who is doing what, for which audience and output? |
| Current bottleneck | A concrete example, current steps and source of evidence: practitioner account, recording or observed session |
| Hypothesis | Which intervention should improve the task, and what would disprove it? |
| Scope | Inputs supported, duration/resolution bounds, output destination and excluded cases |
| Creator decisions | Intent, protected choices, editable parameters and decisions that cannot be inferred safely |
| Automatic steps | Trigger, permitted tool calls, inputs/outputs and expected result for each step |
| Confirmation | Exact material changes that need review; show affected inputs, change preview and cost if relevant |
| State and recovery | Draft/preview/review/accepted/delivered transitions; cancellation, retry, undo and retention behavior |
| Implementation | Source revision, dependencies, hosted/local distinction and responsible modules |
| Acceptance | Technical checks, creative review, input fixture, reference output and failure examples |
| Validation evidence | Task completion, observed corrections, failures and baseline; attach recording and notes |
| Decision | Expand / iterate / stop, supported by evidence and remaining uncertainties |

## Tool-step contract to implement

```text
Input: task_id, source_revision, selected_asset_ids, parameters, preserved_constraints
Output: working_revision, preview_path, changed_parameters, check_results, warnings
Failure: stage, affected_item_or_frame, reason, recoverable, suggested_next_action
```

Every automatic step should have a checkable postcondition. A repeated request should reuse or identify the same working revision instead of silently duplicating a destructive edit. Store secrets outside the handoff record. No autonomous tool runner is supplied by this template.

## Example boundary: Clockwork timing adaptation

Input is a creator-selected licensed assembly and a timing goal. Inspect the controller and dependencies, propose a change to confirmed inputs, and apply it to a working copy. If achieving the goal requires changing a driven output, removing a constraint or redesigning the mechanism, return a review request instead of expanding the task silently. Deliver the copy, before/after values and checks for the actual preview. This example has not been executed as a new Skill run.

## Evidence required before calling the handoff validated

Attach the completed [creator validation record](creator-validation.md), an authorized input fixture, the exact output and source revision, one failed case, and the implemented-versus-proposed control list. Include the smallest local correction and what it must preserve. A documented hypothesis or a successful build alone is not a validated feature.
