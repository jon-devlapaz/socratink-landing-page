import Link from "next/link";
import { site } from "@/lib/content";

type WordmarkProps = {
  size?: "sm" | "md";
};

/** The app's mark is a solid ink dot beside the name; in dark mode the dot reads as paper. */
export function Wordmark({ size = "sm" }: WordmarkProps) {
  const dot = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const text = size === "sm" ? "text-[0.95rem]" : "text-[1.25rem]";
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 text-tx" aria-label={`${site.name} home`}>
      <span className={`${dot} rounded-full bg-tx shadow-[0_0_18px_-2px_rgba(206,205,195,0.6)]`} />
      <span className={`${text} font-normal tracking-[-0.02em]`}>{site.name}</span>
    </Link>
  );
}
