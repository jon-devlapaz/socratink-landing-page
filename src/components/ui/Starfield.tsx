type StarfieldProps = {
  count?: number;
  seed?: number;
};

/** Deterministic pseudo-random so server and client render identical stars. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Starfield({ count = 60, seed = 7 }: StarfieldProps) {
  const rand = mulberry32(seed);
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 100,
    size: 1 + Math.round(rand() * 1.4),
    twinkle: 3 + rand() * 5,
    delay: rand() * 5,
  }));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star absolute rounded-full bg-tx"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            ["--twinkle" as string]: `${s.twinkle}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
