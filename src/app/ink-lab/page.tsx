import type { Metadata } from "next";
import { InkLab } from "@/components/ink/InkLab";
export const metadata: Metadata = {
  title: "Ink laboratory",
  robots: { index: false, follow: false },
};
export default function InkLabPage() {
  return <InkLab />;
}
