import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { washroomService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RatingModal from '../components/RatingModal';
import ReviewsListModal from '../components/ReviewsListModal';
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
  campus?: string;
  average_rating: number | string | null; // Can be string from DB
  total_reviews: number;
  accessibility: boolean;
  paid_access: boolean;
}

type Campus = 'UofT' | 'Waterloo';

const MapPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [selectedWashroom, setSelectedWashroom] = useState<Washroom | null>(null);
<<<<<<< HEAD
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
=======
  const [showReviewsListModal, setShowReviewsListModal] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
>>>>>>> 098c751d51aa836361af314dcc1b4f826a8c259e
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buildingSearch, setBuildingSearch] = useState('');
  const [addReviewSearch, setAddReviewSearch] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<Campus>('UofT');

  // Helper function to safely convert rating to number
  const getRating = (rating: any): number => {
    if (rating == null || rating === '') return 0;
    const num = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
    return isNaN(num) ? 0 : num;
  };

  // Create custom washroom icon based on rating and accessibility
  const createWashroomIcon = (rating: number | string | null, isAccessible: boolean) => {
    const numRating = getRating(rating);
    // Choose emoji/color based on rating (beli-style: green/orange/red)
    let emoji = '🚽'; // Default
    let bgColor = '#95a5a6'; // Gray for no rating
    
    // Color coding based on average rating
    if (numRating >= 4.0) {
      bgColor = '#2ECC71'; // Green for high rating (4.0+)
    } else if (numRating >= 2.5) {
      bgColor = '#F39C12'; // Orange for medium rating (2.5-3.9)
    } else if (numRating > 0) {
      bgColor = '#E74C3C'; // Red for low rating (< 2.5)
    }
    
    // Accessible washrooms get a wheelchair icon but keep rating color
    if (isAccessible) {
      emoji = '♿';
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
  }, [selectedCampus]);

  useEffect(() => {
    // Add class to body to show footer on map page
    document.body.classList.add('map-page-active');
    return () => {
      document.body.classList.remove('map-page-active');
    };
  }, []);

  const loadWashrooms = async () => {
    try {
      const data = await washroomService.getAll(selectedCampus);
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
<<<<<<< HEAD
    setShowDetailsModal(true);
  };

  const handleReviewButtonClick = (washroom: Washroom) => {
    setSelectedWashroom(washroom);
    setShowReviewModal(false);
    setShowRatingModal(true);
=======
    setShowReviewsListModal(true);
  };

  const handleAddReviewClick = () => {
    setSelectedWashroom(null);
    setAddReviewSearch('');
    setShowAddReviewModal(true);
>>>>>>> 098c751d51aa836361af314dcc1b4f826a8c259e
  };

  const handleAddReviewFromDetails = () => {
    if (selectedWashroom) {
      setShowDetailsModal(false);
      setShowRatingModal(true);
    }
  };

  const handleRatingSubmit = async () => {
    await loadWashrooms();
    setShowAddReviewModal(false);
    setSelectedWashroom(null);
  };

  const handleAddWashroom = async () => {
    try {
      await loadWashrooms();
      setShowAddModal(false);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to add washrooms.');
      } else {
        setError('Failed to add washroom');
      }
    }
  };

  // Get map center based on campus
  const getMapCenter = (): [number, number] => {
    if (selectedCampus === 'Waterloo') {
      return [43.4723, -80.5449]; // University of Waterloo coordinates
    }
    return [43.6629, -79.3957]; // UofT campus coordinates
  };

  // Filter washrooms by building search
  const filteredWashrooms = washrooms.filter((washroom) => {
    if (!buildingSearch.trim()) return true;
    const searchLower = buildingSearch.toLowerCase().trim();
    const building = washroom.building?.toLowerCase() || '';
    return building.includes(searchLower);
  });

  const filteredWashroomsForReview = washrooms.filter((washroom) => {
    if (!addReviewSearch.trim()) return true;
    const searchLower = addReviewSearch.toLowerCase().trim();
    const building = washroom.building?.toLowerCase() || '';
    const name = washroom.name?.toLowerCase() || '';
    return building.includes(searchLower) || name.includes(searchLower);
  });

  const handleDeleteWashroom = async (washroomId: number) => {
    if (!window.confirm('Are you sure you want to delete this washroom? This action cannot be undone.')) {
      return;
    }

    try {
      await washroomService.delete(washroomId);
      await loadWashrooms();
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to delete washrooms. Admin access required.');
      } else {
        setError('Failed to delete washroom');
      }
    }
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
        <div className="map-header-left">
          <h1>
            <select 
              value={selectedCampus} 
              onChange={(e) => setSelectedCampus(e.target.value as Campus)}
              className="campus-selector"
            >
              <option value="UofT">UofT Washroom Map</option>
              <option value="Waterloo">Waterloo Washroom Map</option>
            </select>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isAuthenticated && (
            <>
              <button onClick={handleAddReviewClick} className="add-button" style={{ background: '#27ae60' }}>
                + Add Review
              </button>
              <button onClick={() => setShowAddModal(true)} className="add-button">
                + Add Washroom
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <div style={{
          background: '#e74c3c',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          margin: '1rem',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{
              marginLeft: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

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
                Map centered on {selectedCampus === 'Waterloo' ? 'University of Waterloo' : 'UofT'} campus
              </p>
            </div>
          )}
          <MapContainer 
            center={getMapCenter()}
            zoom={15} 
            style={{ height: '500px', width: '100%' }}
            key={selectedCampus} // Force remount when campus changes
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
                    {isAdmin() && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWashroom(washroom.id);
                        }}
                        className="popup-button"
                        style={{
                          background: '#e74c3c',
                          marginTop: '0.5rem'
                        }}
                      >
                        Delete Washroom
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="washrooms-list">
          <h2>
            Washrooms ({filteredWashrooms.length}
            {buildingSearch.trim() && filteredWashrooms.length !== washrooms.length && (
              <span style={{ color: '#7f8c8d', fontSize: '0.9rem', fontWeight: 'normal' }}>
                {' '}of {washrooms.length}
              </span>
            )})
          </h2>
          
          {/* Building Search */}
          <div className="washroom-search-container">
            <input
              type="text"
              className="washroom-search-input"
              placeholder="Search by building name..."
              value={buildingSearch}
              onChange={(e) => setBuildingSearch(e.target.value)}
            />
          </div>

          {!loading && washrooms.length === 0 ? (
            <div>
              <p className="no-washrooms">No washrooms found. Be the first to add one!</p>
              <p style={{ fontSize: '0.9rem', color: '#95a5a6', marginTop: '1rem' }}>
                Click the "+ Add Washroom" button to add a washroom to the map.
              </p>
            </div>
          ) : filteredWashrooms.length > 0 ? (
            <div className="washroom-cards">
              {filteredWashrooms.map((washroom) => {
                const rating = getRating(washroom.average_rating);
                let borderColor = '#95a5a6'; // Gray for no rating
                if (rating >= 4.0) {
                  borderColor = '#2ECC71'; // Green
                } else if (rating >= 2.5) {
                  borderColor = '#F39C12'; // Orange
                } else if (rating > 0) {
                  borderColor = '#E74C3C'; // Red
                }
                
                return (
                <div
                  key={washroom.id}
                  className="washroom-card"
                  style={{ borderLeftColor: borderColor }}
                  onClick={() => handleWashroomClick(washroom)}
                >
                  <div className="washroom-header">
                    <h3>{washroom.name}</h3>
                    <div 
                      className="rating-badge"
                      style={{ 
                        background: borderColor,
                        color: 'white'
                      }}
                    >
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
                );
              })}
            </div>
          ) : buildingSearch.trim() && washrooms.length > 0 ? (
            <div className="no-search-results">
              <p>No washrooms found in "{buildingSearch}"</p>
              <p style={{ fontSize: '0.9rem', color: '#95a5a6', marginTop: '0.5rem' }}>
                Try searching for a different building name
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {showReviewsListModal && selectedWashroom && (
        <ReviewsListModal
          washroom={selectedWashroom}
          onClose={() => {
            setShowReviewsListModal(false);
            setSelectedWashroom(null);
          }}
        />
      )}

      {showAddReviewModal && selectedWashroom && (
        <RatingModal
          washroom={selectedWashroom}
          onClose={() => {
            setShowAddReviewModal(false);
            setSelectedWashroom(null);
          }}
          onSubmit={handleRatingSubmit}
        />
      )}

<<<<<<< HEAD
      {showDetailsModal && selectedWashroom && (
        <WashroomDetailsModal
          washroom={selectedWashroom}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedWashroom(null);
          }}
          onAddReview={handleAddReviewFromDetails}
        />
=======
      {showAddReviewModal && !selectedWashroom && (
        <div className="modal-overlay" onClick={() => setShowAddReviewModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add a Review</h2>
              <p>Select a washroom to review</p>
            </div>

            {/* Search Input */}
            <div className="washroom-search-container" style={{ margin: '1rem' }}>
              <input
                type="text"
                className="washroom-search-input"
                placeholder="Search by building or washroom name..."
                value={addReviewSearch}
                onChange={(e) => setAddReviewSearch(e.target.value)}
              />
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
              {washrooms.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
                  No washrooms available to review yet.
                </p>
              ) : filteredWashroomsForReview.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
                  No washrooms found matching "{addReviewSearch}". Try a different search.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                  {filteredWashroomsForReview.map((washroom) => (
                    <div
                      key={washroom.id}
                      onClick={() => setSelectedWashroom(washroom)}
                      style={{
                        padding: '1rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: '#f8f9fa',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3498db';
                        e.currentTarget.style.background = '#ecf0f1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.background = '#f8f9fa';
                      }}
                    >
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{washroom.name}</h3>
                      {washroom.building && (
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#7f8c8d' }}>
                          {washroom.building}
                          {washroom.floor !== null && ` - Floor ${washroom.floor}`}
                        </p>
                      )}
                      <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#95a5a6' }}>
                        ⭐ {getRating(washroom.average_rating).toFixed(1)} ({washroom.total_reviews} reviews)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowAddReviewModal(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
>>>>>>> 098c751d51aa836361af314dcc1b4f826a8c259e
      )}

      {showAddModal && (
        <AddWashroomModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddWashroom}
          campus={selectedCampus}
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
