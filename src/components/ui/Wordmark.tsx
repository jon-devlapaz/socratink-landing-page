import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";

type WordmarkProps = {
  size?: "sm" | "md";
};

/**
 * The app's lockup: a solid ink dot beside the wordmark. The wordmark is the
 * app's own asset (ink on transparent), inverted for dark paper as the app does.
 */
export function Wordmark({ size = "sm" }: WordmarkProps) {
  const dot = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const mark = size === "sm" ? "h-[0.95rem]" : "h-[1.25rem]";
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <span className={`${dot} rounded-full bg-tx shadow-[0_0_18px_-2px_rgba(206,205,195,0.6)]`} />
      <Image
        src="/brand/socratink_wordmark.png"
        alt=""
        width={489}
        height={88}
        className={`wordmark-img ${mark} w-auto`}
      />
    </Link>
  );
}
