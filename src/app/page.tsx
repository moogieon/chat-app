"use client";

import { useState, useEffect } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [canComplete, setCanComplete] = useState(false);

  useEffect(() => {
    // 세션스토리지에서 랜딩 페이지 표시 여부 확인
    const hasSeenLanding = sessionStorage.getItem('hasSeenLanding');

    if (hasSeenLanding === 'true') {
      setShowLanding(false);
    }

    setIsLoading(false);

    // 5초 후에 랜딩 페이지 완료 가능하도록 설정
    const timer = setTimeout(() => {
      setCanComplete(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleLandingComplete = () => {
    if (!canComplete) return; // 5초가 지나지 않았으면 무시

    // 10초 후에 세션스토리지에 표시 완료 상태 저장
    setTimeout(() => {
      sessionStorage.setItem('hasSeenLanding', 'true');
    }, 10000);
    setShowLanding(false);
  };



  return (
    <main className="flex h-screen w-full">
      {showLanding ? (
        <LandingPage onComplete={handleLandingComplete} canComplete={canComplete} />
      ) : (
        <ChatLayout />
      )}
    </main>
  );
}
