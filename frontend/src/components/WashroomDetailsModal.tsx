import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { washroomService, reviewService, commentService, likeService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './WashroomDetailsModal.css';

interface Washroom {
  id: number;
  name: string;
  building: string | null;
  floor: number | null;
  latitude: number;
  longitude: number;
  campus?: string;
  average_rating: number | string | null;
  total_reviews: number;
  accessibility: boolean;
  paid_access: boolean;
}

interface FriendReview {
  id: number;
  user_id: number;
  username: string;
  avatar: string | null;
  overall_rating: number | string;
  comment: string | null;
  created_at: string;
}

interface UserReview {
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

interface WashroomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  washroomId: number;
}

const WashroomDetailsModal: React.FC<WashroomDetailsModalProps> = ({
  isOpen,
  onClose,
  washroomId,
}) => {
  const { user } = useAuth();
  const [washroom, setWashroom] = useState<Washroom | null>(null);
  const [friendsReviews, setFriendsReviews] = useState<FriendReview[]>([]);
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [likes, setLikes] = useState<Record<number, { count: number; liked: boolean }>>({});
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen && washroomId) {
      loadWashroomDetails();
    }
  }, [isOpen, washroomId]);

  const loadWashroomDetails = async () => {
    try {
      setLoading(true);
      const [washroomData, reviewsData, allReviewsData] = await Promise.all([
        washroomService.getById(washroomId),
        reviewService.getFriendsReviewsByWashroom(washroomId),
        reviewService.getByWashroom(washroomId),
      ]);
      setWashroom(washroomData.washroom);
      setFriendsReviews(reviewsData || []);
      
      // Find user's own review from all reviews
      let ownReview: UserReview | null = null;
      if (user && allReviewsData?.reviews) {
        const found = allReviewsData.reviews.find((r: any) => r.user_id === user.id);
        if (found) {
          ownReview = found;
        }
      }
      setUserReview(ownReview);
      
      // Load like counts and status for all reviews (friends + user's own)
      const allReviews = [...(reviewsData || []), ...(ownReview ? [ownReview] : [])];
      if (allReviews.length > 0) {
        const likesPromises = allReviews.map(async (review) => {
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
      console.error('Failed to load washroom details:', error);
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
      console.error(`Failed to ${likes[reviewId]?.liked ? 'unlike' : 'like'} review:`, error);
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
      // Ensure the comment has the expected structure
      if (newComment && newComment.id) {
        setComments({
          ...comments,
          [reviewId]: [...(comments[reviewId] || []), newComment],
        });
        setCommentTexts({ ...commentTexts, [reviewId]: '' });
      } else {
        console.error('Invalid comment response:', newComment);
      }
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      alert(error.response?.data?.error || error.message || 'Failed to add comment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRating = (rating: any): number => {
    if (rating == null || rating === '') return 0;
    const num = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
    return isNaN(num) ? 0 : num;
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.0) return '#2ECC71'; // Green
    if (rating >= 2.5) return '#F39C12'; // Orange
    if (rating > 0) return '#E74C3C'; // Red
    return '#95a5a6'; // Gray
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="washroom-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!washroom) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="washroom-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-error">Washroom not found</div>
        </div>
      </div>
    );
  }

  const rating = getRating(washroom.average_rating);
  const ratingColor = getRatingColor(rating);

  return (
    <div className="modal-overlay" onClick={onClose}>
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
                center={[washroom.latitude, washroom.longitude]}
                zoom={17}
                style={{ height: '300px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{s}.png"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WashroomDetailsModal;
