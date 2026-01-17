import { useState, useEffect } from 'react';
import { washroomService, reviewService } from '../services/api';
import RatingModal from '../components/RatingModal';
import AddWashroomModal from '../components/AddWashroomModal';
import './MapPage.css';

interface Washroom {
  id: number;
  name: string;
  building: string | null;
  floor: number | null;
  latitude: number;
  longitude: number;
  average_rating: number;
  total_reviews: number;
  accessibility: boolean;
  paid_access: boolean;
}

const MapPage = () => {
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [selectedWashroom, setSelectedWashroom] = useState<Washroom | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWashrooms();
  }, []);

  const loadWashrooms = async () => {
    try {
      const data = await washroomService.getAll();
      setWashrooms(data.washrooms || []);
    } catch (error) {
      console.error('Failed to load washrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWashroomClick = (washroom: Washroom) => {
    setSelectedWashroom(washroom);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    await loadWashrooms();
    setShowRatingModal(false);
    setSelectedWashroom(null);
  };

  const handleAddWashroom = async () => {
    await loadWashrooms();
    setShowAddModal(false);
  };

  if (loading) {
    return <div className="map-container">Loading washrooms...</div>;
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>UofT Washroom Map</h1>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          + Add Washroom
        </button>
      </div>

      <div className="map-content">
        <div className="map-placeholder">
          <p>🗺️ Map integration coming soon!</p>
          <p className="map-note">
            You can integrate Google Maps, Mapbox, or Leaflet here
          </p>
        </div>

        <div className="washrooms-list">
          <h2>Washrooms ({washrooms.length})</h2>
          {washrooms.length > 0 ? (
            <div className="washroom-cards">
              {washrooms.map((washroom) => (
                <div
                  key={washroom.id}
                  className="washroom-card"
                  onClick={() => handleWashroomClick(washroom)}
                >
                  <div className="washroom-header">
                    <h3>{washroom.name}</h3>
                    <div className="rating-badge">
                      ⭐ {washroom.average_rating.toFixed(1)} ({washroom.total_reviews})
                    </div>
                  </div>
                  {washroom.building && (
                    <p className="washroom-location">
                      {washroom.building}
                      {washroom.floor !== null && ` - Floor ${washroom.floor}`}
                    </p>
                  )}
                  <div className="washroom-tags">
                    {washroom.accessibility && (
                      <span className="tag accessibility">♿ Accessible</span>
                    )}
                    {washroom.paid_access && (
                      <span className="tag paid">💰 Paid Access</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-washrooms">No washrooms found. Be the first to add one!</p>
          )}
        </div>
      </div>

      {showRatingModal && selectedWashroom && (
        <RatingModal
          washroom={selectedWashroom}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedWashroom(null);
          }}
          onSubmit={handleRatingSubmit}
        />
      )}

      {showAddModal && (
        <AddWashroomModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddWashroom}
        />
      )}
    </div>
  );
};

export default MapPage;
