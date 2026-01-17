import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService, reviewService, friendsService } from '../services/api';
import FriendsList from '../components/FriendsList';
import UserSearch from '../components/UserSearch';
import ChampionBoard from '../components/ChampionBoard';
import WashroomDetailsModal from '../components/WashroomDetailsModal';
import './ProfilePage.css';

interface UserProfile {
  id: number;
  username: string;
  email?: string;
  avatar: string | null;
  personality_type: string | null;
  badges: string[] | null;
  washrooms_visited: number;
  washroom_visits?: Array<{
    id: number;
    name: string;
    building: string;
    visit_count: number;
    last_visited: string;
    overall_rating?: number | string | null;
  }>;
  isLimited?: boolean;
  isOwnProfile?: boolean;
  message?: string;
}

interface Review {
  id: number;
  washroom_id: number;
  overall_rating: number | string;
  comment: string;
  created_at: string;
  washroom_name?: string;
  building?: string;
}

interface BadgeInfo {
  name: string;
  icon: string;
  color: string;
  description: string;
  earned: boolean;
}

const getBadgeInfo = (badgeName: string): BadgeInfo | undefined => {
  const badgeMap: Record<string, BadgeInfo> = {
    'Explorer': {
      name: 'Explorer',
      icon: '🗺️',
      color: '#FF6B6B',
      description: 'Visited 5+ washrooms',
      earned: true
    },
    'Frequent Visitor': {
      name: 'Frequent Visitor',
      icon: '⭐',
      color: '#4ECDC4',
      description: 'Visited 10+ washrooms',
      earned: true
    },
    'Early Bird': {
      name: 'Early Bird',
      icon: '🌅',
      color: '#FFE66D',
      description: 'Morning Pooper personality',
      earned: true
    },
    'Night Owl': {
      name: 'Night Owl',
      icon: '🌙',
      color: '#5F27CD',
      description: 'Night Owl personality',
      earned: true
    },
    'Reviewer': {
      name: 'Reviewer',
      icon: '💬',
      color: '#00D2D3',
      description: 'Left 5+ reviews',
      earned: true
    },
    'Elite': {
      name: 'Elite',
      icon: '👑',
      color: '#FFD700',
      description: 'Visited 20+ washrooms',
      earned: true
    }
  };
  return badgeMap[badgeName];
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [personality, setPersonality] = useState('');
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWrappedModal, setShowWrappedModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);
  const [editData, setEditData] = useState({ username: '', email: '', avatar: '' });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wrappedData, setWrappedData] = useState<any>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipLoading, setFriendshipLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedWashroomId, setSelectedWashroomId] = useState<number | null>(null);
  const [showWashroomModal, setShowWashroomModal] = useState(false);
  const [visitsToShow, setVisitsToShow] = useState(7);

  const viewingUserId = userId ? parseInt(userId) : user?.id;
  const isOwnProfile = !userId || viewingUserId === user?.id;

  // Helper functions for rating
  const getRating = (rating: any): number => {
    if (rating == null || rating === '') return 0;
    const num = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
    return isNaN(num) ? 0 : num;
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.0) return '#2ECC71'; // Green
    if (rating >= 2.5) return '#F39C12'; // Orange
    if (rating > 0) return '#E74C3C'; // Red
    return '#95a5a6'; // Gray
  };

  useEffect(() => {
    if (user && viewingUserId) {
      loadProfile();
      if (!isOwnProfile) {
        loadFriendshipStatus();
      }
      // Reset visits display when profile changes
      setVisitsToShow(7);
    }
  }, [user, viewingUserId, isOwnProfile]);

  const loadProfile = async () => {
    if (!user || !viewingUserId) return;
    try {
      setLoading(true);
      const data = await userService.getProfile(viewingUserId);
      setProfile(data);
      
      if (!data.isLimited) {
        setEditData({ username: data.username, email: data.email || '', avatar: data.avatar || '' });
        setPersonality(data.personality_type || '');
        
        // Load user reviews only for full profiles
        const reviewsData = await reviewService.getUserReviews(viewingUserId);
        setReviews(reviewsData?.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendshipStatus = async () => {
    if (!user || !viewingUserId || isOwnProfile) return;
    try {
      setFriendshipLoading(true);
      const status = await friendsService.getFriendshipStatus(viewingUserId);
      setIsFriend(status.isFriend);
    } catch (error) {
      console.error('Failed to load friendship status:', error);
    } finally {
      setFriendshipLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !viewingUserId || isOwnProfile) return;
    try {
      setFollowLoading(true);
      await friendsService.followUser(viewingUserId);
      setIsFriend(true);
      // Reload profile to get full data
      await loadProfile();
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !viewingUserId || isOwnProfile) return;
    try {
      setFollowLoading(true);
      await friendsService.unfollowUser(viewingUserId);
      setIsFriend(false);
      // Reload profile to get limited data
      await loadProfile();
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    } finally {
      setFollowLoading(false);
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

  const handleEditProfile = async () => {
    if (!user) return;
    try {
      await userService.updateProfile(user.id, {
        username: editData.username,
        email: editData.email,
        avatar: editData.avatar
      });
      setProfile((prev) => prev ? {
        ...prev,
        username: editData.username,
        email: editData.email,
        avatar: editData.avatar
      } : null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const generateWrappedData = () => {
    if (!profile) return;
    
    const favoriteWashroom = profile.washroom_visits && profile.washroom_visits.length > 0
      ? profile.washroom_visits.reduce((prev, current) =>
          (prev.visit_count > current.visit_count) ? prev : current
        )
      : null;

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + getRating(r.overall_rating), 0) / reviews.length).toFixed(1)
      : '0.0';

    setWrappedData({
      favoriteWashroom,
      reviewsCount: reviews.length,
      avgRating,
      totalVisits: profile.washrooms_visited,
      mostRecentVisit: profile.washroom_visits && profile.washroom_visits.length > 0
        ? new Date(profile.washroom_visits[0].last_visited).toLocaleDateString()
        : null
    });
    setShowWrappedModal(true);
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (!profile) {
    return <div className="profile-container">Failed to load profile</div>;
  }

  // Limited profile view (not friends and not own profile)
  if (profile.isLimited) {
    return (
      <div className="profile-container">
        <div className="user-info-section">
          <div className="user-info-left">
            <div className="profile-avatar-large">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder-large">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="user-info-right">
            <div className="user-info-row">
              <div className="user-info-item">
                <span className="user-info-label">Name:</span>
                <span className="user-info-value">{profile.username}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          marginTop: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '1.1rem', color: '#7f8c8d', marginBottom: '1.5rem' }}>
            {profile.message || 'Follow this user to see their full profile'}
          </p>
          <button
            onClick={handleFollow}
            disabled={followLoading}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: followLoading ? 'not-allowed' : 'pointer',
              opacity: followLoading ? 0.6 : 1
            }}
          >
            {followLoading ? 'Following...' : 'Follow'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* User Info Section */}
      <div className="user-info-section">
        <div className="user-info-left">
          <div className="profile-avatar-large">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder-large">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setShowEditModal(true)}
              className="edit-profile-button-under-avatar"
            >
              Edit Profile
            </button>
          )}
        </div>
        <div className="user-info-right">
          <div className="user-info-row">
            <div className="user-info-item">
              <span className="user-info-label">Name:</span>
              <span className="user-info-value">{profile.username}</span>
            </div>
          </div>
          <div className="user-info-row">
            <div className="user-info-item">
              <span className="user-info-label">Email:</span>
              <span className="user-info-value">{profile.email || 'Not set'}</span>
            </div>
          </div>
        </div>
        <div className="user-info-buttons">
          {!isOwnProfile && (
            <button
              onClick={isFriend ? handleUnfollow : handleFollow}
              disabled={followLoading || friendshipLoading}
              style={{
                background: isFriend 
                  ? '#e74c3c' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (followLoading || friendshipLoading) ? 'not-allowed' : 'pointer',
                opacity: (followLoading || friendshipLoading) ? 0.6 : 1,
                marginRight: '1rem'
              }}
            >
              {followLoading 
                ? (isFriend ? 'Unfollowing...' : 'Following...') 
                : (isFriend ? 'Unfollow' : 'Follow')}
            </button>
          )}
          <button
            onClick={() => setShowFriendsModal(true)}
            className="friends-button"
          >
            Friends
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setShowUserSearch(true)}
              className="friends-button"
              style={{ marginLeft: '0.5rem' }}
            >
              Search Users
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={generateWrappedData}
              className="wrapped-text-button"
              title="View Your Year in Washrooms"
            >
              pooPals Wrapped
            </button>
          )}
        </div>
      </div>

      {/* Personality Section */}
      <div className="personality-section">
        <div className="personality-content">
          <span className="personality-label">Personality:</span>
          <span className="personality-display">
            {profile.personality_type || 'Not set'}
          </span>
        </div>
      </div>

      {/* Washrooms Visited & Badges Section */}
      <div className="badges-and-wrapped-container">
        <div className="washrooms-visited-section">
          <h2 className="washrooms-visited-header">Washrooms Visited</h2>
          <div className="washrooms-visited-count">{profile.washrooms_visited}</div>
        </div>

        <div className="badges-section">
          <h2 className="badges-header">Badges ({(profile.badges?.length || 0) + (profile.washrooms_visited >= 1 ? 1 : 0)})</h2>
          <div className="badges-row">
            {profile.washrooms_visited >= 1 && (
              <div 
                className="achievement-badge" 
                title="Unlocked your first bathroom"
                onClick={() => setSelectedBadge({
                  name: 'Unlocked Your First Bathroom',
                  icon: '🎉',
                  color: '#FFD700',
                  description: 'You have visited your first bathroom and completed your first journey!',
                  earned: true
                })}
              >
                <div className="achievement-icon">🎉</div>
              </div>
            )}
            {profile.badges && profile.badges.length > 0 ? (
              profile.badges.map((badge, idx) => {
                const badgeInfo = getBadgeInfo(badge);
                return (
                  <div 
                    key={idx} 
                    className="badge-medal" 
                    title={badgeInfo?.name}
                    onClick={() => setSelectedBadge(badgeInfo || null)}
                  >
                    {badgeInfo?.icon}
                  </div>
                );
              })
            ) : (
              profile.washrooms_visited < 1 && <p className="no-badges-text">Keep visiting washrooms to earn badges!</p>
            )}
          </div>
        </div>
      </div>


      {/* Recent Visits Section */}
      <div className="recent-visits-section">
        <h2 className="recent-visits-header">Recent Visits</h2>
        {profile.washroom_visits && profile.washroom_visits.length > 0 ? (
          <>
            <div className="visits-list">
              {profile.washroom_visits.slice(0, visitsToShow).map((visit) => (
                <div 
                  key={visit.id} 
                  className="visit-item"
                  onClick={() => {
                    setSelectedWashroomId(visit.id);
                    setShowWashroomModal(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <h4>{visit.name}</h4>
                    <p>{visit.building}</p>
                    {visit.overall_rating && (
                      <div className="visit-rating">
                        <span className="visit-rating-label">Your Rating:</span>
                        <span 
                          className="visit-rating-value"
                          style={{ 
                            color: getRatingColor(getRating(visit.overall_rating))
                          }}
                        >
                          ⭐ {getRating(visit.overall_rating).toFixed(1)}/5.0
                        </span>
                      </div>
                    )}
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
            {profile.washroom_visits.length > visitsToShow && (
              <button
                className="load-more-visits-button"
                onClick={() => setVisitsToShow(profile.washroom_visits!.length)}
              >
                Load More ({profile.washroom_visits.length - visitsToShow} more)
              </button>
            )}
          </>
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

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <div className="edit-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  type="text"
                  value={editData.avatar}
                  onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                  className="form-input"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              {editData.avatar && (
                <div className="avatar-preview">
                  <p>Preview:</p>
                  <img src={editData.avatar} alt="Avatar preview" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={handleEditProfile} className="save-button">
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showWrappedModal && wrappedData && (
        <div className="modal-overlay" onClick={() => setShowWrappedModal(false)}>
          <div className="wrapped-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-wrapped" onClick={() => setShowWrappedModal(false)}>✕</button>
            
            <div className="wrapped-header">
              <h1>Your Year in Washrooms</h1>
              <p className="wrapped-subtitle">Here's what your washroom journey looked like</p>
            </div>

            <div className="wrapped-stat wrapped-stat-1">
              <div className="wrapped-icon">🏆</div>
              <h3>Most Visited Spot</h3>
              {wrappedData.favoriteWashroom ? (
                <>
                  <p className="wrapped-value">{wrappedData.favoriteWashroom.name}</p>
                  <p className="wrapped-detail">{wrappedData.favoriteWashroom.building}</p>
                  <p className="wrapped-visits">Visited {wrappedData.favoriteWashroom.visit_count} times</p>
                </>
              ) : (
                <p className="wrapped-value">No visits yet</p>
              )}
            </div>

            <div className="wrapped-stat wrapped-stat-2">
              <div className="wrapped-icon">⭐</div>
              <h3>Average Rating</h3>
              <p className="wrapped-value">{wrappedData.avgRating}</p>
              <p className="wrapped-detail">Based on {wrappedData.reviewsCount} reviews</p>
            </div>

            <div className="wrapped-stat wrapped-stat-3">
              <div className="wrapped-icon">📊</div>
              <h3>Total Visits</h3>
              <p className="wrapped-value">{wrappedData.totalVisits}</p>
              <p className="wrapped-detail">Washrooms explored</p>
            </div>

            <div className="wrapped-stat wrapped-stat-4">
              <div className="wrapped-icon">💬</div>
              <h3>Reviews Written</h3>
              <p className="wrapped-value">{wrappedData.reviewsCount}</p>
              <p className="wrapped-detail">Helping the community</p>
            </div>

            {wrappedData.mostRecentVisit && (
              <div className="wrapped-stat wrapped-stat-5">
                <div className="wrapped-icon">📅</div>
                <h3>Most Recent Visit</h3>
                <p className="wrapped-value">{wrappedData.mostRecentVisit}</p>
              </div>
            )}

            <button
              onClick={() => setShowWrappedModal(false)}
              className="wrapped-close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <FriendsList 
        userId={viewingUserId || user?.id || 0} 
        isOpen={showFriendsModal} 
        onClose={() => setShowFriendsModal(false)}
      />

      <UserSearch
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
      />

      {selectedBadge && (
        <div className="modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="badge-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-badge-modal" onClick={() => setSelectedBadge(null)}>✕</button>
            <div className="badge-detail-icon" style={{ fontSize: '4rem' }}>
              {selectedBadge.icon}
            </div>
            <h2 className="badge-detail-name">{selectedBadge.name}</h2>
            <p className="badge-detail-description">{selectedBadge.description}</p>
            <button 
              className="badge-detail-close"
              onClick={() => setSelectedBadge(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Champion Board - at bottom */}
      <div style={{ marginTop: '2rem' }}>
        <ChampionBoard />
      </div>

      {/* Washroom Details Modal */}
      {selectedWashroomId && (
        <WashroomDetailsModal
          isOpen={showWashroomModal}
          onClose={() => {
            setShowWashroomModal(false);
            setSelectedWashroomId(null);
          }}
          washroomId={selectedWashroomId}
        />
      )}
    </div>
  );
};

export default ProfilePage;
