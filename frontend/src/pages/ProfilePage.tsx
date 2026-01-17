import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import './ProfilePage.css';

interface UserProfile {
  id: number;
  username: string;
  avatar: string | null;
  personality_type: string | null;
  badges: string[] | null;
  washrooms_visited: number;
  washroom_visits: Array<{
    id: number;
    name: string;
    building: string;
    visit_count: number;
    last_visited: string;
  }>;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [personality, setPersonality] = useState('');
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const data = await userService.getProfile(user.id);
      setProfile(data);
      setPersonality(data.personality_type || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonality = async () => {
    if (!user) return;
    try {
      await userService.updateProfile(user.id, { personality_type: personality });
      setProfile((prev) => prev ? { ...prev, personality_type: personality } : null);
      setShowPersonalityModal(false);
    } catch (error) {
      console.error('Failed to update personality:', error);
    }
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (!profile) {
    return <div className="profile-container">Failed to load profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" />
          ) : (
            <div className="avatar-placeholder">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h1>{profile.username}</h1>
        <button
          onClick={() => setShowPersonalityModal(true)}
          className="personality-button"
        >
          {profile.personality_type || 'Set Personality'}
        </button>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>Washrooms Visited</h3>
          <p className="stat-number">{profile.washrooms_visited}</p>
        </div>
        <div className="stat-card">
          <h3>Badges</h3>
          <div className="badges">
            {profile.badges && profile.badges.length > 0 ? (
              profile.badges.map((badge, idx) => (
                <span key={idx} className="badge">
                  {badge}
                </span>
              ))
            ) : (
              <p className="no-badges">No badges yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="washroom-visits">
        <h2>Recent Visits</h2>
        {profile.washroom_visits && profile.washroom_visits.length > 0 ? (
          <div className="visits-list">
            {profile.washroom_visits.map((visit) => (
              <div key={visit.id} className="visit-item">
                <div>
                  <h4>{visit.name}</h4>
                  <p>{visit.building}</p>
                </div>
                <div className="visit-stats">
                  <span>Visited {visit.visit_count} time(s)</span>
                  <span className="visit-date">
                    {new Date(visit.last_visited).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-visits">No washroom visits yet</p>
        )}
      </div>

      {showPersonalityModal && (
        <div className="modal-overlay" onClick={() => setShowPersonalityModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Set Your Personality</h2>
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="personality-select"
            >
              <option value="">Select personality...</option>
              <option value="Heavy Shitter">Heavy Shitter</option>
              <option value="Morning Pooper">Morning Pooper</option>
              <option value="Night Owl">Night Owl</option>
              <option value="Explorer">Explorer</option>
              <option value="Regular Reporter">Regular Reporter</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleUpdatePersonality} className="save-button">
                Save
              </button>
              <button
                onClick={() => setShowPersonalityModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
