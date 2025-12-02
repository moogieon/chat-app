"use client";

import { useEffect, useState, useRef } from "react";
import { Heart } from "lucide-react";

interface HeartAnimationProps {
  isVisible: boolean;
  onAnimationEnd: () => void;
}

export default function HeartAnimation({ isVisible, onAnimationEnd }: HeartAnimationProps) {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const prevIsVisibleRef = useRef(false);

  useEffect(() => {
    if (isVisible && !prevIsVisibleRef.current) {
      const newHearts = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1000,
      }));

      setHearts(newHearts);

      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 2000);

      return () => clearTimeout(timer);
    }

    prevIsVisibleRef.current = isVisible;
  }, [isVisible, onAnimationEnd]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-heart-float"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            animationDelay: `${heart.delay}ms`,
          }}
        >
          <Heart
            className="w-8 h-8 text-red-500 fill-red-500 animate-pulse"
          />
        </div>
      ))}
    </div>
  );
}
