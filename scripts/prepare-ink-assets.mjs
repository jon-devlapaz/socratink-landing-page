import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next")] }));
const brand = fileURLToPath(new URL("../public/brand/", import.meta.url));

async function save(image, name) {
  const result = await image.webp({ lossless: true, effort: 6 }).toFile(path.join(brand, name));
  console.log(`${name}: ${result.size} bytes`);
}

// Store when the brush reaches each pixel of the approved print.
async function savePineReveal() {
  const { data: alpha, info: { width, height } } = await sharp(path.join(brand, "ink-pine-light.png"))
    .ensureAlpha().extractChannel("alpha").raw().toBuffer({ resolveWithObject: true });
  if (width !== 512 || height !== 377) throw new Error("The brush path uses the native 512 × 377 pine print");
  const distance = new Uint16Array(alpha.length);
  const queue = new Uint32Array(alpha.length);
  function drawFrom(x, y, start) {
    const origin = y * width + x;
    if (!start || alpha[origin] < 32 || distance[origin]) throw new Error("Invalid pine brush origin");
    queue[0] = origin;
    distance[origin] = start;
    let count = 1;
    for (let i = 0; i < count; i++) {
      const from = queue[i];
      for (const step of [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1]) {
        const to = from + step;
        if (alpha[to] > 1 && !distance[to]) {
          distance[to] = distance[from] + 1;
          queue[count++] = to;
        }
      }
    }
  }
  drawFrom(253, 304, 1); // Foot of the trunk in the native 512 × 377 print.
  const trunkTip = distance[98 * width + 216];
  if (!trunkTip) throw new Error("Pine brush did not reach the trunk tip");
  drawFrom(216, 87, trunkTip + 11); // Lift across the bare paper to the crown.
  if (alpha.some((value, i) => value > 32 && !distance[i])) throw new Error("Pine brush missed part of the print");
  const longest = distance.reduce((max, value) => Math.max(max, value), 0);
  const reveal = Uint8Array.from(distance, value => value ? Math.round(254 * value / longest) : 255);
  await save(sharp(reveal, { raw: { width, height, channels: 1 } }), "ink-pine-reveal.webp");
}

for (const theme of ["light", "dark"]) {
  const original = path.join(brand, `living-ink-poster${theme === "dark" ? "-dark" : ""}.png`);
  for (const size of [512, 768, 1120]) {
    await save(sharp(original).resize(size), `living-ink-${theme}-${size}.webp`);
  }
  for (const study of ["pine", "speak", "teacher"]) {
    await save(sharp(path.join(brand, `ink-${study}-${theme}.png`)), `ink-${study}-${theme}.webp`);
  }
}

await savePineReveal();

// The map chapter draws the pine, so its closing mark is cut from the pine print.
for (const [study, source] of [["map", "pine"], ["speak", "speak"], ["teacher", "teacher"]]) {
  const alpha = await sharp(path.join(brand, `ink-${source}-light.png`))
    .resize(144, 108, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha().extractChannel("alpha").raw().toBuffer();
  const rgba = Buffer.alloc(alpha.length * 4, 255);
  for (let i = 0; i < alpha.length; i++) rgba[i * 4 + 3] = alpha[i];
  await save(sharp(rgba, { raw: { width: 144, height: 108, channels: 4 } }), `signature-${study}.webp`);
}
