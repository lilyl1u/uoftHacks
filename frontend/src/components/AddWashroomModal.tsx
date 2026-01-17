import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { washroomService } from '../services/api';
import './Modal.css';

interface AddWashroomModalProps {
  onClose: () => void;
  onSubmit: () => void;
  campus?: string;
}

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const AddWashroomModal: React.FC<AddWashroomModalProps> = ({
  onClose,
  onSubmit,
  campus = 'UofT',
}) => {
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accessibility, setAccessibility] = useState(false);
  const [paidAccess, setPaidAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);

  // Fix for default marker icon in react-leaflet
  const markerIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Delay map rendering slightly to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const getMapCenter = (): [number, number] => {
    if (campus === 'Waterloo') {
      return [43.4723, -80.5449]; // University of Waterloo coordinates
    }
    return [43.6629, -79.3957]; // UofT campus coordinates
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError('Could not get your location. Please click on the map instead.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please click on the map.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Washroom name is required');
      return;
    }

    if (!selectedLocation) {
      setError('Please select a location on the map by clicking on it');
      return;
    }

    setLoading(true);

    try {
      await washroomService.create({
        name,
        building: building || null,
        floor: floor ? parseInt(floor) : null,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        campus,
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

          <div className="form-group">
            <label>
              Location * 
              <span style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                (Click on the map to select)
              </span>
            </label>
            <div style={{ 
              height: '300px', 
              width: '100%', 
              borderRadius: '6px', 
              overflow: 'hidden',
              border: '1px solid #ddd',
              marginBottom: '0.5rem',
              position: 'relative'
            }}>
              {mapReady ? (
                <MapContainer
                  key={`add-washroom-map-${campus}`}
                  center={getMapCenter()}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {selectedLocation && (
                    <Marker
                      position={[selectedLocation.lat, selectedLocation.lng]}
                      icon={markerIcon}
                    />
                  )}
                </MapContainer>
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f5f5f5',
                  color: '#7f8c8d'
                }}>
                  Loading map...
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {selectedLocation ? (
                <span style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
                  Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </span>
              ) : (
                <span style={{ fontSize: '0.9rem', color: '#e74c3c' }}>
                  Please click on the map to select a location
                </span>
              )}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                style={{
                  marginLeft: 'auto',
                  padding: '0.5rem 1rem',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                📍 Use My Location
              </button>
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
