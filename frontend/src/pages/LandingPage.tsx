import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleMapClick = () => {
    if (user) {
      navigate('/app/map');
    } else {
      navigate('/login');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="landing-container">
      <button className="login-button-top-right" onClick={handleLoginClick}>
        Login
      </button>

      <div className="landing-content">
        <h1 className="landing-title">iPoo</h1>

        <div className="bathroom-symbol">🚻</div>

        <p className="landing-description">
          Discover the cleanest and most convenient washrooms across the University of Toronto campus. 
          Rate, review, and share your bathroom experiences with the community.
        </p>

        <button className="map-button" onClick={handleMapClick}>
          Map
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
