import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { washroomService } from '../services/api';
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

  // Fix for default marker icon in react-leaflet
  const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

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
        <div className="map-wrapper">
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
                icon={customIcon}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{washroom.name}</h4>
                    {washroom.building && (
                      <p>{washroom.building}
                      {washroom.floor !== null && ` - Floor ${washroom.floor}`}</p>
                    )}
                    <div className="popup-rating">
                      ⭐ {washroom.average_rating.toFixed(1)} ({washroom.total_reviews} reviews)
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
