# Creative Workflows / Muwen Li

**Creative technology · 3D production · AI-assisted tools**

I model, direct visual production and use AI-assisted code to turn recurring production tasks into editable tools. This portfolio shows how I frame a problem, prepare the inputs, design the controls and check the result.

**Explore the work:** [Clockwork: my models into linked mechanisms](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/process.md) · [Architecture: a repeatable production method](projects/blue-white-architecture-growth.md) · [Browse all seven projects](#selected-work)

[Repository map](#repository-map) · [Evidence & next decisions](docs/review-guide.md) · [Source & releases](docs/distribution.md) · [Sharing guide](docs/share-and-review.md)

## Selected work

**New here?** Click a **project title** for the problem, my contribution and how it was built. Use **Open** to visit the product page, launch a web app or watch the films directly. No GitHub account is required.

**Review order:** original modeling → architectural production → tools for model explanation, shot review, spatial presentation, typography and tracking. The same project numbers follow through the portfolio and studios.

| Project / case study | Production problem → design decision | Open |
| --- | --- | --- |
| **01 · [Clockwork](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/production-case.md)** | My original models need linked motion and reuse → AI-assisted gear linkages and editable controls | [Superhive&nbsp;product](https://superhivemarket.com/products/steampunk-clockwork-animated-assets) |
| **02 · [Blue / White Architecture Growth](projects/blue-white-architecture-growth.md)** | Repeated production needs a consistent visual language → reusable styling and staged construction | [Watch&nbsp;films](https://muwentrili.github.io/creative-workflows/films/?project=growth&film=tennis-sequence) |
| **03 · [Model Breakdown Studio](https://github.com/MuwenTriLi/model-breakdown-studio)** | A dense model is hard to explain → selectable parts, exploded views and editable reveals | [Open&nbsp;web&nbsp;app](https://meshroom-breakdown-studio.limuwen9.chatgpt.site) |
| **04 · [Animated Storyboard](projects/03-collage-motion.md)** | Separate clips make shot comparison awkward → one moving board with local revisions | [Open&nbsp;web&nbsp;app](https://muwentrili.github.io/creative-workflows/collage-motion/) |
| **05 · [Spatial Media Presenter](projects/04-flipframe.md)** | A collection needs editorial pacing → editable spatial order, transitions and holds | [Open&nbsp;web&nbsp;app](https://flipframe-motion-lab.limuwen9.chatgpt.site) |
| **06 · [Kinetic Typography Studio](projects/05-vox-one.md)** | Speech and visual rhythm need to agree → editable words, timing and typography | [Open&nbsp;web&nbsp;app](https://vox-one.limuwen9.chatgpt.site) |
| **07 · [Motion Tracking Studio](projects/06-trace-01.md)** | A moving subject needs visual context → target selection, anchors and overlays | [Try&nbsp;prototype](https://trace-01-motion-tracker.limuwen9.chatgpt.site) |

**Review status:** the browser tools are interactive prototypes with documented export checks. Motion Tracking Studio still has a known export-timing issue. [Tested outputs and current limits](docs/functional-review.md).

**What to look for:** how I turn a production problem into editable behavior, use AI to assist implementation, and keep creative decisions with the person making the work. [Process, controls and evidence](docs/review-guide.md).

## 01 / Clockwork — my models into an editable motion system

**My original models → organized AI inputs → linked mechanisms → reusable controls**

I modeled the original source collection myself, organized it as input and references, then worked with Codex to develop related mechanisms and gear linkages. I set the design direction and reviewed the results; the reusable library is the outcome of that workflow.

<table>
<tr>
<td width="46%" align="center" valign="top"><a href="media/clockwork-collection.png"><img src="media/clockwork-collection.png" alt="Original rendered Clockwork collection showing clocks and mechanical assemblies" height="180"></a><br><b>Packaged outcome</b><br><sub>46 animated assets · my source models and design direction</sub></td>
<td width="27%" align="center" valign="top"><a href="https://github.com/MuwenTriLi/steampunk-clockwork-showcase#motion-is-part-of-the-design"><img src="media/clockwork-gear-motion.gif" alt="Animated CLK08 turntable showing the exposed clock mechanism" height="180"></a><br><b>Motion study</b><br><sub>Animated turntable · exposed movement</sub></td>
<td width="27%" align="center" valign="top"><a href="https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/controls.md#opening-and-folding--clk32-aperture"><img src="media/clockwork-opening-motion.gif" alt="Animated CLK32 canopy showing the linked opening mechanism" height="180"></a><br><b>Controlled opening</b><br><sub>Linked mechanism · adjustable speed and phase</sub></td>
</tr>
</table>

The technical design separates editable inputs from driven results: speed and phase controls propagate through native Blender drivers, hierarchies and constraints. A later instruction Skill records the adaptation method; its fresh end-to-end execution remains to be demonstrated.

[Full case study](https://github.com/MuwenTriLi/steampunk-clockwork-showcase) · [Control reference](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/controls.md) · [Workflow + Skill](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/workflow-skill.md)

## 02 / Architecture Growth — company production case

**A shared visual direction · Staged construction · Detail at architectural scale**

<table><tr>
<td width="46%" align="center" valign="top"><a href="docs/architecture-growth-media.md#watch-the-selected-films"><img src="media/architecture-growth/detail-c-smooth.webp" height="210" alt="Building growth with surrounding urban context"></a><br><b>Building & context</b><br><sub>A consistent blue-white visual language</sub></td>
<td width="27%" align="center" valign="top"><a href="projects/blue-white-architecture-growth.md"><img src="media/architecture-growth/tennis-plan-smooth.webp" height="210" alt="Tennis venue plan and staged structure"></a><br><b>Plan to structure</b><br><sub>Spatial reference before visual density</sub></td>
<td width="27%" align="center" valign="top"><a href="docs/architecture-growth-media.md#watch-the-selected-films"><img src="media/architecture-growth/detail-a-smooth.webp" height="210" alt="Floor and facade construction detail"></a><br><b>Detail & assembly</b><br><sub>Readable systems and construction order</sub></td>
</tr></table>

As Creative Content Director at **illoca**, I turn a shared architectural aesthetic into a repeatable Blender production method, refined across detail, tower and tennis-venue studies. This case presents completed visuals and high-level decisions; company source scenes and internal Skills remain private.

[Full case study](projects/blue-white-architecture-growth.md) · [Selected films](docs/architecture-growth-media.md#watch-the-selected-films) · [Creator controls and validation](projects/blue-white-architecture-growth.md#the-production-problem)

## 03 / Model Breakdown Studio — model to explanation

**Inspect the input · Separate its systems · Explain a component in context**

<table><tr>
<td width="46%" align="center" valign="top"><a href="https://meshroom-breakdown-studio.limuwen9.chatgpt.site"><img src="media/model-breakdown-editor.png" height="210" alt="Model Breakdown Studio: Press Manufacturing Line opens in an exploded view"></a><br><b>Interactive studio</b><br><sub>Choose a GLB · explode · highlight · export</sub></td>
<td width="27%" align="center" valign="top"><a href="https://muwentrili.github.io/creative-workflows/model-breakdown-films/#equipment"><img src="docs/model-breakdown-films/equipment.webp" height="210" alt="Production equipment separated into readable systems, with hydraulic equipment highlighted"></a><br><b>Explain the equipment</b><br><sub>Production line · component emphasis</sub></td>
<td width="27%" align="center" valign="top"><a href="https://muwentrili.github.io/creative-workflows/model-breakdown-films/#structure"><img src="docs/model-breakdown-films/structure.webp" height="210" alt="Exploded structural system with a readable assembly hierarchy"></a><br><b>Separate the systems</b><br><sub>Structural hierarchy · complete sequence</sub></td>
</tr></table>

Turn a multi-part model into a readable explanation for AEC and industrial design. The public app starts with **Press Manufacturing Line**, already exploded; switch to Wood House or Car Production Line, or import your own GLB. Compare assembled and exploded views, select a component, then review the output settings before rendering.

[Open the studio →](https://meshroom-breakdown-studio.limuwen9.chatgpt.site) · [Full case study](https://github.com/MuwenTriLi/model-breakdown-studio) · [One-minute walkthrough](https://github.com/MuwenTriLi/model-breakdown-studio#try-it-in-one-minute) · [4K export guide](docs/studio-delivery.md)

## 04 / Animated Storyboard — moving shots on one board

**Compare motion · Arrange and label shots · Review the complete board**

<table><tr>
<td align="center" valign="top"><a href="https://muwentrili.github.io/creative-workflows/collage-motion/"><img src="media/collage-review-board.webp" width="960" alt="Animated Storyboard: 35 moving shots with permanent source IDs and white review overlays"></a><br><b>A moving storyboard for shot review</b><br><sub>35 supplied shots · Six white HUD styles · Editable order and framing</sub></td>
</tr></table>

Bring separate clips into one readable review board so a director, designer or client can compare framing, atmosphere and motion. Preview each source below the canvas, change its order or caption, and choose whether it appears in the board and export.

[Open the board →](https://muwentrili.github.io/creative-workflows/collage-motion/) · [Full case study](projects/03-collage-motion.md) · [Source-clip controls](projects/03-collage-motion.md#source-clips-inspect-and-revise-the-board) · [Design demos & 4K output](https://muwentrili.github.io/creative-workflows/collage-motion/process/)

## 05 / Spatial Media Presenter — media in a spatial sequence

**Arrange a collection · Control transitions and holds · Present in 4K**

<table><tr>
<td align="center" valign="top"><a href="https://flipframe-motion-lab.limuwen9.chatgpt.site"><img src="media/flipframe-editor.png" width="960" alt="Spatial Media Presenter: media archive, Orbital Shift preview and editable motion controls"></a><br><b>A spatial presentation with editable pacing</b><br><sub>15 supplied visuals · Orbital Shift on entry · Control order, framing and timing</sub></td>
</tr></table>

Turn images and motion studies into a presentation that moves from a collection overview to individual works. Import your own media, arrange the sequence and tune each transition and hold so the content remains readable.

[Open the presenter →](https://flipframe-motion-lab.limuwen9.chatgpt.site) · [Full case study](projects/04-flipframe.md) · [Watch the 25 s sequence](https://muwentrili.github.io/creative-workflows/collage-motion/process/#flipframe) · [4K export guide](docs/studio-delivery.md)

## 06 / Kinetic Typography Studio — speech into timed typography

**Import speech · Correct the words · Shape the visual rhythm**

<table><tr>
<td align="center" valign="top"><a href="https://vox-one.limuwen9.chatgpt.site"><img src="media/vox-one-editor.png" width="960" alt="Kinetic Typography Studio: source media, editable transcript, live typography preview and styling controls"></a><br><b>Editable words, timing and visual emphasis</b><br><sub>Speech-led typography · Transcript correction · Preview before delivery</sub></td>
</tr></table>

Turn spoken English into timed typography, then review the wording, phrasing and visual emphasis. The studio opens with a silent, authored typography example; import a voice clip to use the speech workflow. Real-speech validation remains part of the next review.

[Open the typography studio →](https://vox-one.limuwen9.chatgpt.site) · [Full case study](projects/05-vox-one.md) · [Verified scope & next checks](docs/functional-review.md) · [Export guide](docs/studio-delivery.md)

## 07 / Motion Tracking Studio — target tracking and motion annotation

**Import your footage · Choose a target or anchor · Review the overlay**

<table><tr>
<td align="center" valign="top"><a href="https://trace-01-motion-tracker.limuwen9.chatgpt.site"><img src="media/trace-01-editor.png" width="960" alt="Motion Tracking Studio: an empty video import workspace with target selection, position anchor and HUD controls"></a><br><b>Make a subject easier to follow</b><br><sub>Your video · Target 01 or a fixed position anchor · Editable white HUD</sub></td>
</tr></table>

Connect a subject to a readable locator, path and information overlay. The studio starts empty: import your footage, select a target or place a fixed anchor, then inspect the result. Export timing remains under review; this project is presented as a prototype with documented limits.

[Open the tracking studio →](https://trace-01-motion-tracker.limuwen9.chatgpt.site) · [Full case study](projects/06-trace-01.md) · [Tracking & export limitations](docs/functional-review.md) · [First-use guide](docs/studio-delivery.md)

## From production problem to a usable workflow

| Step | What I make explicit | Example to inspect |
| --- | --- | --- |
| Frame the job | The creator's task, bottleneck and useful output | [Shot review and local corrections](projects/03-collage-motion.md#from-production-experience-to-product-decisions) |
| Structure the inputs | My source work, visual rules and dependencies for AI-assisted development | [Clockwork's build process](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/process.md) |
| Build editable behavior | Automate repeatable work while exposing meaningful choices | [Clockwork controller logic](https://github.com/MuwenTriLi/steampunk-clockwork-showcase/blob/main/docs/controls.md) · [Creator authority](docs/creative-control.md) |
| Check, learn and hand over | Exact test scope, failure cases and the next decision | [Functional review](docs/functional-review.md) · [Storyboard implementation handoff](docs/animated-storyboard-handoff.md) |

The commercial Clockwork library and completed architectural work establish production experience. The browser prototypes make interaction decisions inspectable. Their checks support specific inputs and outputs; they do not establish broad adoption or measured productivity gains. [Evidence and next experiments](docs/review-guide.md).

## Repository map

```text
creative-workflows/
├── README.md                         Portfolio entry and review route
├── projects/                         Per-project problem, process and evidence
│   ├── 02-meshroom.md                Model Breakdown overview
│   ├── 03-collage-motion.md          Animated Storyboard case
│   ├── 04-flipframe.md               Spatial Media Presenter case
│   ├── 05-vox-one.md                 Timed typography case
│   ├── 06-trace-01.md                Tracking prototype case
│   └── blue-white-architecture-growth.md
├── docs/
│   ├── review-guide.md              Evidence, role relevance and next decisions
│   ├── creative-control.md          Automation and creator authority
│   ├── functional-review.md         Completed checks and known limits
│   ├── animated-storyboard-handoff.md  Concrete implementation and test map
│   ├── distribution.md              Source, local demo and release instructions
│   ├── studio-delivery.md           4K export walkthroughs
│   ├── collage-motion/             Hosted Storyboard app, examples and licenses
│   ├── model-breakdown-films/       Selected complete output films
│   └── films/                      Cross-project film viewer
└── media/                           README previews and case-study media
```

[Browse cases](projects/) · [Browse documentation](docs/) · [Download a versioned demo](https://github.com/MuwenTriLi/creative-workflows/releases) · [How to run it locally](docs/distribution.md)

Some filenames retain earlier names and numbering to preserve existing links. The public titles and project IDs above are the current presentation.

**Related repositories:** [Model Breakdown Studio](https://github.com/MuwenTriLi/model-breakdown-studio) contains its app source and scoped MIT license. [Clockwork](https://github.com/MuwenTriLi/steampunk-clockwork-showcase) contains the build process, controls, instruction Skill and visual evidence; the commercial Blender library is distributed through its product page. Company source scenes and internal Skills are not published.
