import { motion, useReducedMotion } from "motion/react";
import { texts } from "../config/invitation";
import { easeOut } from "../lib/motion";
import { Heart } from "./Heart";
import { Hearted } from "./Hearted";
import { Canopy } from "./Sky";

/** Время спуска сердечка на парашюте */
const DESCENT = 1.7;

export function SuccessScreen() {
  const reduceMotion = useReducedMotion();
  const textDelay = reduceMotion ? 0.2 : 1.15;

  return (
    <motion.main
      className="screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6 } }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center text-center" role="status">
        {/* Сердечко плавно спускается на парашюте и «приземляется» */}
        <motion.div
          className="relative text-rose-deep"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -170, rotate: -7 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate: [-7, 5, -3, 1, 0] }}
          transition={{
            opacity: { duration: 0.4 },
            y: { duration: DESCENT, ease: [0.22, 0.61, 0.36, 1] },
            rotate: { duration: DESCENT, ease: "easeInOut" },
          }}
          style={{ transformOrigin: "50% 0%" }}
        >
          {!reduceMotion && (
            <motion.div
              className="absolute bottom-[38px] left-1/2 h-[76px] w-[92px] -translate-x-1/2"
              style={{ transformOrigin: "50% 100%" }}
              initial={{ opacity: 1, scaleY: 1 }}
              animate={{ opacity: 0, scaleY: 0.35, y: 18 }}
              transition={{ delay: DESCENT - 0.05, duration: 0.6, ease: "easeIn" }}
            >
              <Canopy />
            </motion.div>
          )}

          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgb(239 165 190 / 0.45) 0%, transparent 70%)" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 2.4, 2.8] }}
            transition={{ duration: 1.4, delay: reduceMotion ? 0.2 : DESCENT - 0.1, ease: "easeOut" }}
          />
          <motion.div
            initial={false}
            animate={reduceMotion ? undefined : { scale: [1, 1, 1.1, 0.95, 1] }}
            transition={{ duration: DESCENT + 0.5, times: [0, 0.74, 0.82, 0.92, 1] }}
          >
            <Heart className="relative h-12 w-12 drop-shadow-[0_8px_16px_rgba(217,107,150,0.35)]" />
          </motion.div>
        </motion.div>

        <motion.h1
          className="mt-7 font-serif text-[46px] leading-none font-semibold text-ink sm:text-[54px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: textDelay, ease: easeOut }}
        >
          <Hearted text={texts.success.message} size="0.6em" className="ml-1" />
        </motion.h1>

        <motion.p
          className="mt-5 max-w-[290px] text-[15px] leading-relaxed text-balance text-ink-soft sm:text-base"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: textDelay + 0.45, ease: easeOut }}
        >
          {texts.success.joke}
        </motion.p>
      </div>
    </motion.main>
  );
}
