import { useEffect, useState } from 'react';

/** Metni karakter karakter açar. cps = saniyedeki karakter. */
export function useTypewriter(text: string, cps = 45): string {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    const interval = window.setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          window.clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 1000 / cps);
    return () => window.clearInterval(interval);
  }, [text, cps]);

  return text.slice(0, count);
}
