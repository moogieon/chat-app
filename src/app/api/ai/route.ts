import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://192.168.219.240:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 실제 서버로 요청 전달
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
