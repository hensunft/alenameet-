import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { texts } from "../config/invitation";
import { screenMotionProps, tapSpring } from "../lib/motion";
import { Heart } from "./Heart";
import { MovingNoButton } from "./MovingNoButton";

interface WelcomeScreenProps {
  onYes: () => void;
  onDecline: () => void;
}

/** После скольких попыток нажать «Нет» появляется спокойный способ отказаться */
const ATTEMPTS_BEFORE_SOFT_DECLINE = 5;

export function WelcomeScreen({ onYes, onDecline }: WelcomeScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const declineRef = useRef<HTMLButtonElement>(null);
  const [attempts, setAttempts] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const avoidRefs = useMemo(() => [titleRef, yesRef, declineRef], []);
  const handleAttempt = useCallback(() => setAttempts((count) => count + 1), []);

  const leave = (next: () => void) => {
    if (leaving) return;
    setLeaving(true);
    next();
  };

  const showSoftDecline = attempts >= ATTEMPTS_BEFORE_SOFT_DECLINE;

  return (
    <motion.main className="screen" {...screenMotionProps}>
      <div className="card card-frame px-7 pt-11 pb-10 text-center sm:px-10 sm:pt-12 sm:pb-11">
        <Heart className="mx-auto h-[18px] w-[18px] text-rose" />

        <h1
          ref={titleRef}
          className="mx-auto mt-5 max-w-[300px] font-serif text-[34px] leading-[1.08] font-semibold text-balance text-ink sm:max-w-[320px] sm:text-[40px]"
        >
          {texts.welcome.question}
        </h1>

        <div className="mt-9 flex items-center justify-center gap-3">
          <motion.button
            ref={yesRef}
            layout="position"
            type="button"
            className="btn btn-primary min-w-[120px]"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={tapSpring}
            disabled={leaving}
            onClick={() => leave(onYes)}
          >
            {texts.welcome.yes}
          </motion.button>

          <MovingNoButton
            label={texts.welcome.no}
            avoidRefs={avoidRefs}
            onAttempt={handleAttempt}
            hidden={leaving}
          />
        </div>

        <AnimatePresence>
          {showSoftDecline && !leaving && (
            <motion.button
              ref={declineRef}
              type="button"
              className="absolute top-full left-1/2 mt-5 -translate-x-1/2 cursor-pointer rounded-full px-3 py-2 text-[13px] font-medium whitespace-nowrap text-ink-soft/80 underline decoration-rose/50 underline-offset-4 transition-colors hover:text-ink"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={() => leave(onDecline)}
            >
              {texts.welcome.softDecline}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
