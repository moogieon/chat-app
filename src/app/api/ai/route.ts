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
      // 타임아웃 설정 (10초)
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: '서버 연결 오류',
            message: '현재 서버와 통신이 원활하지 않습니다. 잠시 후 다시 시도해주세요.',
            contact: '지속적인 문제가 발생할 경우 고객센터(1588-0000)로 문의해주세요.'
          },
          { status: 503 }
        );
      } else if (response.status >= 500) {
        return NextResponse.json(
          { 
            error: '서버 오류',
            message: '서버에서 일시적인 오류가 발생했습니다.',
            contact: '문제가 지속되면 고객센터(1588-0000)로 문의해주세요.'
          },
          { status: 503 }
        );
      } else {
        return NextResponse.json(
          { 
            error: '요청 오류',
            message: '요청을 처리할 수 없습니다.',
            contact: '고객센터(1588-0000)로 문의해주세요.'
          },
          { status: 400 }
        );
      }
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    
    // 타임아웃 오류
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          error: '응답 시간 초과',
          message: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
          contact: '지속적인 지연이 발생하면 고객센터(1588-0000)로 문의해주세요.'
        },
        { status: 504 }
      );
    }
    
    // 네트워크 오류
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: '네트워크 연결 오류',
          message: '인터넷 연결을 확인하고 다시 시도해주세요.',
          contact: '연결 문제가 지속되면 고객센터(1588-0000)로 문의해주세요.'
        },
        { status: 503 }
      );
    }

    // 기타 오류
    return NextResponse.json(
      { 
        error: '시스템 오류',
        message: '일시적인 시스템 오류가 발생했습니다.',
        contact: '문제가 지속되면 고객센터(1588-0000)로 문의해주세요.'
      },
      { status: 500 }
    );
  }
}
