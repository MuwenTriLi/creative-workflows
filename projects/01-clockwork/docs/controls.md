# Controls and linked motion

[Case study](../README.md) / [Component reuse](component-reuse.md) / [Motion examples](motion-library.md)

The library connects editable inputs to moving geometry through native Blender drivers, hierarchies and constraints. Each root `*_ASSET_CTRL` groups the controls intended for that asset. The examples below are based on the supplied controller reference, not a new interactive test.

## Chain speed / SPM03

![SPM03 chain assembly](../media/chain-drive.png)

`Chain_Drive_Speed` is the chain-speed multiplier (recorded default 1.0). `Speed_Scale` controls the broader mechanism and `Time_Offset_Frames` offsets its phase. `Added_Mechanism_Speed` addresses the additional display mechanisms. This separates the pace of a visible chain from the other available movement controls.

## Clock and gear timing / CLK08

![CLK08 rotation study](../media/clock-08-motion.gif)

| Input | Recorded default | Use |
| --- | --- | --- |
| `Start_Hour` / `Start_Minute` / `Start_Second` | 9 / 15 / 30 | Set the initial clock pose. |
| `Time_Scale` | 1.0 | Adjust clock playback speed. |
| `Second_Tick_Blend` | 0.0 | 0 gives a smooth sweep; 1 gives one-second stepping. |
| `Gear_Display_Speed` | 1.0 | Adjust the visible mechanism's speed. |
| `Time_Offset_Frames` | 0.0 | Offset procedural phase in frames. |
| `Addon_Movement_Speed` | 1.0 | Adjust the additional tourbillon movement. |

`Addon_Movement_Speed` is an existing property label; using the model library does not require installing an add-on.

## Travel rhythm / CLK31 Orbit

![CLK31 guided travel study](../media/orbit-motion.gif)

The captive-rail assembly exposes `Master_RPM` (default 3.0), `Speed_Scale`, `Time_Scale` and `Phase_Deg`. These settings adjust the input and timing of the connected mechanism. The existing track defines the motion path: the speed controls do not imply a universal path-drawing interface.

## Opening and folding / CLK32 Aperture

![CLK32 unfolding study](../media/aperture-motion.gif)

`Master_RPM` (default 3.2), `Speed_Scale` and `Phase_Deg` set the pace and phase of the unfolding assembly. `Input_Angle` is a driven output. Adjust the upstream inputs instead of replacing that computed angle.

## Detail and timing are different controls

On CLK31 and CLK32, `Teeth_Multiplier` offers linked 1 / 2 / 3 tooth-density settings. The reference states that pitch radii and transmission ratios remain fixed. This changes geometric detail without treating tooth density as the speed control.

## Placement and playback

Register only the product's `Asset Library` folder. Append or instance the complete collection, preserving its hierarchy, constraints and driver targets. Move, rotate and uniformly scale the complete instance; avoid applying transforms to individually animated children.

The documented playback range is frames 1-1441 at 24 fps. Run switches use enable/reset semantics, rather than a universal pause-at-current-position operation. Controls and cycles vary by asset. The rigs are visualization systems; arbitrary parameter combinations have not been certified collision-free.
