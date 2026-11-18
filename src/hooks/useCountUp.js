import { useEffect, useState } from 'react';

export default function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const end = Number(target) || 0;
    if (end === 0) return;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = end / steps;
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      frame += 1;
      current += increment;
      if (frame >= steps) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  // target 0 ho to seedha 0 dikhao (effect mein setState ki zaroorat nahi)
  return (Number(target) || 0) === 0 ? 0 : value;
}