import type { Metadata } from "next";
import { InkLabV2 } from "@/components/ink/InkLabV2";

export const metadata: Metadata = {
  title: "Ink laboratory v2 · Autonomous Model Embodiment",
  description:
    "Experimental lab where AI models sculpt semantic 3D concepts via Endpoint Stroke DSL and embody cognitive states with fluid mechanics.",
  robots: { index: false, follow: false },
};

export default function InkLabV2Page() {
  return <InkLabV2 />;
}
