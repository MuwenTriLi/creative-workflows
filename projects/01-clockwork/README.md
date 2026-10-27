# 01 / Clockwork

[Demo / Superhive](https://superhivemarket.com/products/steampunk-clockwork-animated-assets)

Original modeled components developed into **46 animated Blender assets** with linked mechanisms and editable controls.

Tech stack: Blender geometry, native drivers, hierarchies and constraints; Codex-assisted inspection and implementation.

## From source models to linked motion

I modeled the original collection, organized it with references and motion requirements, and used those inputs to direct AI-assisted development of gear linkages and related mechanisms. I reviewed the visual and mechanical relationships and the creator controls. Providing my modeled data as context is not a claim of training a model.

The central task is adaptation: preserve the linked movement while changing a mechanism's pace or placing it in another composition. Native drivers propagate the chosen inputs; the creator retains form, motion intent, speed, phase and acceptance.

## Use and controls

The Blender library is distributed through the Superhive page above. This project folder contains its public documentation and presentation evidence; it does not include the source `.blend` library or change its license.

Register the supplied Asset Library folder in Blender, place a complete collection and select its root controller. Adjust an input documented for that asset, preserve its dependencies and review a complete motion cycle. [Controller reference](docs/controls.md) explains the differences between assets.

## Evidence

![Clockwork collection](media/collection-hero-4k.jpg)

[Motion films](https://muwentrili.github.io/creative-workflows/films/?project=clockwork) show rendered and Blender viewport sequences. [Build process](docs/process.md) records input preparation and implementation assistance.

The [CLK32 control study](docs/control-study.md) changed `Speed_Scale` from **1.0 to 0.75** in a working copy, retained the 81-driver graph and checked frames 1–601 in Blender 5.2. It also records an earlier compatibility failure. This bounded result does not prove arbitrary recomposition or collision-free motion.

## Next step

Observe an unfamiliar creator repeating one documented adjustment. The public [adaptation instructions](skills/clockwork-assembly/SKILL.md) describe inspection and checking; broader autonomous recomposition and creator time savings have not been established.
