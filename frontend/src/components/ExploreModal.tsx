import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService, friendsService } from '../services/api';
import './ExploreModal.css';

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

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExploreModal = ({ isOpen, onClose }: ExploreModalProps) => {
  const [reviews, setReviews] = useState<FriendReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFriends, setHasFriends] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setLoading(true);
      setHasFriends(true);
      setReviews([]);
      loadFriendsReviews();
    } else {
      // Reset state when modal closes
      setLoading(false);
      setHasFriends(true);
      setReviews([]);
    }
  }, [isOpen]);

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

  const handleViewProfile = (userId: number) => {
    navigate(`/app/profile/${userId}`);
    onClose();
  };

  const handleViewWashroom = (washroomId: number) => {
    navigate(`/app/map`);
    onClose();
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

  if (!isOpen) return null;

  console.log('ExploreModal rendering, isOpen:', isOpen, 'loading:', loading, 'hasFriends:', hasFriends, 'reviews:', reviews.length);

  return (
    <div className="explore-modal-overlay" onClick={onClose}>
      <div className="explore-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="explore-modal-header">
          <h2>Explore Friends' Reviews</h2>
          <button className="explore-close-btn" onClick={onClose}>✕</button>
        </div>

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
              onClick={() => {
                navigate('/app/profile');
                onClose();
              }}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreModal;
