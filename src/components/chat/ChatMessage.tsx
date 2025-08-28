"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Copy, Check, Heart, Bookmark, Sparkles } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isCopied?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onLike: (messageId: string) => void;
  onBookmark: (messageId: string) => void;
  onCopy: (content: string, messageId: string) => void;
}

export default function ChatMessage({ message, onLike, onBookmark, onCopy }: ChatMessageProps) {
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
          <p className="w-full whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
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
