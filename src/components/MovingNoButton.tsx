import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  clampToBounds,
  getViewportBounds,
  pickEvadePosition,
  type Point,
  type Rect,
  type Size,
} from "../lib/evade";

interface MovingNoButtonProps {
  label: string;
  /** Элементы, которые кнопка не должна закрывать */
  avoidRefs: ReadonlyArray<RefObject<HTMLElement | null>>;
  /** Вызывается при каждой попытке нажать на кнопку */
  onAttempt: () => void;
  /** Плавно скрыть кнопку (например, когда уже нажали «Да») */
  hidden?: boolean;
}

interface FloatingState {
  from: Point;
  to: Point;
  size: Size;
}

const COOLDOWN_MS = 140;

function toRect(element: HTMLElement | null | undefined): Rect | null {
  if (!element) return null;
  const r = element.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

/**
 * Кнопка «Нет», которая уворачивается от курсора и пальца.
 * Сначала стоит на своём месте рядом с «Да», после первой попытки
 * переезжает в слой поверх страницы (portal + position: fixed),
 * чтобы трансформации родительских карточек не влияли на координаты.
 */
export function MovingNoButton({ label, avoidRefs, onAttempt, hidden = false }: MovingNoButtonProps) {
  const reduceMotion = useReducedMotion();
  const inlineRef = useRef<HTMLButtonElement>(null);
  const floatingRef = useRef<HTMLButtonElement>(null);
  const lastMoveAt = useRef(0);
  const shouldRestoreFocus = useRef(false);
  const [floating, setFloating] = useState<FloatingState | null>(null);

  const currentRect = useCallback((): Rect | null => {
    if (floating) {
      return toRect(floatingRef.current) ?? { ...floating.to, ...floating.size };
    }
    return toRect(inlineRef.current);
  }, [floating]);

  const evade = useCallback(
    (pointer?: Point) => {
      if (hidden) return;
      const now = performance.now();
      if (now - lastMoveAt.current < COOLDOWN_MS) return;

      const rect = currentRect();
      if (!rect) return;
      lastMoveAt.current = now;

      const size: Size = { width: rect.width, height: rect.height };
      const bounds = getViewportBounds(size);
      const avoid = avoidRefs.map((ref) => toRect(ref.current)).filter((r): r is Rect => r !== null);
      const to = pickEvadePosition({ size, bounds, current: rect, avoid, pointer });

      shouldRestoreFocus.current =
        document.activeElement === inlineRef.current || document.activeElement === floatingRef.current;

      setFloating((prev) => ({ from: prev ? prev.from : { x: rect.x, y: rect.y }, to, size }));
      onAttempt();
    },
    [avoidRefs, currentRect, hidden, onAttempt],
  );

  // Возвращаем фокус кнопке после перехода из потока страницы в «плавающий» слой.
  useEffect(() => {
    if (floating && shouldRestoreFocus.current) {
      floatingRef.current?.focus({ preventScroll: true });
    }
  }, [floating]);

  // При повороте экрана или изменении размера окна кнопка остаётся в видимой области.
  useEffect(() => {
    if (!floating) return;
    const keepInside = () => {
      setFloating((prev) => {
        if (!prev) return prev;
        const next = clampToBounds(prev.to, getViewportBounds(prev.size));
        return next.x === prev.to.x && next.y === prev.to.y ? prev : { ...prev, to: next };
      });
    };
    window.addEventListener("resize", keepInside);
    window.visualViewport?.addEventListener("resize", keepInside);
    return () => {
      window.removeEventListener("resize", keepInside);
      window.visualViewport?.removeEventListener("resize", keepInside);
    };
  }, [floating]);

  const handlers = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === "mouse") evade({ x: event.clientX, y: event.clientY });
    },
    onPointerDown: (event: PointerEvent) => {
      // Не даём касанию превратиться в клик и не переводим фокус.
      event.preventDefault();
      evade({ x: event.clientX, y: event.clientY });
    },
    onClick: (event: MouseEvent) => {
      // Клавиатура (Enter / пробел) или очень быстрый клик — тоже убегаем.
      event.preventDefault();
      evade();
    },
  };

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 24, mass: 0.9 };

  return (
    <>
      {!floating && (
        <motion.button
          ref={inlineRef}
          type="button"
          className="btn btn-secondary min-w-[120px]"
          initial={false}
          animate={{ opacity: hidden ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          {...handlers}
        >
          {label}
        </motion.button>
      )}

      {floating &&
        createPortal(
          <AnimatePresence>
            {!hidden && (
              <motion.button
                key="floating-no"
                ref={floatingRef}
                type="button"
                className="btn btn-secondary fixed top-0 left-0 z-50"
                style={{ width: floating.size.width, height: floating.size.height }}
                initial={{ x: floating.from.x, y: floating.from.y, opacity: 1 }}
                animate={{ x: floating.to.x, y: floating.to.y, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                transition={transition}
                {...handlers}
              >
                {label}
              </motion.button>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
