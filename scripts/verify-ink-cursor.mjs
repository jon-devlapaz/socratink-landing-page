/**
 * Guards the restored landing ink cursor:
 * - homepage mounts a live InkCursor (not the archive)
 * - mouse / fine pointer only; reduced motion unmounts
 * - no GSAP on InkSphere, no hover title tooltips
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  failed += 1;
}
function pass(msg) {
  console.log("PASS:", msg);
}
async function read(rel) {
  return fs.readFile(path.join(root, rel), "utf8");
}

const [cursor, page, sphere, css] = await Promise.all([
  read("src/components/site/InkCursor.tsx"),
  read("src/app/page.tsx"),
  read("src/components/ink/InkSphere.tsx"),
  read("src/app/globals.css"),
]);

if (page.includes('import { InkCursor } from "@/components/site/InkCursor"') && page.includes("<InkCursor")) {
  pass("homepage mounts InkCursor");
} else {
  fail("homepage does not mount InkCursor");
}
if (/archive\/landing/.test(page) || /archive\/landing/.test(cursor)) {
  fail("cursor path imports archive landing");
} else {
  pass("cursor is not imported from archive");
}
if (/(touchstart|touchmove|touchend)/.test(cursor)) {
  fail("InkCursor listens for touch events");
} else {
  pass("InkCursor has no touch listeners");
}
if (cursor.includes("(pointer: fine)") && cursor.includes("hover: hover") && cursor.includes('pointerType !== "mouse"')) {
  pass("InkCursor is mouse / fine-pointer only");
} else {
  fail("InkCursor is missing mouse / fine-pointer guards");
}
if (cursor.includes("prefers-reduced-motion")) {
  pass("InkCursor honors prefers-reduced-motion");
} else {
  fail("InkCursor does not honor prefers-reduced-motion");
}
if (/\bgsap\b/i.test(cursor) || /from "gsap"/.test(cursor)) {
  fail("InkCursor uses GSAP");
} else {
  pass("InkCursor does not use GSAP");
}
if (/title=/.test(cursor)) {
  fail("InkCursor has a hover title tooltip");
} else {
  pass("InkCursor has no hover title tooltip");
}
if (/\bgsap\b/i.test(sphere) || /from "gsap"/.test(sphere)) {
  fail("InkSphere uses GSAP");
} else {
  pass("InkSphere has no GSAP");
}
if (css.includes("custom-cursor-active") && css.includes("cursor: none") && /body\.custom-cursor-active/.test(cursor)) {
  fail("InkCursor hides the native cursor");
} else if (!/custom-cursor-active/.test(cursor) && !/cursor:\s*none/.test(cursor)) {
  pass("InkCursor leaves the native cursor visible");
} else {
  fail("InkCursor may hide the native cursor");
}
if (css.includes(".ink-cursor") && css.includes("(pointer: coarse)")) {
  pass("CSS hides the follower on coarse pointers and reduced motion");
} else {
  fail("CSS is missing coarse / reduced-motion cursor hides");
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("PASS: ink cursor source guards");
