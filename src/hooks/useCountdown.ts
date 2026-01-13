import { useState, useEffect } from 'react';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

/**
 * Hook to countdown to midnight EST
 */
export function useCountdown() {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();

      // Get current time in EST (UTC-5)
      const estOffset = -5 * 60; // EST is UTC-5
      const estTime = new Date(now.getTime() + (estOffset * 60 * 1000));

      // Get midnight EST today
      const midnightEST = new Date(estTime);
      midnightEST.setHours(24, 0, 0, 0);

      // Calculate difference
      const difference = midnightEST.getTime() - estTime.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          hours,
          minutes,
          seconds,
          total: difference,
        });
      } else {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const { hours, minutes } = timeLeft;
    return `${hours}h ${minutes}m`;
  };

  return {
    ...timeLeft,
    formatTime,
  };
}
