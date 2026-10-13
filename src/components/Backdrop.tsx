import { motion } from "motion/react";
import { FloralSprig, Petal } from "./Florals";
import { Heart } from "./Heart";
import { Cloud, Skydiver } from "./Sky";

/**
 * Фон: мягкие градиенты, две бледные веточки любимых цветов по углам,
 * пара парашютистов и облаков, несколько сердечек и лепестков.
 * Всё лежит под карточками; движение — только одно плавное появление, без бесконечных циклов.
 */

const SMALL_DECOR = [
  { kind: "heart", top: "21%", left: "7%", size: 12, rotate: -14, opacity: 0.45 },
  { kind: "petal", top: "17%", left: "89%", size: 13, rotate: 34, opacity: 0.55 },
  { kind: "heart", top: "49%", left: "3%", size: 8, rotate: 8, opacity: 0.3 },
  { kind: "petal", top: "66%", left: "92%", size: 12, rotate: -48, opacity: 0.5 },
  { kind: "heart", top: "91%", left: "40%", size: 11, rotate: -10, opacity: 0.4 },
] as const;

const SKYDIVERS = [
  { top: "5%", left: "70%", width: "clamp(40px, 5vw, 56px)", rotate: 7, opacity: 0.85, delay: 0.4 },
  { top: "80%", left: "9%", width: "clamp(30px, 3.8vw, 44px)", rotate: -9, opacity: 0.7, delay: 0.9 },
] as const;

const CLOUDS = [
  { top: "11%", left: "40%", width: "clamp(64px, 8vw, 110px)", opacity: 0.95, drift: 10 },
  { top: "86%", left: "62%", width: "clamp(52px, 6vw, 90px)", opacity: 0.9, drift: -8 },
  { top: "42%", left: "84%", width: "clamp(48px, 5vw, 84px)", opacity: 0.8, drift: 6 },
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

      {/* Бледные веточки пиона, ранункулюса и роз, «выглядывающие» из углов */}
      <motion.div
        className="absolute"
        style={{ top: -44, left: -54, width: "clamp(160px, 22vw, 260px)", rotate: 180 }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 0.42, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
      >
        <FloralSprig className="h-auto w-full" />
      </motion.div>
      <motion.div
        className="absolute"
        style={{ bottom: -46, right: -56, width: "clamp(180px, 24vw, 290px)", rotate: -6 }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 0.42, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.35, ease: "easeOut" }}
      >
        <FloralSprig className="h-auto w-full" />
      </motion.div>

      {CLOUDS.map((cloud, index) => (
        <motion.div
          key={`cloud-${index}`}
          className="absolute"
          style={{ top: cloud.top, left: cloud.left, width: cloud.width }}
          initial={{ opacity: 0, x: -cloud.drift }}
          animate={{ opacity: cloud.opacity, x: 0 }}
          transition={{ duration: 2.4, delay: 0.2 + index * 0.15, ease: "easeOut" }}
        >
          <Cloud className="h-auto w-full" />
        </motion.div>
      ))}

      {/* Парашютисты один раз плавно снижаются и замирают */}
      {SKYDIVERS.map((diver, index) => (
        <motion.div
          key={`diver-${index}`}
          className="absolute"
          style={{ top: diver.top, left: diver.left, width: diver.width, transformOrigin: "50% 0%" }}
          initial={{ opacity: 0, y: -36, rotate: diver.rotate - 8 }}
          animate={{ opacity: diver.opacity, y: 0, rotate: [diver.rotate - 8, diver.rotate + 4, diver.rotate] }}
          transition={{
            opacity: { duration: 0.8, delay: diver.delay },
            y: { duration: 3.2, delay: diver.delay, ease: [0.22, 0.61, 0.36, 1] },
            rotate: { duration: 3.2, delay: diver.delay, ease: "easeInOut" },
          }}
        >
          <Skydiver className="h-auto w-full" />
        </motion.div>
      ))}

      {SMALL_DECOR.map((item, index) => (
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
