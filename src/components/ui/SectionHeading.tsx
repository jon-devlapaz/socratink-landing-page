import { Reveal } from "@/components/ui/Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  sans: string;
  serif: string;
  align?: "center" | "left";
  size?: "lg" | "md";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  sans,
  serif,
  align = "center",
  size = "lg",
  className = "",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  const scale =
    size === "lg"
      ? "text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.08]"
      : "text-[1.5rem] sm:text-[1.75rem] leading-[1.15]";

  return (
    <Reveal className={`flex flex-col gap-3 ${alignment} ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className={`${scale} flex flex-col`}>
        <span className="h-sans">{sans}</span>
        <span className="h-serif">{serif}</span>
      </h2>
    </Reveal>
  );
}
