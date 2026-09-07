import type { DemoTurn } from "@/lib/content";

type TranscriptProps = {
  turns: readonly DemoTurn[];
  /** Number of turns to show; the rest are hidden (used for typewriter reveal). */
  visible?: number;
  /** Text of a turn currently being typed, rendered after the visible turns. */
  typing?: { role: DemoTurn["role"]; text: string } | null;
  dense?: boolean;
};

/** A faithful-enough mock of the Socratink conversation surface. */
export function Transcript({ turns, visible, typing = null, dense = false }: TranscriptProps) {
  const shown = visible === undefined ? turns : turns.slice(0, visible);
  const gap = dense ? "gap-3" : "gap-4";
  return (
    <ol className={`flex flex-col ${gap} text-[0.8125rem] leading-relaxed`}>
      {shown.map((turn, i) => (
        <TurnRow key={i} role={turn.role} text={turn.text} dense={dense} />
      ))}
      {typing ? <TurnRow role={typing.role} text={typing.text} dense={dense} caret /> : null}
    </ol>
  );
}

function TurnRow({
  role,
  text,
  dense,
  caret = false,
}: {
  role: DemoTurn["role"];
  text: string;
  dense: boolean;
  caret?: boolean;
}) {
  const isYou = role === "you";
  const pad = dense ? "px-3 py-2" : "px-3.5 py-2.5";
  return (
    <li data-turn className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] items-start gap-2.5 ${isYou ? "flex-row-reverse" : ""}`}>
        {isYou ? null : (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-tx/90" aria-hidden />
        )}
        <div
          className={`${pad} rounded-xl ${
            isYou
              ? "bg-ui-2/70 text-tx border border-tx/8"
              : "text-tx-2"
          }`}
        >
          <span className="sr-only">{isYou ? "You: " : "Socratink: "}</span>
          {text}
          {caret ? <span className="caret ml-0.5 inline-block h-[0.9em] w-px translate-y-[2px] bg-tx-2" /> : null}
        </div>
      </div>
    </li>
  );
}
