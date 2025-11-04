"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Moon,
  Sun,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import HeartAnimation from "@/components/ui/heart-animation";
import ShootingStarAnimation from "@/components/ui/shooting-star-animation";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import Image from "next/image";
import { sendChatMessage, ChatError, ImageItem, VideoItem, ChatResponseContent } from "@/lib/api";

type MessageType = "text" | "image" | "video";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isCopied?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  type?: MessageType;
  image?: ImageItem;
  video?: VideoItem;
}

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `안녕하세요! 하카봇입니다!💨
⭐️저는 25년 1월 기준 정보를 바탕으로 답변합니다⭐️

• 하카 코리아 제품 안내(시그니처, 하카B, 하카Q, 하카H, 하카R)
• 구매처 안내(직영점, 판매점, 온라인)
• 기타 응대(보상판매, 주문 관련(상태, 반품, 취소 등), 재입고, 신제품, 홈페이지, 정품등록, 프로모션 등)

무엇을 도와드릴까요 ? `,
      role: "assistant",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showShootingStarAnimation, setShowShootingStarAnimation] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  // 다크모드 토글
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const sendMessageToAPI = useCallback(async (userInput: string): Promise<ChatResponseContent> => {
    try {
      const session_id = localStorage.getItem("session_id");
      const data = await sendChatMessage({
        session_id: session_id || "default-session", // 필요에 따라 동적 세션 ID 사용
        question: userInput,
      });

      return data.response || { text: '죄송합니다. 응답을 받지 못했습니다.' };
    } catch (error) {
      console.error('API 호출 오류:', error);

      // 구체적인 오류 정보가 있는 경우
      if (error instanceof Error && 'error' in error && 'message' in error && 'contact' in error) {
        const chatError = error as Error & ChatError;
        return {
          text: `🚨 ${chatError.error}\n\n${chatError.message}\n\n📞 ${chatError.contact}`
        };
      }

      // 일반적인 네트워크 오류
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          text: `🚨 네트워크 연결 오류\n\n인터넷 연결을 확인하고 다시 시도해주세요.\n\n📞 연결 문제가 지속되면 고객센터(1588-0000)로 문의해주세요.`
        };
      }

      // 기타 오류
      return {
        text: `🚨 시스템 오류\n\n일시적인 시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n\n📞 문제가 지속되면 고객센터(1588-0000)로 문의해주세요.`
      };
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // API 호출
    try {
      const aiResponse = await sendMessageToAPI(inputValue);
      setIsTyping(false);

      const newMessages: Message[] = [];
      const baseTimestamp = new Date();
      let messageIdCounter = Date.now() + 1;

      // 이미지 메시지들 추가 (먼저)
      if (aiResponse.images && aiResponse.images.length > 0) {
        aiResponse.images.forEach((image) => {
          newMessages.push({
            id: messageIdCounter.toString(),
            content: image.title || "",
            role: "assistant",
            timestamp: baseTimestamp,
            type: "image",
            image: image,
          });
          messageIdCounter++;
        });
      }

      // 비디오 메시지들 추가 (두 번째)
      if (aiResponse.videos && aiResponse.videos.length > 0) {
        aiResponse.videos.forEach((video) => {
          newMessages.push({
            id: messageIdCounter.toString(),
            content: video.title || "",
            role: "assistant",
            timestamp: baseTimestamp,
            type: "video",
            video: video,
          });
          messageIdCounter++;
        });
      }

      // 텍스트 메시지 추가 (마지막)
      if (aiResponse.text && aiResponse.text.trim()) {
        newMessages.push({
          id: messageIdCounter.toString(),
          content: aiResponse.text,
          role: "assistant",
          timestamp: baseTimestamp,
          type: "text",
        });
        messageIdCounter++;
      }

      setMessages((prev) => [...prev, ...newMessages]);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      setIsTyping(false);

      // 오류 메시지 생성
      let errorContent = '🚨 시스템 오류\n\n일시적인 시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n\n📞 문제가 지속되면 고객센터(1588-0000)로 문의해주세요.';

      if (error instanceof Error && 'error' in error && 'message' in error && 'contact' in error) {
        const chatError = error as Error & ChatError;
        errorContent = `🚨 ${chatError.error}\n\n${chatError.message}\n\n📞 ${chatError.contact}`;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorContent = `🚨 네트워크 연결 오류\n\n인터넷 연결을 확인하고 다시 시도해주세요.\n\n📞 연결 문제가 지속되면 고객센터(1588-0000)로 문의해주세요.`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        role: "assistant",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // AI 응답 완료 후 input에 포커스
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [inputValue, isLoading, sendMessageToAPI]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const copyMessage = useCallback(async (content: string, messageId: string) => {
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
  }, []);

  const toggleLike = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isLiked: !msg.isLiked }
          : msg
      )
    );
    // 하트 애니메이션 트리거
    setShowHeartAnimation(true);
  }, []);

  const toggleBookmark = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isBookmarked: !msg.isBookmarked }
          : msg
      )
    );
    // 별똥별 애니메이션 트리거
    setShowShootingStarAnimation(true);
  }, []);



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
              <span className="text-sm text-gray-500">
                단순 고객 응대 챗봇 ver0.1
              </span>
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
                  ref={inputRef}
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
