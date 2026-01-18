import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService, friendsService, commentService, likeService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ExplorePage.css';

interface FriendReview {
  id: number;
  washroom_id: number;
  washroom_name: string;
  building: string | null;
  latitude: number;
  longitude: number;
  overall_rating: number | string; // Can be string from DB
  comment: string | null;
  created_at: string;
  user_id: number;
  username: string;
  avatar: string | null;
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

const ExplorePage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<FriendReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFriends, setHasFriends] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [likes, setLikes] = useState<Record<number, { count: number; liked: boolean }>>({});
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadFriendsReviews();
  }, []);

  const loadFriendsReviews = async () => {
    try {
      setLoading(true);
      setHasFriends(true);
      setReviews([]);
      
      // First check if user has friends
      const friends = await friendsService.getFriends();
      console.log('Friends loaded:', friends);
      
      if (!friends || friends.length === 0) {
        setHasFriends(false);
        setLoading(false);
        return;
      }
      
      // Get friends' reviews
      const reviewsData = await reviewService.getFriendsReviews();
      console.log('Friends reviews loaded:', reviewsData);
      setReviews(reviewsData || []);
      
      // Load like counts and status for all reviews
      if (reviewsData && reviewsData.length > 0) {
        const likesPromises = reviewsData.map(async (review) => {
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
    } catch (error: any) {
      console.error('Failed to load friends reviews:', error);
      console.error('Error details:', error.response?.data || error.message);
      // If error getting friends, assume no friends
      if (error.response?.status === 404 || error.response?.status === 401) {
        setHasFriends(false);
      }
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

  const handleViewProfile = (userId: number) => {
    navigate(`/app/profile/${userId}`);
  };

  const handleViewWashroom = (washroomId: number) => {
    navigate(`/app/map`);
    // Could scroll to washroom on map, but for now just navigate
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

  return (
    <div className="explore-page">
      <div className="explore-page-header">
        <h1>Explore Friends' Reviews</h1>
        <button 
          className="explore-back-button"
          onClick={() => navigate('/app/map')}
        >
          ← Back to Map
        </button>
      </div>

      <div className="explore-page-content">
        {loading && (
          <div className="explore-loading">Loading friends' reviews...</div>
        )}

        {!loading && !hasFriends && (
          <div className="explore-empty">
            <div className="explore-empty-icon">👥</div>
            <h3>No Friends Yet</h3>
            <p>Start following people to see their washroom reviews here!</p>
            <button 
              className="explore-find-friends-btn"
              onClick={() => navigate('/app/profile')}
            >
              Find Friends
            </button>
          </div>
        )}

        {!loading && hasFriends && reviews.length === 0 && (
          <div className="explore-empty">
            <div className="explore-empty-icon">📝</div>
            <h3>No Reviews Yet</h3>
            <p>Your friends haven't reviewed any washrooms yet. Check back later!</p>
          </div>
        )}

        {!loading && hasFriends && reviews.length > 0 && (
          <div className="explore-reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="explore-review-card">
                <div className="explore-review-header">
                  <div 
                    className="explore-review-user"
                    onClick={() => handleViewProfile(review.user_id)}
                  >
                    <div className="explore-review-avatar">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.username} />
                      ) : (
                        <div className="explore-avatar-placeholder">
                          {review.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="explore-review-user-info">
                      <h4>{review.username}</h4>
                      <span className="explore-review-time">{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                  <div className="explore-review-rating">
                    ⭐ {getRating(review.overall_rating).toFixed(1)}
                  </div>
                </div>
                
                <div 
                  className="explore-review-washroom"
                  onClick={() => handleViewWashroom(review.washroom_id)}
                >
                  <h5>🚽 {review.washroom_name}</h5>
                  {review.building && (
                    <p className="explore-washroom-location">{review.building}</p>
                  )}
                </div>

                {review.comment && (
                  <p className="explore-review-comment">"{review.comment}"</p>
                )}

                {/* Like and Comment Section */}
                <div className="explore-review-actions">
                  <button
                    className={`explore-like-button ${likes[review.id]?.liked ? 'liked' : ''}`}
                    onClick={() => handleLike(review.id)}
                    disabled={loadingLikes.has(review.id)}
                  >
                    {likes[review.id]?.liked ? '❤️' : '🤍'} {likes[review.id]?.count || 0}
                  </button>
                  <button
                    className="explore-comment-button"
                    onClick={() => toggleReviewExpanded(review.id)}
                  >
                    💬 {comments[review.id]?.length || 0}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedReviews.has(review.id) && (
                  <div className="explore-comments-section">
                    {loadingComments.has(review.id) ? (
                      <div className="explore-loading-comments">Loading comments...</div>
                    ) : (
                      <>
                        <div className="explore-comments-list">
                          {comments[review.id] && comments[review.id].length > 0 ? (
                            comments[review.id].map((comment) => (
                              <div key={comment.id} className="explore-comment-item">
                                <div className="explore-comment-user">
                                  {comment.avatar ? (
                                    <img src={comment.avatar} alt={comment.username} className="explore-comment-avatar" />
                                  ) : (
                                    <div className="explore-comment-avatar-placeholder">
                                      {comment.username.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="explore-comment-username">{comment.username}</span>
                                </div>
                                <p className="explore-comment-text">{comment.comment_text}</p>
                                <span className="explore-comment-time">{formatDate(comment.created_at)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="explore-no-comments">No comments yet. Be the first to comment!</p>
                          )}
                        </div>
                        <div className="explore-add-comment">
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
                            className="explore-comment-input"
                          />
                          <button
                            onClick={() => handleAddComment(review.id)}
                            className="explore-comment-submit"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
