import React, { useState, useEffect } from 'react';
import { reviewService, commentService, likeService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Modal.css';

interface Washroom {
  id: number;
  name: string;
  building: string | null;
  floor: number | null;
  average_rating: number | string | null;
  total_reviews: number;
}

interface Review {
  id: number;
  user_id: number;
  username: string;
  avatar: string | null;
  overall_rating: number | string;
  comment: string | null;
  created_at: string;
  cleanliness_rating?: number;
  privacy_rating?: number;
  wait_time_rating?: number;
  accessibility_rating?: number;
  ease_of_access_rating?: number;
}

interface Comment {
  id: number;
  review_id: number;
  comment_text: string;
  created_at: string;
  user_id: number;
  username: string;
  avatar: string | null;
}

interface ReviewsListModalProps {
  washroom: Washroom;
  onClose: () => void;
}

const ReviewsListModal: React.FC<ReviewsListModalProps> = ({ washroom, onClose }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [likes, setLikes] = useState<Record<number, { count: number; liked: boolean }>>({});
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadReviews();
  }, [washroom.id]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await reviewService.getByWashroom(washroom.id);
      const reviewsList = reviewsData.reviews || [];
      setReviews(reviewsList);

      // Load like counts and status for all reviews
      if (reviewsList.length > 0) {
        const likesPromises = reviewsList.map(async (review: Review) => {
          try {
            const [count, liked] = await Promise.all([
              likeService.getCount(review.id),
              likeService.checkIfLiked(review.id),
            ]);
            return { reviewId: review.id, count, liked };
          } catch (error) {
            console.error(`Failed to load likes for review ${review.id}:`, error);
            return { reviewId: review.id, count: 0, liked: false };
          }
        });

        const likesData = await Promise.all(likesPromises);
        const likesMap: Record<number, { count: number; liked: boolean }> = {};
        likesData.forEach(({ reviewId, count, liked }) => {
          likesMap[reviewId] = { count, liked };
        });
        setLikes(likesMap);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReviewExpanded = async (reviewId: number) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
      // Load comments when expanding
      if (!comments[reviewId]) {
        setLoadingComments(new Set([...Array.from(loadingComments), reviewId]));
        try {
          const commentsData = await commentService.getByReview(reviewId);
          setComments({ ...comments, [reviewId]: commentsData });
        } catch (error) {
          console.error(`Failed to load comments for review ${reviewId}:`, error);
        } finally {
          const newLoading = new Set(loadingComments);
          newLoading.delete(reviewId);
          setLoadingComments(newLoading);
        }
      }
    }
    setExpandedReviews(newExpanded);
  };

  const handleLike = async (reviewId: number) => {
    if (loadingLikes.has(reviewId)) return;

    setLoadingLikes(new Set([...Array.from(loadingLikes), reviewId]));
    try {
      const currentLiked = likes[reviewId]?.liked || false;
      const result = currentLiked
        ? await likeService.unlike(reviewId)
        : await likeService.like(reviewId);

      setLikes({
        ...likes,
        [reviewId]: { count: result.like_count, liked: result.liked },
      });
    } catch (error) {
      console.error(
        `Failed to ${likes[reviewId]?.liked ? 'unlike' : 'like'} review:`,
        error
      );
    } finally {
      const newLoading = new Set(loadingLikes);
      newLoading.delete(reviewId);
      setLoadingLikes(newLoading);
    }
  };

  const handleAddComment = async (reviewId: number) => {
    const commentText = commentTexts[reviewId]?.trim();
    if (!commentText) return;

    try {
      const newComment = await commentService.create(reviewId, commentText);
      if (newComment && newComment.id) {
        setComments({
          ...comments,
          [reviewId]: [...(comments[reviewId] || []), newComment],
        });
        setCommentTexts({ ...commentTexts, [reviewId]: '' });
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (reviewId: number, commentId: number) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await commentService.delete(commentId);
      setComments({
        ...comments,
        [reviewId]: comments[reviewId].filter((c) => c.id !== commentId),
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const getRating = (rating: any): number => {
    if (rating == null || rating === '') return 0;
    const num = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
    return isNaN(num) ? 0 : num;
  };

  const getStarRating = (rating: number) => {
    return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{washroom.name}</h2>
          {washroom.building && <p>{washroom.building}</p>}
          {washroom.floor !== null && <p>Floor {washroom.floor}</p>}
        </div>

        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Average Rating: {getRating(washroom.average_rating).toFixed(1)}/5.0
            </div>
            <div style={{ fontSize: '1.2rem', letterSpacing: '2px' }}>
              {getStarRating(getRating(washroom.average_rating))}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
              Based on {washroom.total_reviews} {washroom.total_reviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>

        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              No reviews yet. Be the first to add one!
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {review.avatar && (
                        <img
                          src={review.avatar}
                          alt={review.username}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                          {review.username}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', letterSpacing: '2px' }}>
                      {getStarRating(getRating(review.overall_rating))}
                    </div>
                  </div>

                  {review.comment && (
                    <div style={{ marginTop: '0.75rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                      {review.comment}
                    </div>
                  )}

                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      onClick={() => toggleReviewExpanded(review.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3498db',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      {expandedReviews.has(review.id) ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>

                  {expandedReviews.has(review.id) && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                      }}
                    >
                      {review.cleanliness_rating && (
                        <div>
                          <strong>Cleanliness:</strong> {review.cleanliness_rating}/5
                        </div>
                      )}
                      {review.wait_time_rating && (
                        <div>
                          <strong>Wait Time:</strong> {review.wait_time_rating}/5
                        </div>
                      )}
                      {review.accessibility_rating && (
                        <div>
                          <strong>Accessibility:</strong> {review.accessibility_rating}/5
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid #e0e0e0',
                          display: 'flex',
                          gap: '1rem',
                        }}
                      >
                        <button
                          onClick={() => handleLike(review.id)}
                          disabled={loadingLikes.has(review.id)}
                          style={{
                            background: likes[review.id]?.liked ? '#3498db' : '#ecf0f1',
                            color: likes[review.id]?.liked ? 'white' : '#2c3e50',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          👍 {likes[review.id]?.count || 0}
                        </button>

                        <button
                          onClick={() => toggleReviewExpanded(review.id)}
                          style={{
                            background: '#f8f9fa',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            color: '#2c3e50',
                          }}
                        >
                          💬 {comments[review.id]?.length || 0}
                        </button>
                      </div>

                      {expandedReviews.has(review.id) && (
                        <div style={{ marginTop: '0.75rem' }}>
                          {loadingComments.has(review.id) ? (
                            <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                              Loading comments...
                            </p>
                          ) : (
                            <>
                              {(comments[review.id] || []).length > 0 && (
                                <div
                                  style={{
                                    marginBottom: '0.75rem',
                                    paddingBottom: '0.75rem',
                                    borderBottom: '1px solid #e0e0e0',
                                  }}
                                >
                                  {comments[review.id].map((comment) => (
                                    <div
                                      key={comment.id}
                                      style={{
                                        fontSize: '0.85rem',
                                        marginBottom: '0.5rem',
                                        padding: '0.5rem',
                                        background: '#ffffff',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                        {comment.username}
                                      </div>
                                      <div style={{ color: '#555', marginTop: '0.25rem' }}>
                                        {comment.comment_text}
                                      </div>
                                      {user?.id === comment.user_id && (
                                        <button
                                          onClick={() => handleDeleteComment(review.id, comment.id)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#e74c3c',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            marginTop: '0.25rem',
                                            padding: 0,
                                          }}
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                  type="text"
                                  value={commentTexts[review.id] || ''}
                                  onChange={(e) =>
                                    setCommentTexts({
                                      ...commentTexts,
                                      [review.id]: e.target.value,
                                    })
                                  }
                                  placeholder="Add a comment..."
                                  style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                  }}
                                />
                                <button
                                  onClick={() => handleAddComment(review.id)}
                                  disabled={!commentTexts[review.id]?.trim()}
                                  style={{
                                    background: commentTexts[review.id]?.trim()
                                      ? '#3498db'
                                      : '#bdc3c7',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.5rem 1rem',
                                    cursor: commentTexts[review.id]?.trim()
                                      ? 'pointer'
                                      : 'not-allowed',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  Send
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsListModal;
