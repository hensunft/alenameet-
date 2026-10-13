import { useState } from "react";
import { motion } from "motion/react";
import { texts } from "../config/invitation";
import { screenMotionProps, tapSpring } from "../lib/motion";

interface TransitionScreenProps {
  onOpen: () => void;
}

export function TransitionScreen({ onOpen }: TransitionScreenProps) {
  const [pressed, setPressed] = useState(false);

  const handleOpen = () => {
    if (pressed) return;
    setPressed(true);
    onOpen();
  };

  return (
    <motion.main className="screen" {...screenMotionProps}>
      <div className="card card-frame px-7 pt-12 pb-10 text-center sm:px-10">
        <p className="mx-auto max-w-[290px] font-serif text-[32px] leading-[1.1] font-semibold text-balance text-ink sm:text-[36px]">
          {texts.transition.message}
        </p>

        <motion.button
          type="button"
          className="btn btn-primary mt-9 min-w-[160px]"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95 }}
          transition={tapSpring}
          disabled={pressed}
          onClick={handleOpen}
        >
          {texts.transition.button}
        </motion.button>
      </div>
    </motion.main>
  );
}
