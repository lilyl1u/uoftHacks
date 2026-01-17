import { useState } from 'react';
import { washroomService } from '../services/api';
import './Modal.css';

interface AddWashroomModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const AddWashroomModal: React.FC<AddWashroomModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [accessibility, setAccessibility] = useState(false);
  const [paidAccess, setPaidAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !latitude || !longitude) {
      setError('Name, latitude, and longitude are required');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid latitude or longitude');
      return;
    }

    setLoading(true);

    try {
      await washroomService.create({
        name,
        building: building || null,
        floor: floor ? parseInt(floor) : null,
        latitude: lat,
        longitude: lng,
        accessibility,
        paid_access: paidAccess,
      });
      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add washroom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Washroom</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Washroom Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Main Floor Men's Washroom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="building">Building</label>
            <input
              type="text"
              id="building"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="e.g., Robarts Library"
            />
          </div>

          <div className="form-group">
            <label htmlFor="floor">Floor</label>
            <input
              type="number"
              id="floor"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g., 1"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude *</label>
              <input
                type="number"
                step="any"
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                placeholder="e.g., 43.6532"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude *</label>
              <input
                type="number"
                step="any"
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                placeholder="e.g., -79.3832"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={accessibility}
                onChange={(e) => setAccessibility(e.target.checked)}
              />
              Accessible (Wheelchair accessible)
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={paidAccess}
                onChange={(e) => setPaidAccess(e.target.checked)}
              />
              Paid Access Required
            </label>
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Adding...' : 'Add Washroom'}
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
  );
};

export default AddWashroomModal;
