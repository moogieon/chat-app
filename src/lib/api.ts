export interface ChatRequest {
  session_id: string;
  question: string;
  use_rerank_on_unknown?: boolean;
  top_k_first?: number;
  top_k_rerank1?: number;
  top_k_rerank2?: number;
  temperature?: number;
}

export interface ChatResponse {
  answer: string;
  session_id: string;
  // 필요한 경우 다른 응답 필드들 추가
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}
