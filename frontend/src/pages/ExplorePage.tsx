import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reviewService } from '../services/api';
import './ExplorePage.css';

interface FriendReview {
  id: number;
  username: string;
  rating: number;
  comment: string;
  washroom_name: string;
  building: string;
  created_at: string;
}

const ExplorePage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<FriendReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadFriendReviews();
    }
  }, [user]);

  const loadFriendReviews = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch all reviews and display them
      // In the future, this could filter by friends
      const allReviews = await reviewService.getAllReviews?.() || [];
      
      // Sort by most recent and limit to latest reviews
      const sortedReviews = allReviews
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);
      
      setReviews(sortedReviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return '🚽'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h1>Explore Reviews</h1>
        <p>Discover what your friends are saying about washrooms</p>
      </div>

      {loading ? (
        <div className="loading">Loading reviews...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <h3 className="reviewer-name">{review.username}</h3>
                  <p className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="review-rating">{renderStars(review.rating)}</div>
              </div>

              <div className="washroom-info">
                <h4 className="washroom-name">{review.washroom_name}</h4>
                <p className="washroom-building">{review.building}</p>
              </div>

              <div className="review-comment">
                <p>{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
