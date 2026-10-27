# Clockwork — extended visual tour

[← Project overview](../README.md)

### My original models → AI-assisted mechanisms → creator controls

I modeled the original source collection myself, then organized those models and design references as inputs for Codex-assisted development. I directed the visual language and reviewed the mechanisms while AI helped inspect the files, develop related structures and implement gear linkages. The result is a reusable Blender motion system, delivered as a 46-asset library.

**[How I built it](process.md)** · [Production problem and product decisions](production-case.md) · [Controller reference](controls.md) · [Workflow Skill](workflow-skill.md)

| Stage | My contribution | AI / implementation contribution |
| --- | --- | --- |
| Prepare the inputs | Model the original geometry; organize source files and references; define the desired forms and motion | Inspect the supplied structures and work within the brief |
| Develop mechanisms | Direct the gear, frame and linkage relationships; review the proposed results | Assist development of linked motion with Blender drivers, hierarchies and constraints |
| Expose useful controls | Decide which changes a creator should make, such as speed and phase | Connect those inputs to the dependent moving components |
| Deliver reusable work | Select and organize assemblies, previews, documentation and visual evidence | Assist implementation and packaging; a later instruction Skill records the adaptation method |

The input was my existing modeled work and design specification. This documents AI-assisted development, not a model-training result. The later Skill has not yet been exercised end to end on a new Blender task.

## A control system behind each assembly

Built-in settings drive motion through native Blender drivers, object hierarchies and constraints. Adjust the root controller; the connected parts follow their existing relationships.

**Controller inputs -> linked motion -> moving components**

| What you want to change | Example controls | What they affect |
| --- | --- | --- |
| Chain movement | SPM03 / `Chain_Drive_Speed` | Chain speed, alongside the assembly's overall speed and phase settings. |
| Gear rotation | CLK08 / `Gear_Display_Speed` | Visible mechanism speed; clock-hand timing has separate controls. |
| Opening and folding rhythm | CLK32 / `Master_RPM`, `Speed_Scale`, `Phase_Deg` | The input speed and phase driving the unfolding mechanism. |
| Travel along an existing path | CLK31 / `Master_RPM`, `Speed_Scale` | The pace of the connected rail mechanism. |
| Clock behavior | CLK08 / `Start_Hour`, `Start_Minute`, `Start_Second`, `Second_Tick_Blend` | Initial time and smooth or stepped seconds. |
| Gear detail on supported assets | CLK31 / CLK32 / `Teeth_Multiplier` | Linked tooth density at 1 / 2 / 3, with pitch radii and transmission ratios retained. |

Controls vary by asset. Opening angles and positions may be calculated outputs, so adjustments belong upstream in the controller. [Explore the controls](controls.md).

## Finished collection

[![Clockwork collection - original 4K render](../media/collection-hero-4k.jpg)](../media/collection-hero-4k.jpg)

[Open the full-resolution 3840 x 2160 render](../media/collection-hero-4k.jpg)

