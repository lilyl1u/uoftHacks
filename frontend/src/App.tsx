import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';
import ExplorePage from './pages/ExplorePage';
import DoctorPage from './pages/DoctorPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/app"
          element={<Layout />}
        >
          <Route path="map" element={<MapPage />} />
          <Route
            path="profile/:userId?"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="explore"
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="doctor"
            element={
              <ProtectedRoute>
                <DoctorPage />
              </ProtectedRoute>
            }
          />
          <Route index element={<Navigate to="/app/map" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
