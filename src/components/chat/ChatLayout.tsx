"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  ShoppingCart,
  Moon,
  Sun,
  ChevronDown,
  Sparkles,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import HeartAnimation from "@/components/ui/heart-animation";
import ShootingStarAnimation from "@/components/ui/shooting-star-animation";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isCopied?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "안녕하세요! 하카봇입니다!💨\n\n•  다양한 전자담배 제품 추천\n• 액상, 기기, 액세서리 정보 제공\n• 구매 상담 및 문의사항 답변\n• 신제품 및 할인 정보 안내\n\n무엇을 도와드릴까요?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showShootingStarAnimation, setShowShootingStarAnimation] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setShowScrollButton(!isAtBottom);
      }
    };

    const scrollElement = scrollAreaRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      // 초기 상태 확인
      handleScroll();
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [messages]); // messages가 변경될 때마다 다시 설정

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  // 다크모드 토글
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // API 호출
    try {
      const aiResponse = await sendMessageToAPI(inputValue);
      setIsTyping(false);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 일시적인 오류가 발생했습니다.',
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageToAPI = async (userInput: string): Promise<string> => {
    try {
      const requestBody = {
        session_id: "chat_session_" + Date.now(),
        question: userInput,
        use_rerank_on_unknown: true,
        top_k_first: 8,
        top_k_rerank1: 5,
        top_k_rerank2: 3,
        temperature: 0
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();
      return data.answer || '죄송합니다. 응답을 받지 못했습니다.';
    } catch (error) {
      console.error('API 호출 오류:', error);
      return '죄송합니다. 일시적인 오류가 발생했습니다.';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, isCopied: true }
            : msg
        )
      );
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, isCopied: false }
              : msg
          )
        );
      }, 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const toggleLike = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isLiked: !msg.isLiked }
          : msg
      )
    );
    // 하트 애니메이션 트리거
    setShowHeartAnimation(true);
  };

  const toggleBookmark = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isBookmarked: !msg.isBookmarked }
          : msg
      )
    );
    // 별똥별 애니메이션 트리거
    setShowShootingStarAnimation(true);
  };



  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <HeartAnimation
        key={`heart-${Date.now()}`}
        isVisible={showHeartAnimation}
        onAnimationEnd={() => setShowHeartAnimation(false)}
      />
      <ShootingStarAnimation
        key={`shooting-star-${Date.now()}`}
        isVisible={showShootingStarAnimation}
        onAnimationEnd={() => setShowShootingStarAnimation(false)}
      />
      {/* 헤더 */}
      <Card className="rounded-none border-b-0 shadow-sm flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image src="/mainLogo.png" alt="로고" width={100} height={40} />
                <Sparkles className="h-3 w-3 text-[#00ACA3] absolute -top-1 -right-1" />
              </div>

            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-10 w-10"
                title="다크모드 토글"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 메시지 영역 */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="h-full px-[5%] py-4 overflow-y-auto"
          ref={scrollAreaRef}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#00ACA3 #f3f4f6' }}
        >
          <div className="mx-auto max-w-6xl space-y-6 pb-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onLike={toggleLike}
                onBookmark={toggleBookmark}
                onCopy={copyMessage}
              />
            ))}

            {/* 타이핑 인디케이터 */}
            {isTyping && <TypingIndicator />}
          </div>
        </div>

        {/* 스크롤 버튼 */}
        <Button
          onClick={scrollToBottom}
          className={`fixed bottom-[20%] right-4 h-10 w-10 rounded-full bg-[#00ACA3] hover:bg-[#00ACA3]/90 shadow-lg z-50 transition-opacity duration-200 ${showScrollButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          size="icon"
        >
          <ChevronDown className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* 입력 영역 */}
      <Card className="rounded-none border-t-0 shadow-sm flex-shrink-0">
        <CardContent className="py-2 px-[5%]">
          <div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="전자담배 관련 질문을 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                  className="min-h-[44px] max-h-32 resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-[44px] px-4 bg-gradient-to-r from-[#00ACA3] to-[#00ACA3]/90 hover:from-[#00ACA3]/90 hover:to-[#00ACA3] flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{inputValue.length}/1000</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
