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
    // isVisible이 false에서 true로 바뀔 때만 애니메이션 실행
    if (isVisible && !prevIsVisibleRef.current) {
      // 여러 개의 하트를 랜덤한 위치에 생성
      const newHearts = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // 화면 너비의 0-100%
        y: Math.random() * 100, // 화면 높이의 0-100%
        delay: Math.random() * 1000, // 0-1000ms 지연
      }));

      setHearts(newHearts);

      // 애니메이션 완료 후 콜백 호출
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 2000);

      return () => clearTimeout(timer);
    }

    // 현재 상태를 이전 상태로 저장
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
