# Clockwork: from production practice to a reusable product

[← Collection and motion gallery](../README.md) · [Controls](controls.md) · [Workflow Skill](workflow-skill.md) · [Superhive product](https://superhivemarket.com/products/steampunk-clockwork-animated-assets)

**I modeled the source collection, organized it for AI-assisted development, and turned it into linked mechanisms, editable controls and a reusable Blender library.**

I supplied models I had made myself, organized the source work and references, set the visual and motion requirements, and reviewed the resulting mechanisms. Codex assisted source inspection and the development of structures and gear linkages within that direction. The 46-asset product is the delivered outcome; the design of the inputs, dependencies and creator controls is the process to examine. [Read the build process](process.md).

## The smallest useful task

**Task:** adapt one CLK32 assembly to a short shot with a slower, clearly readable opening, while preserving its design and linked motion. Keep the source intact and work on a copy. This is the next demonstration to record, not a new result claimed by the existing GIF.

**Local correction:** record the original controller values, change the relevant upstream speed or phase control, and preview the affected opening. Keep camera, materials and unrelated assemblies fixed. Restore those values if the result fails; a dependency-changing recomposition is a separate decision, not an automatic repair.

**Decision now:** the asset product exists; iterate the adaptation workflow. A useful proof is one before/after settings record, one correction and the decoded output of that exact revision. Expand the Skill only after an unfamiliar creator can understand and correct the result. Stop or narrow a proposed edit if preserving the mechanism requires rebuilding hidden dependencies.

## 1. The production problem

A detailed mechanism is only part of a usable asset. A creator also needs to place it in a new composition, change the rhythm, preserve the connected motion, and find the relevant controls. Editing individual moving parts makes those relationships harder to maintain. Developing related forms also requires a consistent visual language across silhouettes, gear layers, frames and detail density.

This problem framing comes from my production practice and the documented artifact structure. It is not presented as a completed customer-interview study or a measured time-saving result.

## 2. The product hypothesis

If visual rules, motion dependencies and meaningful controller inputs travel with each assembly, a creator should be able to adapt its presentation without rebuilding every moving part. The resulting product needs both detailed craft and a clear browse → place → adjust → animate workflow.

The shipped library and documented controls support this direction. Independent task-completion testing of the workflow is still to do.

## 3. Production decisions became product controls

| Production requirement | Product decision | Evidence to inspect |
| --- | --- | --- |
| Related forms should feel like one collection | Develop variations from my model collection and design standards | [Design process](process.md) and [render gallery](render-gallery.md) |
| A scene needs a different rhythm | Expose upstream speed and phase controls; preserve linked motion | [CLK08 gear timing](controls.md#clock-and-gear-timing--clk08), [CLK31 travel](controls.md#travel-rhythm--clk31-orbit) |
| Opening should remain mechanically connected | Drive the opening from the input rather than directly overriding the result | [CLK32 controls](controls.md#opening-and-folding--clk32-aperture) |
| A creator wants to reuse only part of a design | Distinguish complete assemblies, animated subassemblies and geometry reuse | [Component reuse](component-reuse.md) |
| Someone else must find and use the assets | Package categories, previews, materials and instructions | [Asset Browser and delivery](visual-tour.md#browse--place--adjust--animate) |

<table><tr>
<td width="50%"><img src="../media/motion-clk08.gif" alt="Existing CLK08 motion study" width="100%"><br><b>Gear and clock timing are separate decisions</b></td>
<td width="50%"><img src="../media/motion-clk32.gif" alt="Existing CLK32 opening motion study" width="100%"><br><b>Opening follows a connected mechanism</b></td>
</tr></table>

These are existing motion excerpts. They show the assemblies, not a newly recorded agent adjustment or a before/after experiment.

## 4. One concrete control decision: CLK32

The documented controls expose `Master_RPM`, `Speed_Scale` and `Phase_Deg`. `Input_Angle` is a calculated output. For a different opening rhythm, the useful interaction is to change the upstream input and preview the linked result. Directly editing the calculated angle would hide the dependency the product is supposed to preserve.

This is the product insight: a creator should control the behavior they care about while the system maintains the relationships underneath. The same distinction helps an agent choose a valid edit. It does not mean every combination is collision-free or that the asset is a physically validated machine.

## 5. What runs automatically, and where I retain judgment

| Layer | Current evidence | Creator responsibility |
| --- | --- | --- |
| Development | My organized, self-modeled inputs guided Codex-assisted inspection, mechanism development and linkages | Set the visual standard, review structure and movement, select the result |
| Asset operation | Native drivers, constraints and hierarchies propagate selected controller values | Choose the module, tune rhythm, inspect the whole shot |
| Agent adaptation | A [CLK32 speed study](control-study.md) records an actual inspection, parameter change, compatibility failure and bounded checks | Specify the new composition and review changes that alter silhouette or dependencies |
| Delivery | A Blender library, previews and instructions exist | Approve the particular output and its intended use |

For future agent execution, routine inspection and approved parameter edits can proceed in a working copy. Missing targets, ambiguous controls or a proposed dependency-changing edit should return a specific review item. The creator should see the affected component, before/after settings and a preview. These are workflow requirements, not a new agent UI already shipping with the library.

## 6. Delivery criteria and what has actually been checked

For a newly adapted assembly, I would require a preserved source, a readable dependency map, valid controller targets, inspection across the full intended frame range and risky transitions, and a decoded preview of the exact working revision. The creator checks silhouette, material consistency, movement readability, intersections and discontinuities. A result with unresolved dependencies remains **needs review**.

The package's historical audit records checks of 46 assets and 2,640 drivers over frames 1–1,441. Selected clearance checks are limited to seven pairs and 25 sampled frames. That audit predates some later file modifications, and was not rerun for this portfolio. It cannot validate arbitrary settings or a new adaptation. [Full validation scope](validation.md).

## 7. Outcome, learning and next decision

**Existing outcome:** a Blender collection of 32 clocks and 14 mechanical assemblies, categorized Asset Browser previews, reusable materials, presentation scenes and controller documentation. The public repository presents selected evidence; the source package is supplied separately.

**Design takeaway:** component reuse depends on explicit motion dependencies and meaningful controls. The most useful AI assistance works inside a designer's specification and returns changes that can be inspected.

**New evidence:** the [CLK32 study](control-study.md) records a real speed adjustment, a Blender 5.0 compatibility failure and successful 5.2 checks. Active human work time was not measured. **Next validation:** ask a creator unfamiliar with the library to repeat the task. Expand the agent workflow only when it preserves the mechanism and the creator can explain and correct its changes; otherwise iterate on inspection and recovery. This is the next test, not a completed study.

[Shared control model and engineering handoff](https://github.com/MuwenTriLi/creative-workflows/blob/main/docs/creative-control.md)

## Visual evidence: construction, finish and use

[Compare the original structure and material passes](../media/structure-material-comparison.jpg), then inspect the [opening mechanism](../media/opening-in-blender.mp4) and [library placement](../media/library-placement.mp4) recordings. Together they connect mechanical legibility, surface craft and the working Blender environment. They are visual evidence of the artifact; they do not establish adoption, time saved or a new end-to-end Skill run.
