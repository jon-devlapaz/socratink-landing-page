"use client";

import { useEffect } from "react";
import { mountSmoothCursor } from "@/lib/cursor/smooth-cursor";

/** Ink-orb pointer from the app. Fine pointer only; native cursor otherwise. */
export function SmoothCursor() {
  useEffect(() => mountSmoothCursor(), []);
  return null;
}
