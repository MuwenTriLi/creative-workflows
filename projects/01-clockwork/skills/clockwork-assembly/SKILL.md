---
name: clockwork-assembly
description: Inspect, adapt and verify an existing Steampunk Clockwork Blender assembly using its design rules, native controllers and motion dependencies. Use when reusing this asset library or tuning a selected mechanism for a new composition.
---

# Clockwork assembly workflow

Adapt an existing mechanical module to a new composition while preserving the dependencies that make it move. This package contains instructions; the user supplies the licensed Blender assets and an available Blender connection or local scripting environment.

## Establish the working context

- Locate the user-selected asset library, target asset, intended composition and output location from the current task. Ask only for missing inputs that affect the work; do not invent a source asset or a personal file path.
- Inspect before changing the scene. Keep the source library read-only and create a working copy in the user's output location. Preserve unrelated objects, rigs and materials.
- Record which elements must stay consistent with the reference: silhouette, exposed gear layers, frame proportions, material treatment and the rhythm of visible movement. Treat these as the user's design brief, not universal constraints on every new design.

## Inspect the mechanism

Find the complete asset collection and its root `*_ASSET_CTRL`. Inspect custom properties, parent relationships, drivers, constraints and target objects. Identify which properties are editable inputs and which are driven outputs. A matching property name alone is not proof of the correct controller: confirm its role in the current file.

Keep a compact dependency map: root controller -> driver or constraint -> moving component. Note separate clock-hand timing, decorative gear motion, chain motion, travel and unfolding where present.

## Tune existing controls

Use only controls confirmed in the loaded asset. The following are reference examples, not properties shared by every clock:

| Source asset | Input examples | Preserve |
| --- | --- | --- |
| SPM03 | `Chain_Drive_Speed`, `Speed_Scale`, `Time_Offset_Frames` | Chain and linked mechanism dependencies. |
| CLK08 | `Gear_Display_Speed`, `Time_Scale`, `Start_Hour`, `Start_Minute`, `Start_Second`, `Second_Tick_Blend` | Separate display-gear speed from clock-hand timing; ticking blend is 0 for smooth and 1 for stepped seconds. |
| CLK31 | `Master_RPM`, `Speed_Scale`, `Time_Scale`, `Phase_Deg` | The existing rail path and its constraint targets. |
| CLK32 | `Master_RPM`, `Speed_Scale`, `Phase_Deg` | Upstream inputs that drive the opening; `Input_Angle` is a calculated output. |
| CLK31 / CLK32 | `Teeth_Multiplier` at 1, 2 or 3 | Pitch radii and transmission ratios; tooth density is a detail setting. |

Read current values and record the changes. Adjust a small, relevant set of inputs, preview the result, then iterate against the requested rhythm. Respect limits and UI ranges actually present in the file. Existing run switches use enable/reset behavior; do not assume a pause-at-current-position function.

## Recompose at the appropriate level

- **Complete animated assembly:** append or instance the complete collection. Place, rotate and uniformly scale the whole instance without applying transforms to individually animated children.
- **Animated subassembly:** duplicate the asset, make the instance real if editable objects are needed, and carry the controller, driver targets, constraints and supporting objects required by the chosen moving parts. Recheck targets after transfer; do not infer independent animation from the visible mesh alone.
- **New visual composition:** reuse selected gears, frames, shafts or procedural materials. If the new arrangement changes motion relationships, rebuild those relationships before presenting it as a working mechanism. Exposed gears are visual components; arbitrary combinations are not automatically a physically valid transmission.

Use the design brief to evaluate the new silhouette and detail density. Show a component inventory and explain which modules are reused and which connections changed.

## Check and hand over

Preview the full intended frame range and any risky transitions after an edit. Check missing driver targets, unexpected resets, discontinuities, intersections and changed motion limits. Render or encode a short preview only when that is within the user's requested work, then inspect the actual output. Report what was checked and what remains unverified.

Deliver the working-copy path, selected asset IDs, before/after controller values, dependency notes, and preview path when one was produced. Keep showcase numbering separate from original `CLK` / `SPM` identifiers. A validation report describes the current run; it must not reuse the historical product audit as proof of a new adaptation.
