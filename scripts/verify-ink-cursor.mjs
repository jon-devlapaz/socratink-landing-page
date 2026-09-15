/**
 * Guards the restored landing ink cursor:
 * - homepage mounts the last live AnimatedCursor (not the archive)
 * - fine pointer only; reduced motion unmounts
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

const [cursor, page, sphere] = await Promise.all([
  read("src/components/ui/AnimatedCursor.tsx"),
  read("src/app/page.tsx"),
  read("src/components/ink/InkSphere.tsx"),
]);

if (page.includes('import { AnimatedCursor } from "@/components/ui/AnimatedCursor"') && page.includes("<AnimatedCursor")) {
  pass("homepage mounts AnimatedCursor");
} else {
  fail("homepage does not mount AnimatedCursor");
}
if (/archive\/landing/.test(page) || /archive\/landing/.test(cursor)) {
  fail("cursor path imports archive landing");
} else {
  pass("cursor is not imported from archive");
}
if (/(touchstart|touchmove|touchend)/.test(cursor)) {
  fail("AnimatedCursor listens for touch events");
} else {
  pass("AnimatedCursor has no touch listeners");
}
if (cursor.includes("(pointer: fine)") && /mousemove/.test(cursor)) {
  pass("AnimatedCursor is mouse / fine-pointer only");
} else {
  fail("AnimatedCursor is missing mouse / fine-pointer guards");
}
if (cursor.includes("prefers-reduced-motion")) {
  pass("AnimatedCursor honors prefers-reduced-motion");
} else {
  fail("AnimatedCursor does not honor prefers-reduced-motion");
}
if (/\bgsap\b/i.test(cursor) || /from "gsap"/.test(cursor)) {
  fail("AnimatedCursor uses GSAP");
} else {
  pass("AnimatedCursor does not use GSAP");
}
if (/title=/.test(cursor)) {
  fail("AnimatedCursor has a hover title tooltip");
} else {
  pass("AnimatedCursor has no hover title tooltip");
}
if (/\bgsap\b/i.test(sphere) || /from "gsap"/.test(sphere)) {
  fail("InkSphere uses GSAP");
} else {
  pass("InkSphere has no GSAP");
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("PASS: ink cursor source guards");
