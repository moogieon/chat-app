export interface ChatRequest {
  session_id: string;
  question: string;
}

export interface ImageItem {
  url: string;
  title: string;
  id?: number;
}

export interface VideoItem {
  url: string;
  title: string;
  thumbnail_url?: string;
  id?: number;
}

export interface Citation {
  doc_id: string;
  chunk_id: string;
  sentences: number[];
}

export interface MediaCitation {
  media_id: string;
  type: string;
  doc_id?: string;
  chunk_id: string;
  related_sentences: number[];
}

export interface ChatResponseContent {
  images?: ImageItem[];
  videos?: VideoItem[];
  text: string[];
  citations?: Citation[];
  media_citations?: MediaCitation[];
  is_unknown?: boolean;
}

export interface ChatResponse {
  response: ChatResponseContent;
  session_id: string;
}

export interface ChatError {
  error: string;
  message: string;
  contact: string;
}

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error && data.message && data.contact) {
        const error = new Error(data.message) as Error & ChatError;
        error.error = data.error;
        error.message = data.message;
        error.contact = data.contact;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    localStorage.setItem("session_id", data.session_id);
    return data;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
}
