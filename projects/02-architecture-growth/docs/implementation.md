# Implementation scope

[← Project](../README.md) · [Detailed method](workflow.md)

This is a production method used in Blender, supported by a company-internal Skill. Its public boundary is approved output media and an explanation of production decisions; it does not expose the company scenes, scripts, prompts or exact material/node configurations.

```text
Agreed reference + architectural scene + delivery brief
  → inspect hierarchy and construction dependencies
  → apply reviewed visual rules
  → stage systems, framing and emphasis
  → inspect continuous frames and encoded output
  → accept or revise the affected passage
```

The reusable knowledge is the separation between shared visual rules and scene-specific construction decisions. Automatic setup must not decide what a building system means or conceal incorrect geometry. See the [transition correction example](workflow.md#a-production-observation-becomes-a-control-requirement).

Public presentation files live in [media/architecture-growth](../../../media/architecture-growth/) and the [film viewer](../../../docs/films/). [Media provenance and rights](../../../docs/architecture-growth-media.md) describe the viewing copies. No new source scene or Blender render is included in this documentation publication.
