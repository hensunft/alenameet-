import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { texts } from "../config/invitation";
import { screenMotionProps } from "../lib/motion";
import { EnvelopeAnimation, type EnvelopePhase } from "./EnvelopeAnimation";

interface EnvelopeScreenProps {
  /** Рендерит содержимое письма; `revealed` — письмо полностью развернулось */
  renderLetter: (revealed: boolean) => ReactNode;
}

export function EnvelopeScreen({ renderLetter }: EnvelopeScreenProps) {
  const [phase, setPhase] = useState<EnvelopePhase>("closed");

  return (
    <motion.main className="screen" {...screenMotionProps}>
      <EnvelopeAnimation phase={phase} onPhaseChange={setPhase}>
        {renderLetter(phase === "open")}
      </EnvelopeAnimation>

      <AnimatePresence>
        {phase === "closed" && (
          <motion.p
            key="hint"
            className="mt-14 text-[13px] font-medium tracking-[0.04em] text-ink-soft"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {texts.envelope.hint}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
