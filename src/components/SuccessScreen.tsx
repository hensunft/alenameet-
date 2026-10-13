import { motion, useReducedMotion } from "motion/react";
import { texts } from "../config/invitation";
import { easeOut } from "../lib/motion";
import { Heart } from "./Heart";
import { Hearted } from "./Hearted";

export function SuccessScreen() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.main
      className="screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6 } }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center text-center" role="status">
        <motion.div
          className="relative text-rose-deep"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.3, y: 10 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: [0.3, 1.12, 0.96, 1], y: 0 }
          }
          transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}
        >
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgb(239 165 190 / 0.45) 0%, transparent 70%)" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 2.4, 2.8] }}
            transition={{ duration: 1.4, delay: 0.45, ease: "easeOut" }}
          />
          <Heart className="relative h-12 w-12 drop-shadow-[0_8px_16px_rgba(217,107,150,0.35)]" />
        </motion.div>

        <motion.h1
          className="mt-7 font-serif text-[46px] leading-none font-semibold text-ink sm:text-[54px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: easeOut }}
        >
          <Hearted text={texts.success.message} size="0.6em" className="ml-1" />
        </motion.h1>
      </div>
    </motion.main>
  );
}
