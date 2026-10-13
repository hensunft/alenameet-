/**
 * Расчёт новой позиции для убегающей кнопки «Нет».
 * Чистые функции без React — проще проверять и переиспользовать.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const EDGE_MARGIN = 12;
const AVOID_PADDING = 14;

let probe: HTMLDivElement | null = null;

/** Читает env(safe-area-inset-*) через невидимый элемент. */
export function readSafeAreaInsets(): Insets {
  if (typeof document === "undefined") return { top: 0, right: 0, bottom: 0, left: 0 };

  if (!probe) {
    probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
      "padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);";
    document.body.appendChild(probe);
  }

  const style = getComputedStyle(probe);
  return {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0,
  };
}

/** Видимая область экрана без системных отступов (вырез, home indicator). */
export function getViewportBounds(size: Size): Bounds {
  const insets = readSafeAreaInsets();
  const width = document.documentElement.clientWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;

  const minX = insets.left + EDGE_MARGIN;
  const minY = insets.top + EDGE_MARGIN;
  const maxX = Math.max(minX, width - insets.right - EDGE_MARGIN - size.width);
  const maxY = Math.max(minY, height - insets.bottom - EDGE_MARGIN - size.height);

  return { minX, maxX, minY, maxY };
}

export function clampToBounds(point: Point, bounds: Bounds): Point {
  return {
    x: Math.min(Math.max(point.x, bounds.minX), bounds.maxX),
    y: Math.min(Math.max(point.y, bounds.minY), bounds.maxY),
  };
}

function intersects(a: Rect, b: Rect, padding: number): boolean {
  return (
    a.x < b.x + b.width + padding &&
    a.x + a.width + padding > b.x &&
    a.y < b.y + b.height + padding &&
    a.y + a.height + padding > b.y
  );
}

function center(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

interface PickOptions {
  size: Size;
  bounds: Bounds;
  current: Rect;
  /** Области, которые кнопка не должна перекрывать (заголовок, кнопка «Да» и т. п.) */
  avoid: Rect[];
  /** Где сейчас палец или курсор */
  pointer?: Point;
  random?: () => number;
}

/**
 * Подбирает случайную позицию: в пределах безопасной области,
 * без перекрытия важных элементов и заметно в стороне от текущего места.
 */
export function pickEvadePosition({
  size,
  bounds,
  current,
  avoid,
  pointer,
  random = Math.random,
}: PickOptions): Point {
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  const minJump = Math.min(160, Math.max(80, Math.hypot(spanX, spanY) / 4));
  const from = center(current);
  const danger = pointer ?? from;

  let best: { point: Point; score: number } | null = null;

  for (let i = 0; i < 80; i += 1) {
    const point = { x: bounds.minX + random() * spanX, y: bounds.minY + random() * spanY };
    const rect: Rect = { ...point, ...size };
    const overlaps = avoid.filter((zone) => intersects(rect, zone, AVOID_PADDING)).length;
    const jump = distance(center(rect), from);
    const escape = distance(center(rect), danger);

    if (overlaps === 0 && jump >= minJump && escape >= minJump * 0.8) {
      return point;
    }

    // Запасной вариант: меньше перекрытий, дальше от пальца.
    const score = -overlaps * 10_000 + Math.min(jump, escape);
    if (!best || score > best.score) best = { point, score };
  }

  return best ? best.point : { x: bounds.minX, y: bounds.minY };
}
