"use client";

import { useMemo } from "react";
import { Bot, User, Copy, Check, Heart, Bookmark, Sparkles, Play } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageItem, VideoItem, Citation, MediaCitation } from "@/lib/api";

type MessageType = "text" | "image" | "video";

interface Message {
  id: string;
  content: string | string[];
  role: "user" | "assistant";
  timestamp: Date;
  isCopied?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  type?: MessageType;
  image?: ImageItem;
  video?: VideoItem;
  citations?: Citation[];
  media_citations?: MediaCitation[];
}

interface ChatMessageProps {
  message: Message;
  onLike: (messageId: string) => void;
  onBookmark: (messageId: string) => void;
  onCopy: (content: string, messageId: string) => void;
}

const parseLinks = (text: string, role: "user" | "assistant") => {
  const linkRegex = /(https?:\/\/[^\s\)]+)/g;
  const parts = text.split(linkRegex);

  return parts.map((part, index) => {
    if (part.match(/^https?:\/\//)) {
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

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const isYouTubeUrl = (url: string): boolean => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(url);
};

const isVideoFile = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i.test(url);
};

const getCitationUrl = (doc_id: string, chunk_id: string): string => {
  return `/wiki/${doc_id}?chunk_id=${chunk_id}`;
};

const parseTextWithCitations = (
  texts: string[],
  citations: Citation[] | undefined,
  role: "user" | "assistant"
) => {
  if (!citations || citations.length === 0) {
    return texts.map((text, idx) => (
      <span key={idx}>
        {parseLinks(text, role)}
        {idx < texts.length - 1 && <br />}
      </span>
    )    );
  }

  const citationMap = new Map<number, Array<Citation & { citationIndex: number }>>();
  citations.forEach((citation, citationIdx) => {
    citation.sentences.forEach((sentenceIdx) => {
      if (!citationMap.has(sentenceIdx)) {
        citationMap.set(sentenceIdx, []);
      }
      citationMap.get(sentenceIdx)!.push({ ...citation, citationIndex: citationIdx + 1 });
    });
  });

  return texts.map((text, sentenceIdx) => {
    const sentenceCitations = citationMap.get(sentenceIdx) || [];

    return (
      <span key={sentenceIdx}>
        {parseLinks(text, role)}
        {sentenceCitations.length > 0 && (
          <>
            {' '}
            {sentenceCitations.map((citation, idx) => {
              const citationUrl = getCitationUrl(citation.doc_id, citation.chunk_id);
              const citationClassName = role === "user"
                ? "text-white hover:text-gray-100 underline decoration-solid underline-offset-2 font-medium transition-colors cursor-pointer"
                : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-solid underline-offset-2 font-medium transition-colors cursor-pointer";

              return (
                <a
                  key={idx}
                  href={citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={citationClassName}
                >
                  [{citation.citationIndex}]
                </a>
              );
            })}
          </>
        )}
        {sentenceIdx < texts.length - 1 && <br />}
      </span>
    );
  });
};

const renderMediaCitations = (
  media_citations: MediaCitation[] | undefined,
  mediaType: 'image' | 'video',
  mediaId: number | undefined
) => {
  if (!media_citations || media_citations.length === 0) return null;

  const filteredCitations = media_citations.filter(
    mc => mc.type === mediaType && mc.media_id === mediaId?.toString()
  );

  if (filteredCitations.length === 0) return null;

  return (
    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
      {filteredCitations.map((citation, idx) => {
        const assetIdMatch = citation.media_id.match(/[?&]asset_id=(\d+)/);
        const mediaIdForUrl = assetIdMatch ? assetIdMatch[1] : citation.media_id;
        const citationUrl = `/wiki/${mediaIdForUrl}?chunk_id=${citation.chunk_id}`;
        return (
          <a
            key={idx}
            href={citationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-solid underline-offset-2 font-medium transition-colors cursor-pointer"
          >
            출처
          </a>
        );
      })}
    </div>
  );
};

const MessageAvatar = ({ role }: { role: "user" | "assistant" }) => {
  if (role === "assistant") {
    return (
      <div className="relative">
        <Avatar className="h-8 w-8 ring-2 ring-[#00ACA3]/20 dark:ring-[#00ACA3]/30">
          <AvatarFallback className="bg-gradient-to-br from-[#00ACA3] to-[#00ACA3]/80 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <Sparkles className="h-3 w-3 text-[#00ACA3] absolute -top-1 -right-1" />
      </div>
    );
  }

  return (
    <Avatar className="h-8 w-8 ring-2 ring-gray-100 dark:ring-gray-700">
      <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
};

export default function ChatMessage({ message, onLike, onBookmark, onCopy }: ChatMessageProps) {
  const parsedContent = useMemo(() => {
    if (Array.isArray(message.content)) {
      return parseTextWithCitations(message.content, message.citations, message.role);
    }
    return parseLinks(message.content, message.role);
  }, [message.content, message.citations, message.role]);

  const messageType = message.type || "text";

  if (messageType === "image" && message.image) {
    return (
      <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        {message.role === "assistant" && <MessageAvatar role="assistant" />}

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
            {renderMediaCitations(message.media_citations, 'image', message.image?.id)}
          </div>
        </div>

        {message.role === "user" && <MessageAvatar role="user" />}
      </div>
    );
  }

  if (messageType === "video" && message.video) {
    const video = message.video;
    const isYouTube = isYouTubeUrl(video.url);
    const isVideoFileUrl = isVideoFile(video.url);
    const youtubeVideoId = isYouTube ? getYouTubeVideoId(video.url) : null;

    return (
      <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        {message.role === "assistant" && <MessageAvatar role="assistant" />}

        <div className="relative group max-w-[80%]">
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                {renderMediaCitations(message.media_citations, 'video', message.video?.id)}
              </div>
            ) : isVideoFileUrl ? (
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
                {renderMediaCitations(message.media_citations, 'video', message.video?.id)}
              </div>
            ) : (
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
                {renderMediaCitations(message.media_citations, 'video', message.video?.id)}
              </div>
            )}
          </div>
        </div>

        {message.role === "user" && <MessageAvatar role="user" />}
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      {message.role === "assistant" && <MessageAvatar role="assistant" />}

      <div className="relative group max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${message.role === "user"
            ? "bg-gradient-to-r from-[#00ACA3] to-[#00ACA3]/90 text-white"
            : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700"
            }`}
        >
          {message.content && (
            <div className="w-full whitespace-pre-wrap text-sm leading-relaxed">
              {parsedContent}
            </div>
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
                onClick={() => onCopy(Array.isArray(message.content) ? message.content.join('\n') : message.content, message.id)}
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

      {message.role === "user" && <MessageAvatar role="user" />}
    </div>
  );
}
