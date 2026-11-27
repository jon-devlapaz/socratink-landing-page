import { hero } from "@/lib/content";

export function StartLearningLink() {
  return (
    <a href={hero.primary.href} className="btn-accent start-learning">
      <span>{hero.primary.label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
