# Living ink experiment

2026-09-09. Open `/ink-lab` with `pnpm dev` on port 3001. The landing hero now uses the same renderer. The earlier shader remains available through the existing `/?shape=code&morph=1` comparison path.

## Decision

Reuse [three-raymarcher](https://github.com/danielesteban/three-raymarcher), pinned to 0.4.0 (MIT; installed package declares Three >=0.182.0). It supplies raymarched distance fields, smooth CSG, normals, and environment-based physical shading. Our code supplies a small validated scene format, generated studio lighting, restrained motion, lifecycle handling, and an editor. No external lighting asset or rendering service is required.

The original renderer encoded six fixed targets in a displaced sphere mesh. Thin embossed features were sampled at vertices, and front-facing lighting could collapse to black. More triangles did not eliminate its serrations. A fragment-field repair was the smaller option for those six icons; the subsequent requirement for model-created forms makes a reusable composition renderer worth testing.

Alternatives investigated:

| Project                                                               | Fit for this experiment                                                                                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Paper Shaders](https://github.com/paper-design/shaders)              | The liquid-metal prototype was quick to integrate, but its standard silhouettes and graphic treatment were a weaker fit for arbitrary composed volume. |
| [Droplets](https://github.com/koji014/interactive-droplets)           | Useful visual/reference implementation; adopting the complete demo would require more extraction and a separate license review.                        |
| [three-raymarcher](https://github.com/danielesteban/three-raymarcher) | Directly exposes sphere/ellipsoid, capsule, and rounded-box operations. Best fit among the tested candidates for a small model-controlled scene.       |

This is animated implicit geometry, not a fluid dynamics simulation. Its current visual language is wet ink/soft sculpture. Arbitrary text, detailed semantic objects, and physically correct pouring are outside the scene vocabulary.

## Model interface

`src/lib/ink/scene.ts` is the canonical Zod schema. `src/lib/ink/tool.ts` exports generated JSON Schema function definitions and the executor. The lab and browser agents call the same executor:

```js
const ink = window.socratinkInk;
ink.definitions; // Tool names, descriptions, and JSON Schema parameters
const current = ink.call("ink_get_scene");

const scene = structuredClone(current.scene);
scene.name = "Quiet drop";
scene.motion = { speed: 0.25, amplitude: 0.06, pointer: 0.15 };
scene.parts = [
  {
    shape: "sphere",
    operation: "union",
    position: [0, -0.2, 0],
    scale: [1.5, 1.4, 1.3],
    rotation: [0, 0, 0],
  },
  {
    shape: "capsule",
    operation: "union",
    position: [0.15, 0.5, 0],
    scale: [0.6, 1.1, 0.6],
    rotation: [0, 0, -12],
  },
];
ink.call("ink_set_scene", { scene });
ink.call("ink_control", { paused: false, resolution: 0.75 });
// Wait until ink_get_scene().rendering.transitioning is false, then:
const capture = ink.call("ink_capture"); // capture.image is a PNG data URL
```

A browser-capable agent can invoke the interface with its evaluate tool. A future model host can register `inkToolDefinitions` and forward parsed arguments to this browser executor. There is no model connection, remote endpoint, or installed MCP server in this spike. Function definitions do not execute model calls by themselves. Capture results need to be delivered as images for a model to visually evaluate them.

Use **get → set → wait → capture → inspect → revise**. An accepted scene is not proof that its appearance meets the request. `revision` tracks accepted scene replacements; `rendering.transitioning` distinguishes acceptance from settling. Motion continues after settling unless paused. Captures are transparent PNGs and do not advance simulation time.

The scene supports 1–8 ordered parts, union/subtract/intersect, XYZ rotation in degrees, material, blending, and motion. Scale is full dimensions. The first operation must be union; capsules require y >= x and z == x. Strict validation rejects unknown fields, invalid numbers, and out-of-budget scenes without replacing the current scene. Cross-field constraints are described in the tool definition and enforced by the executor. Empty or disconnected results remain possible with valid CSG: visual inspection is necessary.

Scene recipes persist in sessionStorage for the current tab. Reloading preserves the recipe, not the animation clock, paused state, revision counter, or render quality. Opening the hero in that tab previews the saved recipe. The lab's Living ink button restores the default recipe. There is one active global controller per page; a multi-canvas product would need explicit instance routing.

## Rendering choices and limits

- Local area-light environment with restrained black material produces broad wet highlights. PMREM lighting is regenerated after graphics context restoration.
- The library's internal `MIN_DISTANCE` define is tuned from 0.05 to 0.005 for approximately two-unit forms. This is a version-sensitive integration point; review it when upgrading the pinned library.
- Continuous values ease toward the latest recipe. Added parts grow; removed parts contract. Changing primitive type or boolean operation is discrete and can still pop. This is not arbitrary topology-preserving morphing.
- DPR is capped at 2. Balanced resolution scales both raymarch dimensions to 0.75, or 56.25% of Full's pixel count. That is a workload-size comparison, not a measured energy or GPU-time saving.
- Pause, reduced motion, offscreen visibility, and hidden document state stop unnecessary animation. Reduced motion still permits static scene updates. The fallback poster remains until a frame renders and reappears during context loss.
- PNG capture uses a preserved drawing buffer. If capture becomes rare at larger scales, benchmark on-demand capture before removing that setting.
- The default is a deliberate starting point, not a proven Pareto optimum. The next useful tests are art-direction feedback, operation-change transitions, and physical-phone frame pacing; a full fluid solver is not yet justified.

## Verification

```sh
pnpm check
pnpm test:smoke
pnpm test:ink
# Optional overrides: INK_URL, INK_ARTIFACTS, CHROME_PATH
```

The ink test runs actual WebGL in installed Chrome with ANGLE/Metal. It generates a new two-part aperture via the tool, rejects malformed model calls atomically, checks tab persistence and all four presets, exercises rapid replacement, verifies paused pixels and stopped rendering, measures three resolutions, tests both themes and reduced motion, pauses offscreen, restores a lost graphics context, and checks 390px mobile layouts. Artifacts and raw metrics are written to gitignored `lab/ink-verification/`.

The September 9 development and production runs passed with no browser errors on an Apple M5 Pro running Chrome 153.0.8010.36. At a 1120×1120 output canvas, 120 sampled animation intervals per quality setting gave p50 ≈16.7 ms and p95 ≈16.7–16.8 ms at 0.5, 0.75, and 1. These are desktop requestAnimationFrame intervals, not isolated GPU timestamps. Mobile viewport checks do not establish performance on a physical phone. Screenshots were visually inspected; there is no automated aesthetic score or claim of universal rendering fidelity.

## Socratink symbol spike

The lab now offers four simulated learning moments through `ink_express`:

| Expression | Form          | Intended moment                                 |
| ---------- | ------------- | ----------------------------------------------- |
| `rest`     | Ink droplet   | Waiting, with room for an idea to form          |
| `question` | Question mark | A question opens or an assumption is examined   |
| `connect`  | Bridge        | Connecting two ideas                            |
| `explain`  | Open notebook | Explaining something in the learner's own words |

```js
window.socratinkInk.call("ink_express", { expression: "question" });
```

`src/lib/ink/expressions.ts` holds ordinary validated scene recipes, not another renderer. They use 3–8 rounded capsules; equal length/diameter yields a sphere. Keeping one primitive family across the four expressions allows the existing position, scale, and rotation interpolation to form the transitions. A calmer motion range preserves the question's dot and notebook's page openings. The bridge was revised after the first render read too much like headphones.

The lab buttons simulate events and use the same command as a browser agent. These cues are not wired to real learning events and do not represent an assessment. There is no automatic icon carousel. Select a moment, then follow the Socratink link to preview that saved recipe in the hero in the same tab. The original material presets are under Material studies. `ink_set_scene` remains available to adapt any recipe after choosing an expression.

Run `pnpm test:ink-symbols` with the dev server available. It exercises all four UI/tool commands, captures intermediate transitions and final forms in both themes, checks atomic rejection and rapid interruption, verifies persistence and reduced motion, and captures desktop/mobile hero previews. Screenshots and a comparison sheet are in `lab/ink-symbols/`. The symbol suite passed against development and production builds with no browser errors; `pnpm check` and the existing `pnpm test:ink` suite also passed. Readability is a visual judgment from these renders, not a user-recognition study. A model backend and actual product-event wiring remain future work.


## Landing integration

The hero now has four explicit symbol preview controls (Rest, Wonder, Connect, Your words), using the same `ink_express` executor. They are opt-in illustrations, not inferred learning outcomes. Stored lab recipes remain previewable in the hero; legacy `?shape=` inspection remains available. Section-driven changes were discarded because they changed the hero while it was offscreen. `pnpm test:ink-landing` verifies the real controls, selected state, mobile layout, reduced motion, and legacy comparison. Build, symbol checks, and encounter smoke also passed.
