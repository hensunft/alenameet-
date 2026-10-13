import type { Transition, Variants } from "motion/react";

/** Мягкое «дорогое» замедление в конце движения */
export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeInOut = [0.65, 0, 0.35, 1] as const;
export const easeIn = [0.4, 0, 1, 1] as const;

export const screenVariants: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: easeOut } },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.32, ease: easeIn } },
};

export const screenMotionProps = {
  variants: screenVariants,
  initial: "initial",
  animate: "animate",
  exit: "exit",
} as const;

export const tapSpring: Transition = { type: "spring", stiffness: 500, damping: 30 };
