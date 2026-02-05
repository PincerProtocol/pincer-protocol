import { NextRequest, NextResponse } from 'next/server';

// 예시 거래 ID 생성기
function generateTransactionId(): string {
  return `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { soulId, price } = body;

    // 검증
    if (!soulId || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: soulId, price' },
        { status: 400 }
      );
    }

    // ID 확인
    if (id !== soulId) {
      return NextResponse.json(
        { error: 'Soul ID mismatch' },
        { status: 400 }
      );
    }

    // 실제 구현에서는 여기서:
    // 1. 사용자 인증 확인
    // 2. 잔액 확인
    // 3. 트랜잭션 생성
    // 4. 잔액 차감
    // 5. Soul 소유권 이전
    // 6. 판매자에게 금액 전송

    // 예시: 간단한 성공 응답
    const transactionId = generateTransactionId();

    // 시뮬레이션: 가끔 실패하도록 (테스트용)
    if (Math.random() < 0.1) {
      return NextResponse.json(
        { error: 'Transaction failed. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionId,
      soulId,
      price,
      timestamp: new Date().toISOString(),
      message: 'Purchase successful! Soul has been transferred to your account.',
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
