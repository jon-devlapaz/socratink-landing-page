"use client";

import { Reveal } from "@/components/ui/Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  sans: string;
  serif: string;
  align?: "center" | "left";
  size?: "lg" | "md";
  className?: string;
  /** Pin/cue acts drive their own entrance; skip the once-in-view fade. */
  reveal?: boolean;
};

export function SectionHeading({
  eyebrow,
  sans,
  serif,
  align = "center",
  size = "lg",
  className = "",
  reveal = true,
}: SectionHeadingProps) {
  const alignment =
    align === "center"
      ? "text-center items-center"
      : "text-center items-center lg:text-left lg:items-start";
  const scale =
    size === "lg"
      ? "text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.08]"
      : "text-[1.5rem] sm:text-[1.75rem] leading-[1.15]";

  const inner = (
    <>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className={`${scale} flex flex-col`}>
        <span className="h-sans" data-split-reveal>{sans}</span>
        <span className="h-serif" data-split-reveal>{serif}</span>
      </h2>
    </>
  );

  if (!reveal) {
    return <div className={`flex flex-col gap-3 ${alignment} ${className}`}>{inner}</div>;
  }

  return (
    <Reveal className={`flex flex-col gap-3 ${alignment} ${className}`}>
      {inner}
    </Reveal>
  );
}
