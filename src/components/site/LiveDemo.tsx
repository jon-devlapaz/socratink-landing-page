"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Transcript } from "@/components/ui/Transcript";
import { lenses, type DemoTurn, type Lens } from "@/lib/content";

type Playback = {
  lens: Lens["id"];
  done: number;
  typing: { role: DemoTurn["role"]; text: string } | null;
};

const CHAR_MS = 18;
const TURN_PAUSE_MS = 650;

/**
 * Hero demo: an example conversation, idle until a lens is chosen, then a scripted
 * exchange types itself out. No network; the point is to show the shape of the
 * interaction, not to run the model.
 */
export function LiveDemo({ onActivity }: { onActivity?: (level: number) => void }) {
  const [play, setPlay] = useState<Playback | null>(null);
  const timers = useRef<number[]>([]);
  const reduce = useReducedMotion();

  // Let the sphere stir while Socratink "speaks", as the app's orb does while working.
  useEffect(() => {
    if (!onActivity) return;
    const role = play?.typing?.role;
    onActivity(role === "socratink" ? 0.6 : role === "you" ? 0.15 : 0);
  }, [play?.typing?.role, onActivity]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const start = (id: Lens["id"]) => {
    clearTimers();
    const lens = lenses.find((l) => l.id === id);
    if (!lens) return;
    if (reduce) {
      setPlay({ lens: id, done: lens.transcript.length, typing: null });
      return;
    }

    setPlay({ lens: id, done: 0, typing: null });

    let t = 300;
    lens.transcript.forEach((turn, index) => {
      for (let c = 1; c <= turn.text.length; c++) {
        const slice = turn.text.slice(0, c);
        timers.current.push(
          window.setTimeout(() => {
            setPlay({ lens: id, done: index, typing: { role: turn.role, text: slice } });
          }, t),
        );
        t += turn.role === "you" ? CHAR_MS : CHAR_MS * 1.15;
      }
      timers.current.push(
        window.setTimeout(() => {
          setPlay({ lens: id, done: index + 1, typing: null });
        }, t),
      );
      t += TURN_PAUSE_MS;
    });
  };

  const active = play ? lenses.find((l) => l.id === play.lens) : null;

  return (
    <div className="card relative w-full overflow-hidden p-2.5">
      <div className="rounded-[0.625rem] border border-tx/8 bg-paper/70 p-4 sm:p-5">
        {active && play ? (
          <div className="min-h-[9.5rem]">
            <Transcript turns={active.transcript} visible={play.done} typing={play.typing} dense />
          </div>
        ) : (
          <div className="flex min-h-[9.5rem] flex-col justify-between gap-5">
            <p className="text-[0.9rem] text-tx-2">
              Choose a move to play an example.
            </p>
            <div className="flex flex-wrap gap-2">
              {lenses.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => start(l.id)}
                  className="tile flex min-h-11 items-center gap-2 px-3 py-1.5 text-left text-[0.8125rem] text-tx-2 transition-[border-color,color,scale] duration-150 ease-out hover:border-accent/40 hover:text-tx active:scale-[0.96]"
                >
                  <span className="text-accent">✦</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2.5 pb-0.5 text-[0.75rem] text-tx-2">
        <span>Scripted example</span>
        {active ? (
          <button
            type="button"
            onClick={() => {
              clearTimers();
              setPlay(null);
            }}
            className="btn-ghost min-h-11"
          >
            Start over
          </button>
        ) : null}
      </div>
    </div>
  );
}
