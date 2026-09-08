import type { Metadata } from "next";
import { AuthTwoPreview } from "@/components/auth/AuthTwoPreview";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Socratink notebook.",
};

export default function LoginPage() {
  return (
    <main className="flex-1">
      <AuthTwoPreview />
    </main>
  );
}
