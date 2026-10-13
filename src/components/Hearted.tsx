import { Fragment } from "react";
import { HEART_PATH } from "./Heart";

/**
 * Заменяет символ ♡ в тексте на аккуратное SVG-сердечко:
 * в выбранных шрифтах этого символа нет, и браузер подставил бы случайный системный.
 */
interface HeartedProps {
  text: string;
  /** Размер сердечка относительно текста */
  size?: string;
  className?: string;
}

export function Hearted({ text, size = "0.72em", className = "" }: HeartedProps) {
  const parts = text.split("♡");

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <svg
              viewBox="0 0 64 64"
              role="img"
              aria-label="♡"
              className={`inline-block align-[-0.04em] text-rose-deep ${className}`}
              style={{ width: size, height: size }}
            >
              <path d={HEART_PATH} fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinejoin="round" />
            </svg>
          )}
        </Fragment>
      ))}
    </>
  );
}
