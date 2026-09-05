import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";

type WordmarkProps = {
  size?: "sm" | "md";
};

/**
 * The app's lockup: a solid ink dot beside the wordmark. Hover (or keyboard
 * focus) swaps the mark for the IPA, so the name is sayable.
 */
export function Wordmark({ size = "sm" }: WordmarkProps) {
  const dot = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const mark = size === "sm" ? "h-[0.95rem]" : "h-[1.25rem]";
  const { syllables, respell } = site.pronunciation;

  return (
    <Link
      href="/"
      className="brand-lockup inline-flex items-center gap-2.5"
      aria-label={`${site.name} home, pronounced ${respell}`}
    >
      <span className={`brand-mark ${dot} rounded-full bg-tx shadow-[0_0_18px_-2px_rgba(206,205,195,0.6)]`} />
      <span className="brand-word relative inline-flex items-center">
        <Image
          src="/brand/socratink_wordmark.png"
          alt=""
          width={489}
          height={88}
          className={`wordmark-img ${mark} w-auto`}
        />
        <span className="brand-ipa" aria-hidden="true">
          <span className="brand-ipa-slash">/</span>
          <span className="brand-ipa-stress">ˈ</span>
          {syllables.map((part, i) => (
            <span key={part}>
              {i > 0 ? <span className="brand-ipa-dot">·</span> : null}
              {part}
            </span>
          ))}
          <span className="brand-ipa-slash">/</span>
        </span>
      </span>
    </Link>
  );
}
