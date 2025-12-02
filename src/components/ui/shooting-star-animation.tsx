"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface ShootingStarAnimationProps {
  isVisible: boolean;
  onAnimationEnd: () => void;
}

export default function ShootingStarAnimation({ isVisible, onAnimationEnd }: ShootingStarAnimationProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      const newStars = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 50,
        delay: Math.random() * 1500,
        duration: 1000 + Math.random() * 1000,
      }));

      setStars(newStars);

      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setStars([]);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-shooting-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}ms`,
            animationDuration: `${star.duration}ms`,
          }}
        >
          <Star
            className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-lg"
          />
        </div>
      ))}
    </div>
  );
}
