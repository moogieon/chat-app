"use client";

import { Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8 ring-2 ring-[#00ACA3]/20 dark:ring-[#00ACA3]/30">
        <AvatarFallback className="bg-gradient-to-br from-[#00ACA3] to-[#00ACA3]/80 text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-[#00ACA3] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#00ACA3] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-[#00ACA3] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">하카봇이 답변을 작성 중...</span>
        </div>
      </div>
    </div>
  );
}