[Workflow + Skill](workflow-skill.md) / [Read SKILL.md](../skills/clockwork-assembly/SKILL.md) / [Download camera tour (MP4)](https://raw.githubusercontent.com/MuwenTriLi/creative-workflows/main/projects/01-clockwork/media/collection-tour.mp4) / [Render gallery](render-gallery.md) / [Motion library](motion-library.md) / [Product on Superhive](https://superhivemarket.com/products/steampunk-clockwork-animated-assets)

Steampunk Clockwork turns a design language of exposed gears, layered mechanisms and architectural frames into an adaptable Blender asset library. Use a complete assembly as a focal point, tune its motion to a shot, or develop a new composition from its editable components.

The finished forms below are evidence of that development process. To assess the system behind them, start with the editable controls and the dependency-preserving adaptation method.

## The reusable workflow behind the assets

The project combines **designed components**, **linked motion logic** and **an agent-guided adaptation workflow**. Its gears, frames, chains and architectural modules can be reused as complete assemblies or developed into a new composition, with the required motion dependencies retained or rebuilt.

| Reusable capability | What it enables |
| --- | --- |
| Design rules | Develop related mechanical structures from an original model collection and a consistent visual brief. |
| Motion logic | Connect controller inputs to gear rotation, chain movement, guided travel and unfolding. |
| Parameter controls | Tune speed, phase and clock behavior without editing every moving component. |
| Modular assembly | Reuse a complete mechanism or adapt selected parts, subassemblies and procedural materials. |
| Product delivery | Browse, place and adjust an organized Asset Browser library with previews and instructions. |

The [`clockwork-assembly` Skill](../skills/clockwork-assembly/SKILL.md) packages the inspection, adaptation and checking procedure as reusable agent instructions. It was distilled for this showcase from the existing project workflow; a bounded [CLK32 timing edit](control-study.md) has been executed and checked. Broader recomposition remains to be verified. [Explore the workflow, inputs and outputs](workflow-skill.md).

## Structure → material

The same collection presented with two visual priorities: **linework exposes construction; rendered surfaces show the finished design language**.

<p align="center"><a href="../media/structure-material-comparison.jpg"><img src="../media/structure-material-comparison.jpg" width="100%" alt="Original linework pass on the left and material render pass on the right"></a></p>

[Open the paired comparison](../media/structure-material-comparison.jpg) · [Full-resolution linework](../media/structure-pass.jpg) · [Full-resolution render](../media/material-pass.jpg)

Frames from the two original collection videos. Their motion phases differ; this is a presentation comparison, not a controlled user study.

## The collection in motion

<p align="center"><a href="../media/collection-motion.gif"><img src="../media/collection-motion.gif" alt="Rendered clock collection in motion" width="800"></a></p>

## Mechanisms in focus

Two larger studies expose the movement behind the overall silhouette. Click a preview to inspect its five-second excerpt.

<table><tr>
<td width="50%" align="center" valign="top"><a href="../media/differential-motion.gif"><img src="../media/differential-motion.gif" width="420" alt="SPM14 suspended mechanism in motion"></a><br><b>SPM14 / suspended mechanism</b><br><sub>Read the suspended parts, linkages and counterweight together.</sub></td>
<td width="50%" align="center" valign="top"><a href="../media/orbit-motion.gif"><img src="../media/orbit-motion.gif" width="420" alt="CLK31 guided mechanical movement"></a><br><b>CLK31 / guided movement</b><br><sub>Read the relationship between the dial, structure and rail path.</sub></td>
</tr></table>

[More videos and Blender recordings →](showcase-films.md) · [All 24 motion studies →](motion-library.md#24-clock-motion-studies)

## Motion is part of the design

Two ways to read a mechanism: rotate the whole form to understand its construction, then hold the view still to inspect how its parts move.

### 01 / Rotating views

<table>
<tr>
<td width="25%" align="center"><a href="../media/motion-clk02.gif"><img src="../media/motion-clk02.gif" alt="Clock 01 - CLK02 - Turntable" width="100%"></a><br><b>Clock 01</b><br><sub>Turntable / Layered dial</sub></td>
<td width="25%" align="center"><a href="../media/motion-clk04.gif"><img src="../media/motion-clk04.gif" alt="Clock 03 - CLK04 - Turntable" width="100%"></a><br><b>Clock 03</b><br><sub>Turntable / Stacked gears</sub></td>
<td width="25%" align="center"><a href="../media/motion-clk08.gif"><img src="../media/motion-clk08.gif" alt="Clock 07 - CLK08 - Turntable" width="100%"></a><br><b>Clock 07</b><br><sub>Turntable / Exposed movement</sub></td>
<td width="25%" align="center"><a href="../media/motion-clk10.gif"><img src="../media/motion-clk10.gif" alt="Clock 08 - CLK10 - Turntable" width="100%"></a><br><b>Clock 08</b><br><sub>Turntable / Skeleton frame</sub></td>
</tr>
</table>

The silhouette stays readable as gears, shafts and supporting frames come into view.

<br>

### 02 / Fixed views · moving mechanisms

<table>
<tr>
<td width="25%" align="center"><a href="../media/motion-clk11.gif"><img src="../media/motion-clk11.gif" alt="Clock 10 - CLK11 - Motion" width="100%"></a><br><b>Clock 10</b><br><sub>Motion / Framed gear train</sub></td>
<td width="25%" align="center"><a href="../media/motion-clk18.gif"><img src="../media/motion-clk18.gif" alt="Clock 15 - CLK18 - Motion" width="100%"></a><br><b>Clock 15</b><br><sub>Motion / Vertical linkages</sub></td>
<td width="25%" align="center"><a href="../media/motion-clk31.gif"><img src="../media/motion-clk31.gif" alt="Clock 23 - CLK31 - Motion" width="100%"></a><br><b>Clock 23</b><br><sub>Motion / Rail-guided motion</sub></td>
<td width="25%" align="center"><a href="../media/motion-clk32.gif"><img src="../media/motion-clk32.gif" alt="Clock 24 - CLK32 - Motion" width="100%"></a><br><b>Clock 24</b><br><sub>Motion / Unfolding canopy</sub></td>
</tr>
</table>

A steady view makes the relationships between rotation, travel and opening easier to judge.

[Explore all 24 motion studies →](motion-library.md#24-clock-motion-studies) · [Original asset IDs](clock-index.md)

Clock numbers indicate the presentation order. GIFs repeat short excerpts at the original playback speed; they are not guaranteed seamless cycles.

## Selected forms

<table>
<tr>
<td width="25%" align="center"><a href="../media/clk18.png"><img src="../media/clk18.png" alt="CLK18 original render" width="100%"></a><br><b>CLK18</b></td>
<td width="25%" align="center"><a href="../media/orbit.png"><img src="../media/orbit.png" alt="CLK31 original render" width="100%"></a><br><b>CLK31</b></td>
<td width="25%" align="center"><a href="../media/aperture.png"><img src="../media/aperture.png" alt="CLK32 original render" width="100%"></a><br><b>CLK32</b></td>
<td width="25%" align="center"><a href="../media/differential-instrument.png"><img src="../media/differential-instrument.png" alt="SPM14 original render" width="100%"></a><br><b>SPM14</b></td>
</tr>
</table>

<details>
<summary>Eight more rendered forms</summary>

<table>
<tr>
<td width="25%" align="center"><a href="../media/clk02.png"><img src="../media/clk02.png" alt="CLK02 original render" width="100%"></a><br><b>CLK02</b></td>
<td width="25%" align="center"><a href="../media/clk03.png"><img src="../media/clk03.png" alt="CLK03 original render" width="100%"></a><br><b>CLK03</b></td>
<td width="25%" align="center"><a href="../media/clk04.png"><img src="../media/clk04.png" alt="CLK04 original render" width="100%"></a><br><b>CLK04</b></td>
<td width="25%" align="center"><a href="../media/clk06.png"><img src="../media/clk06.png" alt="CLK06 original render" width="100%"></a><br><b>CLK06</b></td>
</tr>
<tr>
<td width="25%" align="center"><a href="../media/clock-08.png"><img src="../media/clock-08.png" alt="CLK08 original render" width="100%"></a><br><b>CLK08</b></td>
<td width="25%" align="center"><a href="../media/clk10.png"><img src="../media/clk10.png" alt="CLK10 original render" width="100%"></a><br><b>CLK10</b></td>
<td width="25%" align="center"><a href="../media/clk11.png"><img src="../media/clk11.png" alt="CLK11 original render" width="100%"></a><br><b>CLK11</b></td>
<td width="25%" align="center"><a href="../media/clk12.png"><img src="../media/clk12.png" alt="CLK12 original render" width="100%"></a><br><b>CLK12</b></td>
</tr>
</table>

</details>

Click any render to inspect it. [Browse all clocks and selected mechanisms →](render-gallery.md)

## Inside Blender: from library to moving assembly

<table>
<tr><th width="50%">Inspect the opening mechanism</th><th width="50%">Browse and place an asset</th></tr>
<tr><td><a href="https://muwentrili.github.io/creative-workflows/films/?project=clockwork&amp;film=opening-in-blender"><img src="../media/opening-in-blender.gif" width="100%" alt="Original Blender recording of the opening assembly"></a></td><td><a href="https://muwentrili.github.io/creative-workflows/films/?project=clockwork&amp;film=library-placement"><img src="../media/library-placement.gif" width="100%" alt="Original Blender asset library placement recording"></a></td></tr>
</table>

[Opening mechanism · MP4](https://muwentrili.github.io/creative-workflows/films/?project=clockwork&film=opening-in-blender) · [Asset placement · MP4](https://muwentrili.github.io/creative-workflows/films/?project=clockwork&film=library-placement) · [Seven videos and recordings](showcase-films.md)

These original viewport recordings show the working scene and library. A narrated control-change walkthrough is the next evidence to add; these excerpts do not by themselves demonstrate every parameter.

## Components for a new design

The library works at three levels: **complete animated assemblies**, **editable parts and subassemblies**, and **reusable procedural materials**. A clock can anchor a scene; its gears, frames and decorative structures can also inform a new design or visual direction.

<table>
<tr>
<td width="25%" align="center"><a href="../media/clk04.png"><img src="../media/clk04.png" alt="CLK04 original render" width="100%"></a><br><b>Gear layers</b></td>
<td width="25%" align="center"><a href="../media/clk06.png"><img src="../media/clk06.png" alt="CLK06 original render" width="100%"></a><br><b>Linkages</b></td>
<td width="25%" align="center"><a href="../media/clk12.png"><img src="../media/clk12.png" alt="CLK12 original render" width="100%"></a><br><b>Clock-face detail</b></td>
<td width="25%" align="center"><a href="../media/chain-drive.png"><img src="../media/chain-drive.png" alt="SPM03 original render" width="100%"></a><br><b>Chain drive</b></td>
</tr>
</table>

For a working animated module, retain its controller, hierarchy and driver dependencies. For a new visual composition, duplicate the asset, make its collection instance real and adapt selected geometry or materials. A separated component may need its motion relationships rebuilt. [Component reuse workflow](component-reuse.md).

## From design rules to a usable product

| Stage | Design responsibility | Result |
| --- | --- | --- |
| Establish the language | Original models, design direction and evaluation standards | A consistent starting point for new structures. |
| Develop the mechanism | Review variations and how their parts move together | Detailed forms with legible motion. |
| Expose the controls | Organize adjustment points for each assembly | Reusable assets with documented parameters. |
| Package the collection | Categories, previews, materials and instructions | A library another Blender user can browse, place and adapt. |

[Design and development process](process.md) / [Creative workflows portfolio](https://github.com/MuwenTriLi/creative-workflows)

## Browse / place / adjust / animate

Register the product's `Asset Library` folder in Blender, choose a complete asset collection, place it in your scene, then select its root controller to adjust the available parameters.

<details>
<summary><b>See the library inside Blender</b></summary>

![Blender Asset Browser](../media/asset-browser.png)

[![Blender library tour preview](../media/blender-library-tour-poster.jpg)](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/raw/refs/heads/main/media/blender-library-tour.mp4)

[Download the 15-second library tour](https://raw.githubusercontent.com/MuwenTriLi/creative-workflows/main/projects/01-clockwork/media/blender-library-tour.mp4) / [Collection animation in the viewport](https://raw.githubusercontent.com/MuwenTriLi/creative-workflows/main/projects/01-clockwork/media/viewport-collection.mp4)

</details>

| Included | Delivery |
| --- | --- |
| Animated assets | 32 clocks and 14 mechanical assemblies |
| Asset Browser | Categorized library with 46 custom previews |
| Materials | 9 marked reusable procedural material assets |
| Presentation | 5 supplied showcase scenes |
| Documentation | Setup, controller reference and recorded release checks |
| Format | Editable native Blender files; no add-on required to use the model library |

Get the asset package on [Superhive](https://superhivemarket.com/products/steampunk-clockwork-animated-assets). This repository presents the project and selected media.

<details>
<summary><b>Compatibility and presentation notes</b></summary>

The package records testing in Blender 5.2.0 LTS on Windows with Cycles. These are detailed visualization assets; viewport performance depends on the scene. Run/reset behavior and cycles vary between assets. The existing release audit was not rerun for this showcase.

All visuals come from the supplied renders and recordings. GIFs are excerpts rather than guaranteed seamless cycles. See [verification scope](validation.md) and [media provenance](media.md).

The Blender library files are distributed through the product page. This showcase does not grant an open-source license to those assets.

</details>

## Repository map

```text
steampunk-clockwork-showcase/
├── README.md                      Build overview, control system and visual evidence
├── docs/
│   ├── process.md                 Original models → AI-assisted development
│   ├── production-case.md         Problem, decisions, evidence and next test
│   ├── controls.md                Documented inputs and linked motion
│   ├── component-reuse.md         Dependencies to preserve during adaptation
│   ├── workflow-skill.md          Scope of the reusable instruction Skill
│   └── validation.md              Historical checks and their limits
├── skills/clockwork-assembly/     Inspectable adaptation instructions
└── media/                        Renders, motion excerpts and Blender recordings
```

The public repository documents the workflow and selected evidence. The Blender source library is supplied through [Superhive](https://superhivemarket.com/products/steampunk-clockwork-animated-assets).
