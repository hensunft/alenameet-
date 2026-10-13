import { motion } from "motion/react";
import { Petal } from "./Florals";
import { Heart } from "./Heart";

/** Несколько едва заметных сердечек и лепестков по краям — статично, без бесконечных анимаций. */
const DECOR = [
  { kind: "heart", top: "9%", left: "9%", size: 14, rotate: -14, opacity: 0.45 },
  { kind: "petal", top: "15%", left: "85%", size: 13, rotate: 34, opacity: 0.55 },
  { kind: "heart", top: "47%", left: "4%", size: 8, rotate: 8, opacity: 0.3 },
  { kind: "petal", top: "81%", left: "11%", size: 12, rotate: -48, opacity: 0.5 },
  { kind: "heart", top: "74%", left: "88%", size: 15, rotate: -10, opacity: 0.4 },
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
      {DECOR.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-rose"
          style={{ top: item.top, left: item.left, rotate: item.rotate }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: item.opacity, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.08, ease: "easeOut" }}
        >
          {item.kind === "heart" ? (
            <Heart style={{ width: item.size, height: item.size }} />
          ) : (
            <Petal style={{ width: item.size, height: item.size * 1.2 }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}
