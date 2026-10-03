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

for (const theme of ["light", "dark"]) {
  const original = path.join(brand, `living-ink-poster${theme === "dark" ? "-dark" : ""}.png`);
  for (const size of [512, 768, 1120]) {
    await save(sharp(original).resize(size), `living-ink-${theme}-${size}.webp`);
  }
  for (const study of ["map", "speak", "teacher"]) {
    await save(sharp(path.join(brand, `ink-${study}-${theme}.png`)), `ink-${study}-${theme}.webp`);
  }
}

for (const study of ["map", "speak", "teacher"]) {
  const alpha = await sharp(path.join(brand, `ink-${study}-light.png`))
    .resize(144, 108).ensureAlpha().extractChannel("alpha").raw().toBuffer();
  const rgba = Buffer.alloc(alpha.length * 4, 255);
  for (let i = 0; i < alpha.length; i++) rgba[i * 4 + 3] = alpha[i];
  await save(sharp(rgba, { raw: { width: 144, height: 108, channels: 4 } }), `signature-${study}.webp`);
}
