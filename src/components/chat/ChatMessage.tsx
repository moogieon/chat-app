"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Copy, Check, Heart, Bookmark, Sparkles, Play } from "lucide-react";
import { useMemo } from "react";
import Image from "next/image";
import { ImageItem, VideoItem } from "@/lib/api";

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

interface ChatMessageProps {
  message: Message;
  onLike: (messageId: string) => void;
  onBookmark: (messageId: string) => void;
  onCopy: (content: string, messageId: string) => void;
}

// 링크를 감지하고 JSX 요소로 변환하는 함수
const parseLinks = (text: string, role: "user" | "assistant") => {
  // 더 포괄적인 URL 패턴 (http/https, www 포함/미포함, 괄호 안의 링크 포함)
  const linkRegex = /(https?:\/\/[^\s\)]+)/g;
  const parts = text.split(linkRegex);

  return parts.map((part, index) => {
    if (part.match(/^https?:\/\//)) {
      // 사용자 메시지에서는 흰색/밝은 색상, 어시스턴트 메시지에서는 진한 파란색 사용
      const linkClassName = role === "user"
        ? "text-white hover:text-gray-100 underline decoration-solid underline-offset-2 font-medium transition-colors"
        : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-solid underline-offset-2 font-medium transition-colors";

      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {part}
        </a>
      );
    }
    // 텍스트 부분에서 줄바꿈 문자를 <br /> 태그로 변환
    if (part.includes('\n')) {
      return part.split('\n').map((line, lineIndex, array) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < array.length - 1 && <br />}
        </span>
      ));
    }
    return part;
  });
};

// YouTube URL에서 비디오 ID 추출
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// YouTube URL인지 확인
const isYouTubeUrl = (url: string): boolean => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(url);
};

// 비디오 파일 확장자 확인
const isVideoFile = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i.test(url);
};

export default function ChatMessage({ message, onLike, onBookmark, onCopy }: ChatMessageProps) {
  const parsedContent = useMemo(() => {
    return parseLinks(message.content, message.role);
  }, [message.content, message.role]);

  const messageType = message.type || "text";

  // 이미지 메시지
  if (messageType === "image" && message.image) {
    return (
      <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        {message.role === "assistant" && (
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-[#00ACA3]/20 dark:ring-[#00ACA3]/30">
              <AvatarFallback className="bg-gradient-to-br from-[#00ACA3] to-[#00ACA3]/80 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Sparkles className="h-3 w-3 text-[#00ACA3] absolute -top-1 -right-1" />
          </div>
        )}

        <div className="relative group max-w-[80%]">
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-full bg-white dark:bg-gray-800">
            <a
              href={message.image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative max-w-full mx-auto"
            >
              <Image
                src={message.image.url}
                alt={message.image.title || `Image`}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto rounded-t-lg hover:opacity-90 transition-opacity"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
                unoptimized
              />
            </a>
            {message.image.title && (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {message.image.title}
                </p>
              </div>
            )}
          </div>
        </div>

        {message.role === "user" && (
          <Avatar className="h-8 w-8 ring-2 ring-gray-100 dark:ring-gray-700">
            <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  // 비디오 메시지
  if (messageType === "video" && message.video) {
    const video = message.video;
    const isYouTube = isYouTubeUrl(video.url);
    const isVideoFileUrl = isVideoFile(video.url);
    const youtubeVideoId = isYouTube ? getYouTubeVideoId(video.url) : null;

    return (
      <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        {message.role === "assistant" && (
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-[#00ACA3]/20 dark:ring-[#00ACA3]/30">
              <AvatarFallback className="bg-gradient-to-br from-[#00ACA3] to-[#00ACA3]/80 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Sparkles className="h-3 w-3 text-[#00ACA3] absolute -top-1 -right-1" />
          </div>
        )}

        <div className="relative group max-w-[80%]">
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {/* YouTube 비디오 */}
            {isYouTube && youtubeVideoId ? (
              <div className="w-full">
                <div className="relative w-full mx-auto bg-black rounded-t-lg" style={{ width: '640px', height: '360px', maxWidth: '100%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title={video.title || `YouTube Video`}
                    className="absolute top-0 left-0 w-full h-full rounded-t-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {video.title && (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {video.title}
                    </p>
                  </div>
                )}
              </div>
            ) : isVideoFileUrl ? (
              /* 일반 비디오 파일 (mp4 등) */
              <div className="w-full">
                <div className="relative w-full mx-auto bg-black rounded-t-lg" style={{ width: '640px', height: '360px', maxWidth: '100%' }}>
                  <video
                    src={video.url}
                    controls
                    className="absolute top-0 left-0 w-full h-full rounded-t-lg object-contain"
                    preload="metadata"
                  >
                    <source src={video.url} type="video/mp4" />
                    브라우저가 비디오 태그를 지원하지 않습니다.
                  </video>
                </div>
                {video.title && (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {video.title}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* 썸네일이 있는 비디오 링크 (기타) */
              <div className="relative rounded-lg overflow-hidden">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-full mx-auto"
                  style={{ width: '640px', height: '360px', maxWidth: '100%' }}
                >
                  {video.thumbnail_url ? (
                    <>
                      <Image
                        src={video.thumbnail_url}
                        alt={video.title || `Video`}
                        fill
                        className="object-cover rounded-t-lg"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <div className="bg-white/90 rounded-full p-3 group-hover:bg-white transition-colors">
                          <Play className="h-6 w-6 text-[#00ACA3] ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg">
                      <Play className="h-8 w-8 text-gray-400" fill="currentColor" />
                    </div>
                  )}
                </a>
                {video.title && (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {video.title}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {message.role === "user" && (
          <Avatar className="h-8 w-8 ring-2 ring-gray-100 dark:ring-gray-700">
            <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  // 텍스트 메시지 (기본)
  return (
    <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      {message.role === "assistant" && (
        <div className="relative">
          <Avatar className="h-8 w-8 ring-2 ring-[#00ACA3]/20 dark:ring-[#00ACA3]/30">
            <AvatarFallback className="bg-gradient-to-br from-[#00ACA3] to-[#00ACA3]/80 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <Sparkles className="h-3 w-3 text-[#00ACA3] absolute -top-1 -right-1" />
        </div>
      )}

      <div className="relative group max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${message.role === "user"
            ? "bg-gradient-to-r from-[#00ACA3] to-[#00ACA3]/90 text-white"
            : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700"
            }`}
        >
          {/* 텍스트 내용 */}
          {message.content && (
            <p className="w-full whitespace-pre-wrap text-sm leading-relaxed">
              {parsedContent}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onLike(message.id)}
                title={message.isLiked ? "좋아요 취소" : "좋아요"}
              >
                <Heart className={`h-3 w-3 ${message.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onBookmark(message.id)}
                title={message.isBookmarked ? "북마크 해제" : "북마크"}
              >
                <Bookmark className={`h-3 w-3 ${message.isBookmarked ? 'fill-[#00ACA3] text-[#00ACA3]' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onCopy(message.content, message.id)}
                title="복사"
              >
                {message.isCopied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {message.role === "user" && (
        <Avatar className="h-8 w-8 ring-2 ring-gray-100 dark:ring-gray-700">
          <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
