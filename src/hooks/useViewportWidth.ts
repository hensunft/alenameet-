import { useEffect, useState } from "react";

function readWidth(): number {
  return typeof document === "undefined" ? 390 : document.documentElement.clientWidth;
}

export function useViewportWidth(): number {
  const [width, setWidth] = useState(readWidth);

  useEffect(() => {
    const update = () => setWidth(readWidth());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return width;
}
