import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService, commentService, likeService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './RecentPosts.css';

interface Review {
  id: number;
  washroom_id: number;
  washroom_name: string;
  building: string | null;
  overall_rating: number | string;
  comment: string | null;
  created_at: string;
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

const RecentPosts = ({ userId }: { userId: number }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [likes, setLikes] = useState<Record<number, { count: number; liked: boolean }>>({});
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadUserReviews();
  }, [userId]);

  const loadUserReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await reviewService.getUserReviews(userId);
      const reviewsList = reviewsData?.reviews || [];
      setReviews(reviewsList.slice(0, 10)); // Show last 10 reviews

      // Load like counts and status for all reviews
      if (reviewsList.length > 0) {
        const likesPromises = reviewsList.slice(0, 10).map(async (review: Review) => {
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
      console.error('Failed to load user reviews:', error);
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
      if (newComment && newComment.id) {
        setComments({
          ...comments,
          [reviewId]: [...(comments[reviewId] || []), newComment],
        });
        setCommentTexts({ ...commentTexts, [reviewId]: '' });
      }
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      alert(error.response?.data?.error || error.message || 'Failed to add comment. Please try again.');
    }
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

  if (loading) {
    return (
      <div className="recent-posts-section">
        <h2 className="recent-posts-header">Your Recent Posts</h2>
        <div className="recent-posts-loading">Loading posts...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="recent-posts-section">
        <h2 className="recent-posts-header">Recent Posts</h2>
        <p className="recent-posts-empty">No reviews yet. Start reviewing washrooms to see your posts here!</p>
      </div>
    );
  }

  return (
    <div className="recent-posts-section">
      <h2 className="recent-posts-header">Recent Posts</h2>
      <div className="recent-posts-list">
        {reviews.map((review) => {
          const reviewRating = getRating(review.overall_rating);
          const reviewColor = getRatingColor(reviewRating);
          return (
            <div key={review.id} className="recent-post-card">
              <div className="recent-post-header">
                <div className="recent-post-washroom">
                  <h4 onClick={() => navigate(`/app/map`)}>🚽 {review.washroom_name}</h4>
                  {review.building && <p>{review.building}</p>}
                </div>
                <div className="recent-post-rating" style={{ color: reviewColor }}>
                  ⭐ {reviewRating > 0 ? reviewRating.toFixed(1) : 'N/A'}
                </div>
              </div>
              {review.comment && (
                <p className="recent-post-comment">"{review.comment}"</p>
              )}
              <div className="recent-post-footer">
                <span className="recent-post-date">{formatDate(review.created_at)}</span>
                <div className="recent-post-actions">
                  <button
                    className={`recent-post-like-button ${likes[review.id]?.liked ? 'liked' : ''}`}
                    onClick={() => handleLike(review.id)}
                    disabled={loadingLikes.has(review.id)}
                  >
                    {likes[review.id]?.liked ? '❤️' : '🤍'} {likes[review.id]?.count || 0}
                  </button>
                  <button
                    className="recent-post-comment-button"
                    onClick={() => toggleReviewExpanded(review.id)}
                  >
                    💬 {comments[review.id]?.length || 0}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedReviews.has(review.id) && (
                <div className="recent-post-comments-section">
                  {loadingComments.has(review.id) ? (
                    <div className="recent-post-loading-comments">Loading comments...</div>
                  ) : (
                    <>
                      <div className="recent-post-comments-list">
                        {comments[review.id] && comments[review.id].length > 0 ? (
                          comments[review.id].map((comment) => (
                            <div key={comment.id} className="recent-post-comment-item">
                              <div className="recent-post-comment-user">
                                {comment.avatar ? (
                                  <img src={comment.avatar} alt={comment.username} className="recent-post-comment-avatar" />
                                ) : (
                                  <div className="recent-post-comment-avatar-placeholder">
                                    {comment.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="recent-post-comment-username">{comment.username}</span>
                              </div>
                              <p className="recent-post-comment-text">{comment.comment_text}</p>
                              <span className="recent-post-comment-time">{formatDate(comment.created_at)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="recent-post-no-comments">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                      {user && (
                        <div className="recent-post-add-comment">
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
                            className="recent-post-comment-input"
                          />
                          <button
                            onClick={() => handleAddComment(review.id)}
                            className="recent-post-comment-submit"
                            disabled={!commentTexts[review.id]?.trim()}
                          >
                            Post
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentPosts;
