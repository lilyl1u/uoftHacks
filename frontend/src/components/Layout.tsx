import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/app/map" className="nav-logo">
            🚽 UofT Washroom Finder
          </Link>
          <div className="nav-links">
            <Link to="/app/map" className="nav-link">
              Map
            </Link>
            <Link to="/app/profile" className="nav-link">
              Profile
            </Link>
            <span className="nav-user">Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="nav-button">
              Logout
            </button>
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
