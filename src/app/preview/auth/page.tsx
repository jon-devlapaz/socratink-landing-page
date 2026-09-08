import type { Metadata } from "next";
import { AuthTwoPreview } from "@/components/auth/AuthTwoPreview";

export const metadata: Metadata = {
  title: "Auth Two Preview",
  description: "Technical drafting authentication preview for Socratink.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPreviewPage() {
  return (
    <main className="flex-1">
      <AuthTwoPreview />
    </main>
  );
}
