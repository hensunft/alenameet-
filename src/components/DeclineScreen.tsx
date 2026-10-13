import { motion } from "motion/react";
import { texts } from "../config/invitation";
import { screenMotionProps } from "../lib/motion";

export function DeclineScreen() {
  return (
    <motion.main className="screen" {...screenMotionProps}>
      <div className="card card-frame px-8 py-12 text-center">
        <p className="mx-auto max-w-[280px] font-serif text-[28px] leading-[1.15] font-medium text-balance text-ink">
          {texts.decline.message}
        </p>
      </div>
    </motion.main>
  );
}
