export interface ChatRequest {
  session_id: string;
  question: string;
}

export interface ImageItem {
  url: string;
  title: string;
}

export interface VideoItem {
  url: string;
  title: string;
  thumbnail_url?: string;
}

export interface ChatResponseContent {
  images?: ImageItem[];
  videos?: VideoItem[];
  text: string;
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
      // 서버에서 보낸 구체적인 오류 정보가 있는 경우
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
