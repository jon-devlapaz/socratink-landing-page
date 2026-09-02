import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Starfield } from "@/components/ui/Starfield";
import { orbit } from "@/lib/content";

/**
 * lazy.so's "Capture anything from anywhere": a starfield with app icons circling
 * a ⌘ mark. Here the concepts of the agent stack circle the ink dot.
 */
export function Orbit() {
  const outer = orbit.nodes.slice(0, 6);
  const inner = orbit.nodes.slice(6);

  return (
    <section className="relative isolate overflow-hidden py-28 sm:py-36">
      <Starfield count={70} />
      <SectionHeading eyebrow={orbit.eyebrow} sans={orbit.titleSans} serif={orbit.titleSerif} />

      <Reveal delay={0.15} className="mx-auto mt-12 flex justify-center px-5">
        <div className="relative h-[17rem] w-[17rem] sm:h-[28rem] sm:w-[28rem]">
          <Ring nodes={outer} radiusPct={50} duration={80} />
          <Ring nodes={inner} radiusPct={30} duration={55} reverse />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-2 shadow-[0_0_0_1px_rgba(206,205,195,0.12),0_0_60px_-10px_rgba(206,205,195,0.35)]">
              <span className="h-5 w-5 rounded-full bg-tx" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Ring({
  nodes,
  radiusPct,
  duration,
  reverse = false,
}: {
  nodes: readonly string[];
  radiusPct: number;
  duration: number;
  reverse?: boolean;
}) {
  const size = radiusPct * 2;
  const offset = (100 - size) / 2;
  return (
    <div
      className="orbit-ring absolute rounded-full border border-dashed border-tx/12"
      style={{
        width: `${size}%`,
        height: `${size}%`,
        left: `${offset}%`,
        top: `${offset}%`,
        ["--orbit-duration" as string]: `${duration}s`,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {nodes.map((label, i) => {
        const angle = (i / nodes.length) * 360;
        return (
          // Spoke: a full-size layer rotated to the node's angle; the node sits at its right edge.
          <div key={label} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
            <div className="absolute right-0 top-1/2 h-0 w-0">
              <div
                className="orbit-item absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  ["--orbit-duration" as string]: `${duration}s`,
                  animationDirection: reverse ? "reverse" : "normal",
                }}
              >
                <div style={{ transform: `rotate(${-angle}deg)` }}>
                  <span className="tile inline-block whitespace-nowrap bg-paper-2 px-3 py-1.5 text-[0.75rem] text-tx-2 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]">
                    {label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
