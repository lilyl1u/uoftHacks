import { useState } from 'react';
import { reviewService } from '../services/api';
import './Modal.css';

interface Washroom {
  id: number;
  name: string;
  building: string | null;
}

interface RatingModalProps {
  washroom: Washroom;
  onClose: () => void;
  onSubmit: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  washroom,
  onClose,
  onSubmit,
}) => {
  const [cleanliness, setCleanliness] = useState(3);
  const [waitTime, setWaitTime] = useState(3);
  const [accessibility, setAccessibility] = useState(3);
  const [comment, setComment] = useState('');
  const [toiletries, setToiletries] = useState({
    soap: false,
    toilet_paper: false,
    paper_towels: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await reviewService.create({
        washroom_id: washroom.id,
        cleanliness_rating: cleanliness,
        privacy_rating: 3, // Default privacy rating since not in form
        wait_time_rating: waitTime,
        accessibility_rating: accessibility,
        comment: comment || null,
        toiletries_available: toiletries,
      });
      setShowSuccess(true);
      setLoading(false);
      // Don't call onSubmit() here - it closes the modal immediately
      // We'll call it when the success modal is closed
    } catch (err: any) {
      console.error('Review submission error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit review');
      setLoading(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => (
    <div className="rating-group">
      <label>{label}</label>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= value ? 'active' : ''}`}
            onClick={() => onChange(star)}
          >
            🚽
          </button>
        ))}
        <span className="rating-value">{value}/5</span>
      </div>
    </div>
  );

  return (
    <>
      {showSuccess && (
        <div className="modal-overlay" onClick={() => {
          onSubmit(); // Call onSubmit when closing success modal
          onClose();
        }}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-success-modal" onClick={() => {
              onSubmit(); // Call onSubmit when closing success modal
              onClose();
            }}>✕</button>
            <div className="success-modal-content">
              <div className="success-icon-large">✓</div>
              <h2>Review Submitted!</h2>
              <p>Thank you for your feedback</p>
            </div>
          </div>
        </div>
      )}
      {!showSuccess && (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Rate {washroom.name}</h2>
            {washroom.building && <p>{washroom.building}</p>}
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

          <StarRating
            value={cleanliness}
            onChange={setCleanliness}
            label="Cleanliness"
          />
          <StarRating
            value={waitTime}
            onChange={setWaitTime}
            label="Wait Time"
          />
          <StarRating
            value={accessibility}
            onChange={setAccessibility}
            label="Accessibility"
          />

          <div className="form-group">
            <label>Toiletries Available</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={toiletries.soap}
                  onChange={(e) =>
                    setToiletries({ ...toiletries, soap: e.target.checked })
                  }
                />
                Soap
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={toiletries.toilet_paper}
                  onChange={(e) =>
                    setToiletries({
                      ...toiletries,
                      toilet_paper: e.target.checked,
                    })
                  }
                />
                Toilet Paper
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={toiletries.paper_towels}
                  onChange={(e) =>
                    setToiletries({
                      ...toiletries,
                      paper_towels: e.target.checked,
                    })
                  }
                />
                Paper Towels
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comment (optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience..."
            />
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
      )}
    </>
  );
};

export default RatingModal;
