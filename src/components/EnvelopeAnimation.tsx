import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { texts } from "../config/invitation";
import { useViewportWidth } from "../hooks/useViewportWidth";
import { easeIn, easeInOut, easeOut } from "../lib/motion";
import { HEART_PATH, Heart } from "./Heart";
import { Hearted } from "./Hearted";

export type EnvelopePhase = "closed" | "opening" | "unfolding" | "open";

interface EnvelopeAnimationProps {
  phase: EnvelopePhase;
  onPhaseChange: (phase: EnvelopePhase) => void;
  /** Содержимое письма после того, как оно развернулось */
  children: ReactNode;
}

/** Пропорции конверта 3:2, размеры — от ширины экрана */
function getEnvelopeSize(viewportWidth: number) {
  const maxWidth = viewportWidth >= 640 ? 360 : 320;
  const width = Math.round(Math.min(maxWidth, Math.max(232, viewportWidth - 72)));
  return { width, height: Math.round((width * 2) / 3) };
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Конверт из нескольких слоёв, которые двигаются как одно целое:
 *   задняя стенка (z 0) → клапан после открытия (z 5) → письмо (z 20)
 *   → карман-передняя часть (z 30) → закрытый клапан (z 40).
 * Слои — соседи, поэтому письмо может находиться «внутри» конверта:
 * перед задней стенкой, но за карманом.
 */
export function EnvelopeAnimation({ phase, onPhaseChange, children }: EnvelopeAnimationProps) {
  const reduceMotion = useReducedMotion();
  const viewportWidth = useViewportWidth();
  const [size] = useState(() => getEnvelopeSize(viewportWidth));
  const { width: W, height: H } = phase === "closed" ? getEnvelopeSize(viewportWidth) : size;
  const ids = useId().replace(/:/g, "");

  // Общие трансформации конверта и письма
  const swayRotate = useMotionValue(0);
  const swayY = useMotionValue(0);
  const scale = useMotionValue(1);
  // Только для конверта: уход вниз и исчезновение
  const dropY = useMotionValue(0);
  const envelopeOpacity = useMotionValue(1);
  const envelopeY = useTransform(() => swayY.get() + dropY.get());
  // Клапан и письмо
  const flapRotate = useMotionValue(0);
  const flapShade = useTransform(flapRotate, [0, 90], [0, 0.18]);
  const sealOpacity = useTransform(flapRotate, [0, 70, 100], [1, 1, 0]);
  const letterY = useMotionValue(0);
  const previewOpacity = useMotionValue(1);

  const [flapBehind, setFlapBehind] = useState(false);
  useMotionValueEvent(flapRotate, "change", (value) => setFlapBehind(value > 90));

  const controls = useRef<AnimationPlaybackControls[]>([]);
  const run = (control: AnimationPlaybackControls) => {
    controls.current.push(control);
    return control;
  };

  // Лёгкое покачивание закрытого конверта
  useEffect(() => {
    if (phase !== "closed" || reduceMotion) return;
    const rotation = animate(swayRotate, [-1.1, 1.1], {
      duration: 2.6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    });
    const float = animate(swayY, [0, -5], {
      duration: 1.9,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => {
      rotation.stop();
      float.stop();
    };
  }, [phase, reduceMotion, swayRotate, swayY]);

  // Останавливаем все анимации при размонтировании
  useEffect(() => {
    const list = controls.current;
    return () => list.forEach((control) => control.stop());
  }, []);

  const open = async () => {
    if (phase !== "closed") return;
    onPhaseChange("opening");

    if (reduceMotion) {
      run(animate(flapRotate, 180, { duration: 0 }));
      run(animate(envelopeOpacity, 0, { duration: 0.3 }));
      run(animate(previewOpacity, 0, { duration: 0.2 }));
      await wait(300);
      onPhaseChange("unfolding");
      await wait(50);
      onPhaseChange("open");
      return;
    }

    const rise = H * 0.66;
    const shift = H * 0.28; // опускаем композицию, чтобы она оставалась по центру

    // 1. Конверт выравнивается и чуть увеличивается
    run(animate(swayRotate, 0, { duration: 0.35, ease: easeOut }));
    run(animate(swayY, shift, { duration: 0.8, ease: easeInOut }));
    run(animate(scale, 1.06, { duration: 0.4, ease: easeOut }));

    // 2. Клапан открывается
    run(animate(flapRotate, 180, { duration: 0.65, delay: 0.15, ease: [0.5, 0, 0.3, 1] }));

    // 3. Письмо выезжает из конверта
    await run(animate(letterY, -rise, { duration: 0.8, delay: 0.65, ease: [0.3, 0, 0.2, 1] }));

    // 4. Конверт уходит вниз, письмо остаётся в воздухе
    run(animate(dropY, H * 0.45, { duration: 0.55, ease: easeIn }));
    run(animate(envelopeOpacity, 0, { duration: 0.45, ease: "easeIn" }));
    run(animate(swayY, 0, { duration: 0.55, ease: easeInOut }));
    run(animate(scale, 1, { duration: 0.55, ease: easeInOut }));
    run(animate(previewOpacity, 0, { duration: 0.3, delay: 0.15 }));
    await wait(560);

    // 5. Письмо разворачивается в карточку приглашения
    onPhaseChange("unfolding");
    run(animate(letterY, 0, { duration: 0.7, ease: easeOut }));
    // Содержимое начинает проявляться, пока карточка ещё «досаживается»
    await wait(380);
    onPhaseChange("open");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void open();
    }
  };

  const isCard = phase === "unfolding" || phase === "open";
  const shared = { rotate: swayRotate, scale };
  const radius = Math.round(W * 0.045);

  return (
    <div
      className={isCard ? "relative flex w-full justify-center" : "relative shrink-0"}
      style={isCard ? undefined : { width: W, height: H }}
      {...(phase === "closed"
        ? {
            role: "button",
            tabIndex: 0,
            "aria-label": texts.envelope.ariaLabel,
            onClick: () => void open(),
            onKeyDown,
          }
        : {})}
    >
      {!isCard && (
        <>
          {/* Мягкая тень под конвертом */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ ...shared, y: envelopeY, opacity: envelopeOpacity, zIndex: 0 }}
          >
            <div
              className="absolute left-[6%] right-[6%] -bottom-6 h-10 rounded-[50%] blur-xl"
              style={{ background: "rgb(217 107 150 / 0.28)" }}
            />
          </motion.div>

          {/* Задняя стенка — видна внутри после открытия */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ ...shared, y: envelopeY, opacity: envelopeOpacity, zIndex: 1 }}
          >
            <div
              className="absolute inset-0"
              style={{
                borderRadius: radius,
                background: "linear-gradient(180deg, #F3CDDA 0%, #F8DFE8 38%, #FBE9EF 100%)",
                boxShadow:
                  "0 1px 2px rgb(73 53 61 / 0.06), 0 18px 36px -18px rgb(217 107 150 / 0.45)",
              }}
            />
          </motion.div>

          {/* Клапан */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              ...shared,
              y: envelopeY,
              opacity: envelopeOpacity,
              zIndex: flapBehind ? 5 : 40,
              perspective: W * 2.6,
              perspectiveOrigin: "50% 0%",
            }}
          >
            <motion.div
              className="preserve-3d absolute top-0 left-0 w-full"
              style={{ height: H * 0.6, rotateX: flapRotate, transformOrigin: "50% 0%" }}
            >
              {/* Лицевая сторона клапана */}
              <div className="backface-hidden absolute inset-0">
                <svg viewBox="0 0 300 120" className="block h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id={`${ids}-flap`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#FFFDFB" />
                      <stop offset="1" stopColor="#FFF3EE" />
                    </linearGradient>
                    <linearGradient id={`${ids}-seal`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#F4B9CC" />
                      <stop offset="1" stopColor="#D96B96" />
                    </linearGradient>
                    <filter id={`${ids}-flap-shadow`} x="-10%" y="-10%" width="120%" height="140%">
                      <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#C2577F" floodOpacity="0.16" />
                    </filter>
                  </defs>
                  <path
                    d={`M${radius * 0.3} 0 H${300 - radius * 0.3} L164 104 Q150 115 136 104 Z`}
                    fill={`url(#${ids}-flap)`}
                    stroke="#F0CFDB"
                    strokeWidth="0.8"
                    filter={`url(#${ids}-flap-shadow)`}
                  />
                  {/* Печать с сердечком */}
                  <motion.g style={{ opacity: sealOpacity }}>
                    <circle cx="150" cy="96" r="17" fill={`url(#${ids}-seal)`} />
                    <circle cx="150" cy="96" r="13.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.8" />
                    <path d={HEART_PATH} fill="#FFFFFF" transform="translate(141.2 87.6) scale(0.275)" />
                  </motion.g>
                </svg>
                <motion.div
                  className="absolute inset-0"
                  style={{
                    opacity: flapShade,
                    background: "linear-gradient(180deg, transparent, rgb(150 70 100 / 0.5))",
                    clipPath: "polygon(0 0, 100% 0, 54.7% 88%, 45.3% 88%)",
                  }}
                />
              </div>

              {/* Внутренняя сторона клапана */}
              <div className="backface-hidden absolute inset-0" style={{ transform: "rotateY(180deg)" }}>
                <svg viewBox="0 0 300 120" className="block h-full w-full">
                  <defs>
                    <linearGradient id={`${ids}-flap-inner`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#F7D9E4" />
                      <stop offset="1" stopColor="#FCEBF1" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M${radius * 0.3} 0 H${300 - radius * 0.3} L164 104 Q150 115 136 104 Z`}
                    fill={`url(#${ids}-flap-inner)`}
                    stroke="#F0CFDB"
                    strokeWidth="0.8"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}

      {/* Письмо: внутри конверта, затем — карточка приглашения */}
      <motion.div
        className={isCard ? "relative w-full max-w-[400px]" : "absolute inset-0"}
        style={isCard ? { zIndex: 20 } : { ...shared, y: swayY, zIndex: 20 }}
      >
        <motion.div
          layout
          transition={{ layout: { duration: 0.7, ease: easeOut } }}
          className={
            isCard
              ? "card card-frame relative w-full overflow-hidden"
              : "absolute overflow-hidden bg-white"
          }
          style={{
            y: letterY,
            borderRadius: isCard ? 28 : Math.max(8, radius - 4),
            ...(isCard
              ? {}
              : {
                  left: W * 0.06,
                  top: H * 0.07,
                  width: W * 0.88,
                  height: H * 0.86,
                  boxShadow: "0 1px 2px rgb(73 53 61 / 0.08), 0 6px 16px -10px rgb(217 107 150 / 0.4)",
                  backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #FFFCFD 100%)",
                }),
          }}
        >
          {isCard ? (
            children
          ) : (
            <motion.div
              aria-hidden="true"
              className="flex h-full flex-col items-center pt-[9%]"
              style={{ opacity: previewOpacity }}
            >
              <span className="text-[9px] font-semibold tracking-[0.3em] text-rose-deep uppercase">
                <Hearted text={texts.invitation.eyebrow} />
              </span>
              <span className="mt-[6%] h-px w-[38%] bg-rose/40" />
              <span className="mt-[5%] h-px w-[52%] bg-rose/25" />
              <span className="mt-[5%] h-px w-[30%] bg-rose/25" />
              <Heart className="mt-[7%] h-2.5 w-2.5 text-rose/70" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {!isCard && (
        /* Карман — передняя часть конверта, закрывает нижнюю часть письма */
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ ...shared, y: envelopeY, opacity: envelopeOpacity, zIndex: 30 }}
        >
          <svg
            viewBox="0 0 300 200"
            className="absolute inset-0 block h-full w-full"
            style={{ clipPath: `inset(0 round ${radius}px)` }}
          >
            <defs>
              <linearGradient id={`${ids}-side-l`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#FFF6F1" />
                <stop offset="1" stopColor="#FFFBF8" />
              </linearGradient>
              <linearGradient id={`${ids}-side-r`} x1="1" y1="0" x2="0" y2="0">
                <stop offset="0" stopColor="#FFF6F1" />
                <stop offset="1" stopColor="#FFFBF8" />
              </linearGradient>
              <linearGradient id={`${ids}-bottom`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#FFF7F3" />
              </linearGradient>
              <filter id={`${ids}-bottom-shadow`} x="-10%" y="-20%" width="120%" height="140%">
                <feDropShadow dx="0" dy="-1.5" stdDeviation="2.5" floodColor="#C2577F" floodOpacity="0.12" />
              </filter>
            </defs>
            <path d="M0 0 L152 106 L0 200 Z" fill={`url(#${ids}-side-l)`} />
            <path d="M300 0 L148 106 L300 200 Z" fill={`url(#${ids}-side-r)`} />
            <path
              d="M0 200 L138 99 Q150 91 162 99 L300 200 Z"
              fill={`url(#${ids}-bottom)`}
              stroke="#F2D4DF"
              strokeWidth="0.8"
              filter={`url(#${ids}-bottom-shadow)`}
            />
          </svg>
          <div
            className="absolute inset-x-0 flex flex-col items-center"
            style={{ top: "64%" }}
          >
            <span
              className="font-serif font-medium text-ink/85 italic"
              style={{ fontSize: Math.round(W * 0.085), lineHeight: 1 }}
            >
              {texts.envelope.addressee}
            </span>
            <span className="mt-2 h-px bg-rose/45" style={{ width: W * 0.2 }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
