import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/api';
import './Modal.css';

interface Washroom {
  id: number;
  name: string;
  building: string | null;
  floor: number | null;
  accessibility: boolean;
  paid_access: boolean;
  average_rating: number | string | null;
  total_reviews: number;
}

interface Review {
  id: number;
  user_id: number;
  washroom_id: number;
  username?: string;
  cleanliness_rating: number;
  wait_time_rating: number;
  accessibility_rating: number;
  comment: string | null;
  toiletries_available: {
    soap: boolean;
    toilet_paper: boolean;
    paper_towels: boolean;
    feminine_products: boolean;
  };
  created_at: string;
}

interface WashroomDetailsModalProps {
  washroom: Washroom;
  onClose: () => void;
  onAddReview: () => void;
}

const WashroomDetailsModal: React.FC<WashroomDetailsModalProps> = ({
  washroom,
  onClose,
  onAddReview,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
  }, [washroom.id]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getByWashroom(washroom.id);
      setReviews(data.reviews || []);
    } catch (err: any) {
      console.error('Failed to load reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => {
      return sum + (review.cleanliness_rating + review.wait_time_rating + review.accessibility_rating) / 3;
    }, 0);
    return (total / reviews.length).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderRating = (rating: number) => {
    return '🚽'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getTolletries = (toiletries: any) => {
    const items = [];
    if (toiletries?.soap) items.push('Soap');
    if (toiletries?.toilet_paper) items.push('Toilet Paper');
    if (toiletries?.paper_towels) items.push('Paper Towels');
    if (toiletries?.feminine_products) items.push('Feminine Products');
    return items.join(', ') || 'None';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{washroom.name}</h2>
            {washroom.building && (
              <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.95rem' }}>
                {washroom.building}
                {washroom.floor !== null && ` - Floor ${washroom.floor}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#7f8c8d',
              padding: '0',
              marginTop: '-0.5rem',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f5f7fa', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#7f8c8d' }}>Overall Average Rating</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                {calculateAverageRating()} / 5.0
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#7f8c8d' }}>Total Reviews</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                {reviews.length}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#7f8c8d' }}>
            {washroom.accessibility && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                ♿ Wheelchair Accessible
              </span>
            )}
            {washroom.paid_access && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                💰 Paid Access
              </span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>
              Reviews ({reviews.length})
            </h3>
            <button
              onClick={onAddReview}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#5a6fd8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
            >
              + Add Review
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Loading reviews...</p>
          ) : error ? (
            <p style={{ textAlign: 'center', color: '#e74c3c' }}>{error}</p>
          ) : reviews.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: '#f5f7fa',
              borderRadius: '8px',
              color: '#7f8c8d',
            }}>
              <p style={{ margin: 0 }}>No reviews yet. Be the first to review this washroom!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #ecf0f1',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <p style={{ margin: '0', fontWeight: '600', color: '#2c3e50' }}>
                        {review.username || 'Anonymous'}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>

                  <div style={{ margin: '0.75rem 0', display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: '#7f8c8d', marginRight: '0.5rem' }}>Cleanliness:</span>
                      <span>{renderRating(review.cleanliness_rating)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#7f8c8d', marginRight: '0.5rem' }}>Wait Time:</span>
                      <span>{renderRating(review.wait_time_rating)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#7f8c8d', marginRight: '0.5rem' }}>Accessibility:</span>
                      <span>{renderRating(review.accessibility_rating)}</span>
                    </div>
                  </div>

                  {review.comment && (
                    <p style={{
                      margin: '0.75rem 0 0 0',
                      fontSize: '0.9rem',
                      color: '#2c3e50',
                      fontStyle: 'italic',
                      borderLeft: '3px solid #667eea',
                      paddingLeft: '0.75rem',
                    }}>
                      "{review.comment}"
                    </p>
                  )}

                  <div style={{ margin: '0.75rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
                    <span>Amenities: {getTolletries(review.toiletries_available)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button
            onClick={onClose}
            className="cancel-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WashroomDetailsModal;
