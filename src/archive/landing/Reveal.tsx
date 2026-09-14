import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Retained for existing call sites; reading content no longer waits for motion. */
  delay?: number;
  y?: number;
};

/** Flow content stays visible on first paint, deep links and abrupt scroll jumps. */
export function Reveal({ children, className }: RevealProps) {
  return <div className={`reveal-content ${className ?? ""}`}>{children}</div>;
}
