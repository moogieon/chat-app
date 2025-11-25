"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

interface LandingPageProps {
  onComplete: () => void;
  canComplete?: boolean;
}

export default function LandingPage({ onComplete, canComplete = false }: LandingPageProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (canComplete && !isAnimating) {
      onComplete();
    }
  }, [canComplete, isAnimating, onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(20, 20, 20)"
      gradientBackgroundEnd="rgb(0, 0, 0)"
      firstColor="0, 172, 163"
      secondColor="221, 74, 255"
      thirdColor="100, 220, 255"
      fourthColor="255, 100, 100"
      fifthColor="255, 255, 100"
      pointerColor="140, 100, 255"
      size="60%"
      blendingValue="screen"
      interactive={true}
    >
      <div className="relative z-10 flex items-center justify-center h-screen p-8">
        <div className="text-center">
          <div className="relative inline-block p-4 mb-6">
            <Image
              src="/mainLogo.png"
              alt="Main Logo"
              width={120}
              height={120}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <Sparkles className="h-6 w-6 text-[#00ACA3] absolute -top-2 -right-2" />
          </div>

          {/* 로딩 인디케이터 */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#00ACA3] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#00ACA3] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-[#00ACA3] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
}
