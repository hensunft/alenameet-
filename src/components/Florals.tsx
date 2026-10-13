import { useId, type SVGProps } from "react";

/**
 * Небольшие ботанические иллюстрации в палитре сайта:
 * пион, ранункулюс и бутоны кустовой розы — любимые цветы Алёны.
 * Нарисованы простыми SVG-формами, без внешних картинок.
 */

const LEAF = "#C9D8C3";
const LEAF_STROKE = "#AFC3A8";
const STEM = "#B9CBB2";
const PETAL_STROKE = "#EDB9CA";

function petal(length: number, width: number) {
  const w = width / 2;
  const L = length;
  // Лепесток с чуть волнистым краем — как у пиона
  return (
    `M0 0 C ${-w} ${-L * 0.2} ${-w * 1.1} ${-L * 0.84} ${-w * 0.46} ${-L} ` +
    `Q ${-w * 0.2} ${-L * 0.9} 0 ${-L * 0.97} Q ${w * 0.22} ${-L * 1.03} ${w * 0.46} ${-L} ` +
    `C ${w * 1.1} ${-L * 0.84} ${w} ${-L * 0.2} 0 0 Z`
  );
}

interface FlowerProps {
  x: number;
  y: number;
  r: number;
  rotate?: number;
  ids: string;
}

/** Пион: пышные ярусы волнистых лепестков, к центру — гуще и насыщеннее. */
function Peony({ x, y, r, rotate = 0, ids }: FlowerProps) {
  const rings = [
    { count: 8, length: r, width: r * 0.95, offset: 0, fill: `url(#${ids}-peony-outer)` },
    { count: 8, length: r * 0.76, width: r * 0.8, offset: 22, fill: `url(#${ids}-peony-mid)` },
    { count: 7, length: r * 0.52, width: r * 0.62, offset: 8, fill: "#F3BACD" },
    { count: 6, length: r * 0.32, width: r * 0.42, offset: 30, fill: "#EBA0BA" },
  ];

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      {rings.map((ring, ringIndex) =>
        Array.from({ length: ring.count }, (_, i) => (
          <path
            key={`${ringIndex}-${i}`}
            d={petal(ring.length, ring.width)}
            fill={ring.fill}
            stroke={PETAL_STROKE}
            strokeWidth={0.5}
            transform={`rotate(${(360 / ring.count) * i + ring.offset})`}
          />
        )),
      )}
      <circle r={r * 0.09} fill="#E58CAC" />
    </g>
  );
}

/** Ранункулюс: плотная розетка из множества маленьких чашевидных лепестков. */
function Ranunculus({ x, y, r, rotate = 0, ids }: FlowerProps) {
  const rings = [0, 1, 2, 3, 4];
  const fills = [`url(#${ids}-ranunculus)`, "#FFFFFF", "#FDF0F4", "#F9DCE6", "#F3C2D2"];

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <circle r={r} fill={`url(#${ids}-ranunculus)`} stroke="#F0C4D3" strokeWidth={0.6} />
      {rings.map((i) => {
        const count = 13 - i * 2;
        const dist = r * (0.66 - i * 0.13);
        const length = r * (0.36 - i * 0.045);
        const width = ((2 * Math.PI * Math.max(dist, r * 0.12)) / count) * 1.35;
        const w = width / 2;
        const d = `M${-w} 0 Q ${-w} ${-length} 0 ${-length} Q ${w} ${-length} ${w} 0 Q 0 ${length * 0.3} ${-w} 0 Z`;
        return Array.from({ length: count }, (_, j) => (
          <path
            key={`${i}-${j}`}
            d={d}
            fill={fills[i]}
            stroke="#EDB6C8"
            strokeWidth={0.45}
            transform={`rotate(${(360 / count) * j + i * 17}) translate(0 ${-dist})`}
          />
        ));
      })}
      <circle r={r * 0.09} fill="#EBA0BA" />
    </g>
  );
}

