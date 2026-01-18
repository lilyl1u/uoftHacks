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
<<<<<<< HEAD
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{washroom.name}</h2>
            {washroom.building && (
              <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.95rem' }}>
                {washroom.building}
                {washroom.floor !== null && ` - Floor ${washroom.floor}`}
              </p>
=======
      <div className="washroom-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>
        
        <div className="washroom-details-header">
          <h2>{washroom.name}</h2>
          <p className="washroom-building">
            {washroom.building}
            {washroom.floor !== null && ` • Floor ${washroom.floor}`}
            {washroom.campus && ` • ${washroom.campus}`}
          </p>
        </div>

        <div className="washroom-details-content">
          {/* Map Section */}
          <div className="washroom-map-section">
            <h3>Location</h3>
            <div className="map-container-details">
              <MapContainer
                key={`map-${washroomId}`}
                center={[washroom.latitude, washroom.longitude]}
                zoom={17}
                style={{ height: '300px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker
                  position={[washroom.latitude, washroom.longitude]}
                  icon={new Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })}
                >
                  <Popup>{washroom.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* User Visit Info Section (for own profile) */}
          {visitData && (
            <div className="user-visit-info-section">
              <div className="visit-info-card">
                <div className="visit-info-item">
                  <span className="visit-info-label">You visited</span>
                  <span className="visit-info-value">{visitData.visit_count} {visitData.visit_count === 1 ? 'time' : 'times'}</span>
                </div>
                {visitData.overall_rating && (
                  <div className="visit-info-item">
                    <span className="visit-info-label">Your Rating</span>
                    <span 
                      className="visit-info-value"
                      style={{ color: getRatingColor(getRating(visitData.overall_rating)) }}
                    >
                      ⭐ {getRating(visitData.overall_rating).toFixed(1)}/5.0
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Average Rating Section */}
          <div className="washroom-rating-section">
            <h3>Average Rating</h3>
            <div className="rating-display" style={{ borderLeftColor: ratingColor }}>
              <div className="rating-value" style={{ color: ratingColor }}>
                {rating > 0 ? rating.toFixed(1) : 'N/A'}
              </div>
              <div className="rating-details">
                <span className="rating-badge" style={{ background: ratingColor }}>
                  {rating > 0 ? `${rating.toFixed(1)}/5.0` : 'No ratings yet'}
                </span>
                <span className="rating-count">
                  {washroom.total_reviews} {washroom.total_reviews === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          </div>

          {/* Friends' Reviews Section */}
          <div className="friends-reviews-section">
            <h3>Friends' Reviews ({friendsReviews.length})</h3>
            {friendsReviews.length > 0 ? (
              <div className="reviews-list">
                {friendsReviews.map((review) => {
                  const reviewRating = getRating(review.overall_rating);
                  const reviewColor = getRatingColor(reviewRating);
                  return (
                    <div key={review.id} className="friend-review-card">
                      <div className="review-header">
                        <div className="review-user">
                          {review.avatar ? (
                            <img src={review.avatar} alt={review.username} className="review-avatar" />
                          ) : (
                            <div className="review-avatar-placeholder">
                              {review.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="review-username">{review.username}</span>
                        </div>
                        <div className="review-rating" style={{ color: reviewColor }}>
                          {reviewRating > 0 ? reviewRating.toFixed(1) : 'N/A'}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      
                      {/* Like and Comment Section */}
                      <div className="review-actions">
                        <button
                          className={`like-button ${likes[review.id]?.liked ? 'liked' : ''}`}
                          onClick={() => handleLike(review.id)}
                          disabled={loadingLikes.has(review.id)}
                        >
                          {likes[review.id]?.liked ? '❤️' : '🤍'} {likes[review.id]?.count || 0}
                        </button>
                        <button
                          className="comment-button"
                          onClick={() => toggleReviewExpanded(review.id)}
                        >
                          💬 {comments[review.id]?.length || 0}
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedReviews.has(review.id) && (
                        <div className="comments-section">
                          {loadingComments.has(review.id) ? (
                            <div className="loading-comments">Loading comments...</div>
                          ) : (
                            <>
                              <div className="comments-list">
                                {comments[review.id] && comments[review.id].length > 0 ? (
                                  comments[review.id].map((comment) => (
                                    <div key={comment.id} className="comment-item">
                                      <div className="comment-user">
                                        {comment.avatar ? (
                                          <img src={comment.avatar} alt={comment.username} className="comment-avatar" />
                                        ) : (
                                          <div className="comment-avatar-placeholder">
                                            {comment.username.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="comment-username">{comment.username}</span>
                                      </div>
                                      <p className="comment-text">{comment.comment_text}</p>
                                      <span className="comment-time">{formatDate(comment.created_at)}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                                )}
                              </div>
                              <div className="add-comment">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentTexts[review.id] || ''}
                                  onChange={(e) => setCommentTexts({ ...commentTexts, [review.id]: e.target.value })}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(review.id);
                                    }
                                  }}
                                  className="comment-input"
                                />
                                <button
                                  onClick={() => handleAddComment(review.id)}
                                  className="comment-submit"
                                  disabled={!commentTexts[review.id]?.trim()}
                                >
                                  Post
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-friends-reviews">No friends have reviewed this washroom yet.</p>
>>>>>>> 098c751d51aa836361af314dcc1b4f826a8c259e
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
