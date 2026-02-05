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
        setMessage('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSoul();
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
      // API 호출
      const response = await fetch(`/api/souls/${params.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          soulId: soul.id,
          price: soul.price,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ ${soul.name} 구매 완료! 거래 ID: ${result.transactionId}`);
        setUserBalance(userBalance - soul.price);
      } else {
        const error = await response.json();
        setMessage(`❌ 구매 실패: ${error.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setMessage('❌ 구매 중 오류가 발생했습니다.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner">🦞</div>
          <p>Loading Soul...</p>
        </div>
      </div>
    );
  }

  if (!soul) {
    return (
      <div className="container">
        <div className="error">
          <h2>😕 Soul을 찾을 수 없습니다</h2>
          <p>{message}</p>
          <button className="btn-enhanced" onClick={() => router.push('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="soul-detail-page">
      <div className="container">
        {/* 헤더 섹션 */}
        <div className="soul-header">
          <div className="soul-avatar">
            <Image
              src={soul.avatar}
              alt={soul.name}
              width={200}
              height={200}
              className="avatar-image"
            />
          </div>
          <div className="soul-info">
            <h1 className="soul-name">{soul.name}</h1>
            <p className="soul-specialty">{soul.specialty}</p>
            <p className="soul-description">{soul.description}</p>
            <div className="soul-price">
              <span className="price-label">Price:</span>
              <span className="price-value">${soul.price}</span>
            </div>
          </div>
        </div>

        {/* 구매 섹션 */}
        <div className="purchase-section">
          <div className="balance-info">
            <span className="balance-label">현재 잔액:</span>
            <span className="balance-value">${userBalance}</span>
          </div>
          <button
            className="btn-enhanced buy-button"
            onClick={handleBuySoul}
            disabled={purchasing}
          >
            {purchasing ? '구매 중...' : `🦞 Buy ${soul.name}`}
          </button>
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        {/* 판매자 정보 */}
        <div className="seller-section">
          <h2>판매자 정보</h2>
          <div className="seller-card">
            <Image
              src={soul.seller.avatar}
              alt={soul.seller.name}
              width={60}
              height={60}
              className="seller-avatar"
            />
            <div className="seller-details">
              <h3>{soul.seller.name}</h3>
              <div className="seller-rating">
                {'⭐'.repeat(Math.floor(soul.seller.rating))}
                <span className="rating-value">({soul.seller.rating})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 태그 섹션 */}
        <div className="tags-section">
          <h2>태그</h2>
          <div className="tags">
            {soul.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div className="reviews-section">
          <h2>리뷰 ({soul.reviews.length})</h2>
          <div className="reviews-list">
            {soul.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="review-author">{review.author}</span>
                  <span className="review-rating">
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{review.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .soul-detail-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 40px 0;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .loading {
          text-align: center;
          padding: 100px 20px;
        }

        .spinner {
          font-size: 48px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error {
          text-align: center;
          padding: 100px 20px;
        }

        .error h2 {
          color: #105190;
          margin-bottom: 16px;
        }

        .soul-header {
          display: flex;
          gap: 40px;
          margin-bottom: 40px;
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .soul-avatar {
          flex-shrink: 0;
        }

        .avatar-image {
          border-radius: 12px;
          object-fit: cover;
        }

        .soul-info {
          flex: 1;
        }

        .soul-name {
          font-size: 48px;
          font-weight: 700;
          color: #105190;
          margin-bottom: 16px;
        }

        .soul-specialty {
          font-size: 24px;
          color: #10b981;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .soul-description {
          font-size: 18px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .soul-price {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 32px;
        }

        .price-label {
          color: #6b7280;
          font-weight: 500;
        }

        .price-value {
          color: #105190;
          font-weight: 700;
        }

        .purchase-section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .balance-info {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          font-size: 20px;
        }

        .balance-label {
          color: #6b7280;
        }

        .balance-value {
          color: #10b981;
          font-weight: 700;
        }

        .btn-enhanced {
          background: #105190;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 16px 48px;
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-enhanced:hover {
          background: #0a3a5e;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 81, 144, 0.3);
        }

        .btn-enhanced:disabled {
          background: #6b7280;
          cursor: not-allowed;
          transform: none;
        }

        .buy-button {
          font-size: 24px;
          padding: 20px 60px;
        }

        .message {
          margin-top: 24px;
          padding: 16px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 500;
        }

        .message.success {
          background: #d1fae5;
          color: #065f46;
        }

        .message.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .seller-section,
        .tags-section,
        .reviews-section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        h2 {
          font-size: 28px;
          color: #105190;
          margin-bottom: 24px;
          font-weight: 700;
        }

        .seller-card {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .seller-avatar {
          border-radius: 50%;
          object-fit: cover;
        }

        .seller-details h3 {
          font-size: 20px;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .seller-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
        }

        .rating-value {
          color: #6b7280;
          font-size: 16px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .tag {
          background: #e5e7eb;
          color: #0f172a;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .review-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .review-author {
          font-weight: 600;
          color: #0f172a;
        }

        .review-rating {
          font-size: 16px;
        }

        .review-comment {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .review-date {
          font-size: 14px;
          color: #9ca3af;
        }

        @media (max-width: 768px) {
          .soul-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .soul-name {
            font-size: 32px;
          }

          .soul-specialty {
            font-size: 20px;
          }

          .soul-description {
            font-size: 16px;
          }

          .buy-button {
            font-size: 18px;
            padding: 16px 40px;
          }
        }
      `}</style>
    </div>
  );
}
