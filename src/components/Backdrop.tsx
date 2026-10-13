import { motion } from "motion/react";
import { Heart } from "./Heart";

/** Несколько едва заметных сердечек по краям — статично, без бесконечных анимаций. */
const HEARTS = [
  { top: "9%", left: "9%", size: 14, rotate: -14, opacity: 0.45 },
  { top: "16%", left: "86%", size: 10, rotate: 12, opacity: 0.35 },
  { top: "47%", left: "4%", size: 8, rotate: 8, opacity: 0.3 },
  { top: "80%", left: "12%", size: 11, rotate: 16, opacity: 0.35 },
  { top: "74%", left: "88%", size: 15, rotate: -10, opacity: 0.4 },
] as const;

export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 15% 0%, rgb(252 231 239 / 0.95) 0%, transparent 70%)," +
            "radial-gradient(55% 40% at 100% 100%, rgb(252 231 239 / 0.85) 0%, transparent 70%)",
        }}
      />
      {HEARTS.map((heart, index) => (
        <motion.div
          key={index}
          className="absolute text-rose"
          style={{ top: heart.top, left: heart.left, rotate: heart.rotate }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: heart.opacity, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.08, ease: "easeOut" }}
        >
          <Heart style={{ width: heart.size, height: heart.size }} />
        </motion.div>
      ))}
    </div>
  );
}
