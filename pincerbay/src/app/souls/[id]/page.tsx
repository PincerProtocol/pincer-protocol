'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Soul 타입 정의
interface Soul {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  description: string;
  price: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  tags: string[];
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export default function SoulDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [soul, setSoul] = useState<Soul | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');
  const [userBalance, setUserBalance] = useState(1000); // 예시 잔액

  useEffect(() => {
    // Soul 데이터 로드
    const fetchSoul = async () => {
      try {
        // API에서 Soul 정보 가져오기
        const response = await fetch(`/api/souls/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setSoul(data);
        } else {
          setMessage('Soul을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('Error fetching soul:', error);
        setMessage('오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSoul();
    }
  }, [params.id]);

  const handleBuySoul = async () => {
    if (!soul) return;

    // 잔액 확인
    if (userBalance < soul.price) {
      setMessage('잔액이 부족합니다. 입금 페이지로 이동합니다...');
      setTimeout(() => {
        router.push('/deposit');
      }, 2000);
      return;
    }

    setPurchasing(true);
    setMessage('');

    try {
      // 구매 API 호출
      const response = await fetch(`/api/souls/${soul.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          soulId: soul.id,
          price: soul.price,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ 구매 성공! ${data.message || 'Soul이 전송되었습니다.'}`);
        setUserBalance(prev => prev - soul.price);
        // 3초 후 홈으로 이동
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        // 잔액 부족 (402) → /deposit 리다이렉트
        if (response.status === 402) {
          setMessage('잔액이 부족합니다. 입금 페이지로 이동합니다...');
          setTimeout(() => {
            router.push('/deposit');
          }, 2000);
        } else {
          setMessage(`❌ 오류: ${data.error || '구매 실패'}`);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setMessage('❌ 네트워크 오류가 발생했습니다.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-[var(--color-text-muted)]">로딩 중...</div>
      </div>
    );
  }

  if (!soul) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-4">Soul을 찾을 수 없습니다</div>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 상단: Soul 정보 */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 flex items-center justify-center">
                <Image
                  src={soul.avatar}
                  alt={soul.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{soul.name}</h1>
              <div className="text-lg text-[var(--color-primary)] font-medium mb-3">
                {soul.specialty}
              </div>
              <p className="text-[var(--color-text-muted)] mb-4">
                {soul.description}
              </p>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap mb-4">
                {soul.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] rounded-lg text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Seller */}
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                <Image
                  src={soul.seller.avatar}
                  alt={soul.seller.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="text-sm font-medium">{soul.seller.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    ⭐ {soul.seller.rating} 평점
                  </div>
                </div>
              </div>
            </div>

            {/* 가격 & 구매 */}
            <div className="flex flex-col items-center justify-center border-l-0 md:border-l border-[var(--color-border)] pl-0 md:pl-6 min-w-[200px]">
              <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                {soul.price}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] mb-4">PNCR</div>

              <button
                onClick={handleBuySoul}
                disabled={purchasing}
                className="btn-primary btn-enhanced w-full"
              >
                {purchasing ? '구매 중...' : '🛒 Buy Soul'}
              </button>

              {/* 사용자 잔액 */}
              <div className="text-xs text-[var(--color-text-muted)] mt-3">
                잔액: {userBalance} PNCR
              </div>

              {/* 메시지 */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                  message.startsWith('✅') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">리뷰</h2>

          {soul.reviews.length === 0 ? (
            <div className="text-[var(--color-text-muted)] text-center py-8">
              아직 리뷰가 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {soul.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-[var(--color-border)] last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{review.author}</div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {review.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-[var(--color-text-muted)]">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
