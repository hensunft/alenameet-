import type { SVGProps } from "react";

/** Аккуратное сердечко, общее для всего сайта (цвет — через currentColor). */
export const HEART_PATH =
  "M32 56C30.6 56 29.3 55.5 28.3 54.6 18.2 45.6 6 35.4 6 22.8 6 14.6 12.3 8 20.2 8c4.8 0 9.1 2.5 11.8 6.3C34.7 10.5 39 8 43.8 8 51.7 8 58 14.6 58 22.8 58 35.4 45.8 45.6 35.7 54.6 34.7 55.5 33.4 56 32 56Z";

export function Heart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d={HEART_PATH} />
    </svg>
  );
}