/** Бутон кустовой розы на коротком стебле. */
function RoseBud({ x, y, size, rotate = 0 }: { x: number; y: number; size: number; rotate?: number }) {
  const s = size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M0 ${s * 0.15} Q ${s * 0.1} ${s * 0.6} ${-s * 0.05} ${s * 1.1}`} stroke={STEM} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <path
        d={`M0 0 C ${-s * 0.42} ${-s * 0.12} ${-s * 0.42} ${-s * 0.7} 0 ${-s} C ${s * 0.42} ${-s * 0.7} ${s * 0.42} ${-s * 0.12} 0 0 Z`}
        fill="#F2B6CA"
        stroke="#E79AB5"
        strokeWidth={0.6}
      />
      <path d={`M${-s * 0.18} ${-s * 0.62} Q 0 ${-s * 0.42} ${s * 0.2} ${-s * 0.7}`} stroke="#E28FAD" strokeWidth={0.7} fill="none" strokeLinecap="round" />
      <path d={`M0 ${s * 0.08} Q ${-s * 0.42} ${-s * 0.12} ${-s * 0.2} ${-s * 0.52} Q ${-s * 0.12} ${-s * 0.14} 0 ${s * 0.08} Z`} fill={LEAF} stroke={LEAF_STROKE} strokeWidth={0.4} />
      <path d={`M0 ${s * 0.08} Q ${s * 0.42} ${-s * 0.12} ${s * 0.2} ${-s * 0.52} Q ${s * 0.12} ${-s * 0.14} 0 ${s * 0.08} Z`} fill={LEAF} stroke={LEAF_STROKE} strokeWidth={0.4} />
    </g>
  );
}

function Leaf({ x, y, size, rotate = 0 }: { x: number; y: number; size: number; rotate?: number }) {
  const s = size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M0 0 Q ${s * 0.38} ${-s * 0.5} 0 ${-s} Q ${-s * 0.38} ${-s * 0.5} 0 0 Z`} fill={LEAF} stroke={LEAF_STROKE} strokeWidth={0.5} />
      <path d={`M0 ${-s * 0.06} L0 ${-s * 0.86}`} stroke={LEAF_STROKE} strokeWidth={0.5} />
    </g>
  );
}

function Gradients({ ids }: { ids: string }) {
  return (
    <defs>
      <radialGradient id={`${ids}-peony-outer`} cx="50%" cy="50%" r="60%">
        <stop offset="0" stopColor="#F6CBD9" />
        <stop offset="1" stopColor="#FDEFF4" />
      </radialGradient>
      <radialGradient id={`${ids}-peony-mid`} cx="50%" cy="50%" r="60%">
        <stop offset="0" stopColor="#F2B5C9" />
        <stop offset="1" stopColor="#FADCE6" />
      </radialGradient>
      <radialGradient id={`${ids}-ranunculus`} cx="45%" cy="45%" r="60%">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#FBE6EE" />
      </radialGradient>
    </defs>
  );
}

/** Веточка из пиона, ранункулюса и бутонов роз. Пропорции 140 × 120. */
export function FloralSprig(props: SVGProps<SVGSVGElement>) {
  const ids = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 140 120" aria-hidden="true" focusable="false" {...props}>
      <Gradients ids={ids} />
      <path d="M58 64 Q 74 86 96 106" stroke={STEM} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <path d="M94 42 Q 98 70 104 100" stroke={STEM} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <Leaf x={80} y={88} size={22} rotate={-38} />
      <Leaf x={86} y={92} size={18} rotate={52} />
      <Leaf x={30} y={70} size={20} rotate={-112} />
      <Leaf x={64} y={30} size={18} rotate={14} />
      <RoseBud x={22} y={36} size={15} rotate={-48} />
      <RoseBud x={114} y={70} size={13} rotate={38} />
      <Ranunculus x={96} y={40} r={15} ids={ids} />
      <Peony x={54} y={60} r={27} rotate={8} ids={ids} />
    </svg>
  );
}

/** Отдельный цветок ранункулюса — маленькая иконка вместо сердечка. */
export function RanunculusIcon(props: SVGProps<SVGSVGElement>) {
  const ids = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <Gradients ids={ids} />
      <Leaf x={13} y={31} size={11} rotate={-118} />
      <Leaf x={27} y={31} size={11} rotate={118} />
      <Ranunculus x={20} y={19} r={12.5} ids={ids} />
    </svg>
  );
}

/** Опавший лепесток — для фона. */
export function Petal({ fill = "#F6CBD9", ...props }: SVGProps<SVGSVGElement> & { fill?: string }) {
  return (
    <svg viewBox="0 0 20 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M10 23 C 2 18 0 8 6 2 C 8 0 12 0 14 2 C 20 8 18 18 10 23 Z" fill={fill} />
      <path d="M10 21 Q 9 12 10 4" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={0.8} fill="none" />
    </svg>
  );
}
