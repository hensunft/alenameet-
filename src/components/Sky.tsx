import type { SVGProps } from "react";

/**
 * Небесные мотивы — намёк на увлечение Алёны прыжками с парашютом:
 * купол, маленький парашютист и мягкие облака. Палитра та же, что у всего сайта.
 */

const CANOPY_PATH =
  "M6 38 C 6 12 26 4 50 4 C 74 4 94 12 94 38 Q 83 31 72 38 Q 61 31 50 38 Q 39 31 28 38 Q 17 31 6 38 Z";

function CanopyShape() {
  return (
    <>
      <path d={CANOPY_PATH} fill="#FFFFFF" />
      <path d="M28 38 Q 31 12 50 4 L 50 38 Q 39 31 28 38 Z" fill="#F7CFDC" />
      <path d="M72 38 Q 69 12 50 4 C 74 4 94 12 94 38 Q 83 31 72 38 Z" fill="#F7CFDC" />
      <g fill="none" stroke="#EAB3C6" strokeWidth={0.8} strokeLinejoin="round">
        <path d={CANOPY_PATH} />
        <path d="M28 38 Q 31 12 50 4 Q 69 12 72 38" />
        <path d="M50 4 L 50 38" />
      </g>
    </>
  );
}

/** Маленький купол в бело-розовых тонах со стропами — намёк на парашютный спорт. */
export function Canopy() {
  return (
    <svg viewBox="0 0 100 84" className="h-full w-full overflow-visible" aria-hidden="true">
      <g stroke="#DDA9BC" strokeWidth={0.7} strokeLinecap="round">
        <line x1={7} y1={38} x2={41} y2={83} />
        <line x1={28} y1={38} x2={46} y2={81} />
        <line x1={72} y1={38} x2={54} y2={81} />
        <line x1={93} y1={38} x2={59} y2={83} />
      </g>
      <CanopyShape />
    </svg>
  );
}

/** Маленький парашютист под бело-розовым куполом. Пропорции 100 × 124. */
export function Skydiver(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 124" aria-hidden="true" focusable="false" {...props}>
      <g stroke="#DDA9BC" strokeWidth={0.8} strokeLinecap="round">
        <line x1={7} y1={38} x2={47} y2={92} />
        <line x1={28} y1={38} x2={48} y2={91} />
        <line x1={72} y1={38} x2={52} y2={91} />
        <line x1={93} y1={38} x2={53} y2={92} />
      </g>
      <CanopyShape />
      <g fill="#E39AB5" stroke="#E39AB5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx={50} cy={97} r={4.2} stroke="none" />
        <rect x={45.6} y={101.5} width={8.8} height={12} rx={4} stroke="none" />
        <path d="M46.5 104 L 41 98 M53.5 104 L 59 98" strokeWidth={2.4} fill="none" />
        <path d="M47.5 112 L 45 121 M52.5 112 L 55 121" strokeWidth={2.6} fill="none" />
      </g>
    </svg>
  );
}

/** Мягкое облако. Пропорции 120 × 52. */
export function Cloud(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 52" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M16 46 C 4 46 2 30 14 28 C 14 16 30 12 38 20 C 42 6 66 4 72 18 C 80 10 98 14 96 28 C 112 26 118 46 102 46 Z"
        fill="#FFFFFF"
        stroke="#EDC3D2"
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
    </svg>
  );
}
