import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/app/map');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/app/map" className="nav-logo">
            🚽 iPoo
          </Link>
          <div className="nav-links">
<<<<<<< HEAD
            <Link to="/app/map" className="nav-link">
              Map
            </Link>
            <Link to="/app/explore" className="nav-link">
              Explore
            </Link>
            <Link to="/app/profile" className="nav-link">
              Profile
            </Link>
            <Link to="/app/explore" className="nav-link">
              Explore
            </Link>
            <button onClick={handleLogout} className="nav-button">
              Logout
            </button>
=======
            {isAuthenticated ? (
              <>
                <Link to="/app/map" className="nav-link">
                  Map
                </Link>
                <Link to="/app/profile" className="nav-link">
                  Profile
                </Link>
                <Link to="/app/explore" className="nav-link">
                  Explore
                </Link>
                <button onClick={handleLogout} className="nav-button">
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="nav-button"
              >
                Log In
              </button>
            )}
>>>>>>> 098c751d51aa836361af314dcc1b4f826a8c259e
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
