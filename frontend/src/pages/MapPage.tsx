import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { washroomService } from '../services/api';
import RatingModal from '../components/RatingModal';
import AddWashroomModal from '../components/AddWashroomModal';
import WashroomDetailsModal from '../components/WashroomDetailsModal';
import './MapPage.css';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MapPage error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="map-container" style={{ padding: '2rem' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An error occurred'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface Washroom {
  id: number;
  name: string;
  building: string | null;
  floor: number | null;
  latitude: number;
  longitude: number;
  average_rating: number | string | null; // Can be string from DB
  total_reviews: number;
  accessibility: boolean;
  paid_access: boolean;
}

const MapPage = () => {
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [selectedWashroom, setSelectedWashroom] = useState<Washroom | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to safely convert rating to number
  const getRating = (rating: any): number => {
    if (rating == null || rating === '') return 0;
    const num = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
    return isNaN(num) ? 0 : num;
  };

  // Create custom washroom icon based on rating and accessibility
  const createWashroomIcon = (rating: number | string | null, isAccessible: boolean) => {
    const numRating = getRating(rating);
    // Choose emoji/color based on rating
    let emoji = '🚽'; // Default
    let bgColor = '#4A90E2'; // Blue
    
    if (isAccessible) {
      emoji = '♿';
      bgColor = '#9B59B6'; // Purple for accessible
    } else if (numRating >= 4.5) {
      emoji = '🚽';
      bgColor = '#2ECC71'; // Green for high rating
    } else if (numRating >= 3.5) {
      emoji = '🚽';
      bgColor = '#F39C12'; // Orange for medium rating
    } else if (numRating > 0) {
      emoji = '🚽';
      bgColor = '#E74C3C'; // Red for low rating
    }

    return new DivIcon({
      className: 'custom-washroom-icon',
      html: `
        <div style="
          background-color: ${bgColor};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${emoji}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  useEffect(() => {
    loadWashrooms();
  }, []);

  const loadWashrooms = async () => {
    try {
      const data = await washroomService.getAll();
      const washroomsList = data.washrooms || [];
      console.log('Loaded washrooms:', washroomsList);
      console.log('Number of washrooms:', washroomsList.length);
      
      // Filter out washrooms with invalid coordinates and normalize types
      const validWashrooms = washroomsList.filter(
        (w: Washroom) => {
          const lat = typeof w.latitude === 'string' ? parseFloat(w.latitude) : w.latitude;
          const lng = typeof w.longitude === 'string' ? parseFloat(w.longitude) : w.longitude;
          return lat != null && 
                 lng != null && 
                 !isNaN(lat) && 
                 !isNaN(lng) &&
                 lat >= -90 && lat <= 90 &&
                 lng >= -180 && lng <= 180;
        }
      ).map((w: Washroom) => ({
        ...w,
        latitude: typeof w.latitude === 'string' ? parseFloat(w.latitude) : w.latitude,
        longitude: typeof w.longitude === 'string' ? parseFloat(w.longitude) : w.longitude,
      }));
      
      if (validWashrooms.length !== washroomsList.length) {
        console.warn(`Filtered out ${washroomsList.length - validWashrooms.length} washrooms with invalid coordinates`);
      }
      
      setWashrooms(validWashrooms);
    } catch (error) {
      console.error('Failed to load washrooms:', error);
      setWashrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWashroomClick = (washroom: Washroom) => {
    setSelectedWashroom(washroom);
    setShowDetailsModal(true);
  };

  const handleReviewButtonClick = (washroom: Washroom) => {
    setSelectedWashroom(washroom);
    setShowReviewModal(false);
    setShowRatingModal(true);
  };

  const handleAddReviewFromDetails = () => {
    if (selectedWashroom) {
      setShowDetailsModal(false);
      setShowRatingModal(true);
    }
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
    return (
      <div className="map-container">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading washrooms...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="map-container">
      <div className="map-header">
        <h1>UofT Washroom Map</h1>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          + Add Washroom
        </button>
      </div>

      <div className="map-content">
        <div className="map-wrapper" style={{ position: 'relative' }}>
          {washrooms.length === 0 && !loading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 1000,
              textAlign: 'center',
              maxWidth: '300px',
            }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#2c3e50' }}>
                🗺️ No washrooms yet
              </p>
              <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '1rem' }}>
                Click "+ Add Washroom" to add the first washroom to the map!
              </p>
              <p style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
                Map centered on UofT campus<br />
                (43.6629, -79.3957)
              </p>
            </div>
          )}
          <MapContainer 
            center={[43.6629, -79.3957]} // UofT campus coordinates
            zoom={15} 
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {washrooms.map((washroom) => (
              <Marker 
                key={washroom.id} 
                position={[washroom.latitude, washroom.longitude]}
                icon={createWashroomIcon(washroom.average_rating, washroom.accessibility)}
                eventHandlers={{
                  click: () => handleWashroomClick(washroom),
                }}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{washroom.name}</h4>
                    {washroom.building && (
                      <p>{washroom.building}
                      {washroom.floor !== null && ` - Floor ${washroom.floor}`}</p>
                    )}
                    <div className="popup-rating">
                      ⭐ {getRating(washroom.average_rating).toFixed(1)} ({washroom.total_reviews} reviews)
                    </div>
                    <div className="popup-tags">
                      {washroom.accessibility && <span className="tag">♿ Accessible</span>}
                      {washroom.paid_access && <span className="tag">💰 Paid</span>}
                    </div>
                    <button 
                      onClick={() => handleWashroomClick(washroom)}
                      className="popup-button"
                    >
                      Rate This Washroom
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="washrooms-list">
          <h2>Washrooms ({washrooms.length})</h2>
          {!loading && washrooms.length === 0 ? (
            <div>
              <p className="no-washrooms">No washrooms found. Be the first to add one!</p>
              <p style={{ fontSize: '0.9rem', color: '#95a5a6', marginTop: '1rem' }}>
                Click the "+ Add Washroom" button to add a washroom to the map.
              </p>
            </div>
          ) : washrooms.length > 0 ? (
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
                      ⭐ {getRating(washroom.average_rating).toFixed(1)} ({washroom.total_reviews})
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
          ) : null}
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

      {showDetailsModal && selectedWashroom && (
        <WashroomDetailsModal
          washroom={selectedWashroom}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedWashroom(null);
          }}
          onAddReview={handleAddReviewFromDetails}
        />
      )}

      {showAddModal && (
        <AddWashroomModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddWashroom}
        />
      )}

      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select a Washroom to Review</h2>
            {washrooms.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                No washrooms available. Add one first!
              </p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {washrooms.map((washroom) => (
                  <div
                    key={washroom.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #ecf0f1',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f7fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleReviewButtonClick(washroom)}
                  >
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#2c3e50' }}>
                      {washroom.name}
                    </h4>
                    {washroom.building && (
                      <p style={{ margin: '0', fontSize: '0.9rem', color: '#7f8c8d' }}>
                        {washroom.building}
                        {washroom.floor !== null && ` - Floor ${washroom.floor}`}
                      </p>
                    )}
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
                      ⭐ {getRating(washroom.average_rating).toFixed(1)} ({washroom.total_reviews} reviews)
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button
                onClick={() => setShowReviewModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default MapPage;
