import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService, reviewService, friendsService } from '../services/api';
import FriendsList from '../components/FriendsList';
import UserSearch from '../components/UserSearch';
import ChampionBoard from '../components/ChampionBoard';
import WashroomDetailsModal from '../components/WashroomDetailsModal';
import RecentPosts from '../components/RecentPosts';
import './ProfilePage.css';

interface UserProfile {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar: string | null;
  personality_type: string | null;
  badges: string[] | null;
  washrooms_visited: number;
  friends_count?: number;
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
  requirement: string;
  earned: boolean;
}

const getAllBadges = (): BadgeInfo[] => {
  return [
    {
      name: 'Unlocked Your First Bathroom',
      icon: '🎉',
      color: '#FFD700',
      description: 'You have visited your first bathroom and completed your first journey!',
      requirement: 'Visit your first washroom',
      earned: false // Will be determined dynamically
    },
    {
      name: 'Explorer',
      icon: '🗺️',
      color: '#FF6B6B',
      description: 'Visited 5+ washrooms',
      requirement: 'Visit 5 different washrooms',
      earned: false
    },
    {
      name: 'Frequent Visitor',
      icon: '⭐',
      color: '#4ECDC4',
      description: 'Visited 10+ washrooms',
      requirement: 'Visit 10 different washrooms',
      earned: false
    },
    {
      name: 'Elite',
      icon: '👑',
      color: '#FFD700',
      description: 'Visited 20+ washrooms',
      requirement: 'Visit 20 different washrooms',
      earned: false
    },
    {
      name: 'Reviewer',
      icon: '💬',
      color: '#00D2D3',
      description: 'Left 5+ reviews',
      requirement: 'Write 5 reviews',
      earned: false
    }
  ];
};

const getBadgeInfo = (badgeName: string): BadgeInfo | undefined => {
  const allBadges = getAllBadges();
  return allBadges.find(b => b.name === badgeName);
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [personality, setPersonality] = useState('');
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWrappedModal, setShowWrappedModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);
  const [editData, setEditData] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    bio: '', 
    avatar: '' 
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wrappedData, setWrappedData] = useState<any>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipLoading, setFriendshipLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedWashroomId, setSelectedWashroomId] = useState<number | null>(null);
  const [selectedVisitData, setSelectedVisitData] = useState<{ visit_count: number; overall_rating?: number | string | null } | null>(null);
  const [showWashroomModal, setShowWashroomModal] = useState(false);
  const [visitsToShow, setVisitsToShow] = useState(7);
  const [personalityDescription, setPersonalityDescription] = useState<string | null>(null);
  const [generatingPersonality, setGeneratingPersonality] = useState(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorAnalysis, setDoctorAnalysis] = useState<any>(null);
  const [loadingDoctorAnalysis, setLoadingDoctorAnalysis] = useState(false);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);

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
      loadFriendsCount();
      if (!isOwnProfile) {
        loadFriendshipStatus();
      }
      // Reset visits display when profile changes
      setVisitsToShow(7);
      // Reset generation attempt flag when profile changes
      setHasAttemptedGeneration(false);
    }
  }, [user, viewingUserId, isOwnProfile]);

  useEffect(() => {
    // Auto-generate personality for own profile if not set, or load description if set
    if (profile && isOwnProfile && !hasAttemptedGeneration) {
      if (!profile.personality_type) {
        // Auto-generate if no personality exists
        setHasAttemptedGeneration(true);
        handleGeneratePersonality();
      } else {
        // Load description if personality exists
        setHasAttemptedGeneration(true);
        loadPersonalityDescription(profile.personality_type);
      }
    } else if (profile?.personality_type && !personalityDescription) {
      // Load description for other users' profiles or if description not loaded yet
      loadPersonalityDescription(profile.personality_type);
    } else if (!profile?.personality_type) {
      setPersonalityDescription(null);
    }
  }, [profile?.personality_type, profile, isOwnProfile, hasAttemptedGeneration]);

  const loadProfile = async () => {
    if (!user || !viewingUserId) return;
    try {
      setLoading(true);
      const data = await userService.getProfile(viewingUserId);
      setProfile(data);
      
      if (!data.isLimited) {
        setEditData({ 
          first_name: data.first_name || '', 
          last_name: data.last_name || '', 
          email: data.email || '', 
          bio: data.bio || '', 
          avatar: data.avatar || '' 
        });
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

  const loadFriendsCount = async () => {
    if (!viewingUserId) return;
    try {
      const friends = await friendsService.getFriends(viewingUserId);
      setFriendsCount(friends?.length || 0);
    } catch (error) {
      console.error('Failed to load friends count:', error);
      setFriendsCount(0);
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

  const loadPersonalityDescription = async (personalityType: string) => {
    try {
      const data = await userService.getPersonalityDescription(personalityType);
      setPersonalityDescription(data.description);
    } catch (error) {
      console.error('Failed to load personality description:', error);
    }
  };

  const handleGeneratePersonality = async () => {
    if (!user || !viewingUserId) return;
    try {
      setGeneratingPersonality(true);
      const data = await userService.generatePersonality(viewingUserId);
      setPersonalityDescription(data.description);
      // Reload profile to get updated personality_type
      await loadProfile();
    } catch (error: any) {
      console.error('Failed to generate personality:', error);
      alert(error.response?.data?.error || 'Failed to generate personality. Please try again.');
    } finally {
      setGeneratingPersonality(false);
    }
  };

  const loadDoctorAnalysis = async () => {
    if (!user || !isOwnProfile) return;
    try {
      setLoadingDoctorAnalysis(true);
      setDoctorError(null);
      const data = await userService.getBowelHealthAnalysis(user.id);
      setDoctorAnalysis(data);
      setShowDoctorModal(true);
    } catch (err: any) {
      console.error('Failed to load health analysis:', err);
      setDoctorError(err.response?.data?.error || 'Failed to load health analysis. Please try again.');
    } finally {
      setLoadingDoctorAnalysis(false);
    }
  };

  const getRegularityColor = (regularity: string) => {
    switch (regularity) {
      case 'regular':
        return '#2ECC71';
      case 'irregular':
        return '#F39C12';
      case 'needs_attention':
        return '#E74C3C';
      default:
        return '#95a5a6';
    }
  };

  const getRegularityLabel = (regularity: string) => {
    switch (regularity) {
      case 'regular':
        return 'Regular';
      case 'irregular':
        return 'Irregular';
      case 'needs_attention':
        return 'Needs Attention';
      default:
        return 'Unknown';
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
        first_name: editData.first_name,
        last_name: editData.last_name,
        bio: editData.bio,
        avatar: editData.avatar
      });
      setProfile((prev) => prev ? {
        ...prev,
        first_name: editData.first_name,
        last_name: editData.last_name,
        bio: editData.bio,
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
                {((profile.first_name && profile.first_name.charAt(0)) || 
                  (profile.last_name && profile.last_name.charAt(0)) || 
                  profile.username.charAt(0)).toUpperCase()}
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
          <h2 className="profile-name">
            {(profile.first_name || profile.last_name) 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
              : profile.username}
          </h2>
          <div className="bio-box">
            <p className="bio-text">
              {profile.bio || 'Enter bio'}
            </p>
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
            {friendsCount} friends
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setShowUserSearch(true)}
              className="friends-button"
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
              View Your Wrapped
            </button>
          )}
        </div>
      </div>

      {/* Personality Section */}
      <div className="personality-section">
        <div className="personality-content">
          <span className="personality-label">Personality:</span>
          <span className="personality-display">
            {generatingPersonality ? 'Analyzing...' : (profile.personality_type || 'Analyzing...')}
          </span>
        </div>
      </div>

      {/* Washrooms Visited & Badges Section - Separate, aligned at top */}
      <div className="washrooms-badges-container">
        <div className="left-column">
          <div className="washrooms-visited-section">
            <h2 className="washrooms-visited-header">Washrooms Visited</h2>
            <div className="washrooms-visited-count">{profile.washrooms_visited}</div>
          </div>

          {/* Doctor Section - Only show on own profile, positioned below washrooms visited */}
          {isOwnProfile && (
            <div className="doctor-section-card">
              <h2 className="doctor-section-header">🩺 Health Analysis</h2>
              <button 
                onClick={loadDoctorAnalysis}
                disabled={loadingDoctorAnalysis}
                className="doctor-section-button"
              >
                {loadingDoctorAnalysis ? 'Analyzing...' : 'View Analysis'}
              </button>
            </div>
          )}
        </div>

        <div className="badges-section">
          <h2 className="badges-header">Badges</h2>
          <div className="badges-row">
            {isOwnProfile ? (
              // Show all badges (earned and locked) for own profile
              getAllBadges().map((badge, idx) => {
                // Determine if badge is earned
                let earned = false;
                const earnedBadges = profile.badges || [];
                
                if (badge.name === 'Unlocked Your First Bathroom') {
                  earned = profile.washrooms_visited >= 1;
                } else if (badge.name === 'Explorer') {
                  earned = profile.washrooms_visited >= 5 || earnedBadges.includes('Explorer');
                } else if (badge.name === 'Frequent Visitor') {
                  earned = profile.washrooms_visited >= 10 || earnedBadges.includes('Frequent Visitor');
                } else if (badge.name === 'Elite') {
                  earned = profile.washrooms_visited >= 20 || earnedBadges.includes('Elite');
                } else if (badge.name === 'Reviewer') {
                  earned = reviews.length >= 5 || earnedBadges.includes('Reviewer');
                } else {
                  earned = earnedBadges.includes(badge.name);
                }

                const badgeWithEarned = { ...badge, earned };

                if (badge.name === 'Unlocked Your First Bathroom') {
                  return (
                    <div 
                      key={idx}
                      className={`achievement-badge ${!earned ? 'locked' : ''}`}
                      title={earned ? badge.name : `Locked: ${badge.requirement}`}
                      onClick={() => setSelectedBadge(badgeWithEarned)}
                    >
                      <div className={`achievement-icon ${!earned ? 'locked-icon' : ''}`}>
                        {badge.icon}
                        {!earned && <span className="lock-overlay">🔒</span>}
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={idx} 
                    className={`badge-medal ${!earned ? 'locked' : ''}`}
                    title={earned ? badge.name : `Locked: ${badge.requirement}`}
                    onClick={() => setSelectedBadge(badgeWithEarned)}
                  >
                    {badge.icon}
                    {!earned && <span className="lock-overlay">🔒</span>}
                  </div>
                );
              })
            ) : (
              // Show only earned badges for other profiles
              <>
                {profile.washrooms_visited >= 1 && (
                  <div 
                    className="achievement-badge" 
                    title="Unlocked your first bathroom"
                    onClick={() => setSelectedBadge({
                      name: 'Unlocked Your First Bathroom',
                      icon: '🎉',
                      color: '#FFD700',
                      description: 'You have visited your first bathroom and completed your first journey!',
                      requirement: 'Visit your first washroom',
                      earned: true
                    })}
                  >
                    <div className="achievement-icon">🎉</div>
                  </div>
                )}
                {profile.badges && profile.badges.length > 0 ? (
                  profile.badges.map((badge, idx) => {
                    const badgeInfo = getBadgeInfo(badge);
                    if (badgeInfo) {
                      const badgeWithEarned = { ...badgeInfo, earned: true };
                      return (
                        <div 
                          key={idx} 
                          className="badge-medal" 
                          title={badgeInfo.name}
                          onClick={() => setSelectedBadge(badgeWithEarned)}
                        >
                          {badgeInfo.icon}
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  profile.washrooms_visited < 1 && <p className="no-badges-text">Keep visiting washrooms to earn badges!</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Visits & Champion Board Section (Side by Side) */}
      <div className="visits-champion-container">
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
                      setSelectedVisitData({
                        visit_count: visit.visit_count,
                        overall_rating: visit.overall_rating,
                      });
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

        <div className="champion-board-section">
          <ChampionBoard />
        </div>
      </div>

      {/* Recent Posts Section */}
      {!profile.isLimited && (
        <RecentPosts userId={viewingUserId || user?.id || 0} />
      )}

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
              <option value="Heavy Launcher">Heavy Launcher</option>
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
                <label>First Name</label>
                <input
                  type="text"
                  value={editData.first_name}
                  onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editData.last_name}
                  onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.username}  // Backend returns email in username field
                  disabled
                  className="form-input"
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  title="Email cannot be changed"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="form-input"
                  rows={3}
                  placeholder="Tell us about yourself..."
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

            {profile.personality_type && (
              <div className="wrapped-stat wrapped-stat-6">
                <div className="wrapped-icon">🎭</div>
                <h3>Your Personality</h3>
                <p className="wrapped-value">{profile.personality_type}</p>
                {personalityDescription && (
                  <p className="wrapped-detail" style={{ marginTop: '0.75rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    {personalityDescription}
                  </p>
                )}
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
            <div className={`badge-detail-icon ${!selectedBadge.earned ? 'locked-icon' : ''}`} style={{ fontSize: '4rem' }}>
              {selectedBadge.icon}
              {!selectedBadge.earned && <span className="lock-overlay-large">🔒</span>}
            </div>
            <h2 className="badge-detail-name">
              {selectedBadge.name}
              {!selectedBadge.earned && <span className="locked-badge-label"> (Locked)</span>}
            </h2>
            {selectedBadge.earned ? (
              <p className="badge-detail-description">{selectedBadge.description}</p>
            ) : (
              <div>
                <p className="badge-detail-description" style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
                  {selectedBadge.description}
                </p>
                <div className="badge-requirement">
                  <strong>Requirement:</strong> {selectedBadge.requirement}
                </div>
              </div>
            )}
            <button 
              className="badge-detail-close"
              onClick={() => setSelectedBadge(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Washroom Details Modal */}
      {selectedWashroomId && (
        <WashroomDetailsModal
          isOpen={showWashroomModal}
          onClose={() => {
            setShowWashroomModal(false);
            setSelectedWashroomId(null);
            setSelectedVisitData(null);
          }}
          washroomId={selectedWashroomId}
          visitData={isOwnProfile ? selectedVisitData : undefined}
        />
      )}

      {/* Doctor Modal */}
      {showDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowDoctorModal(false)}>
          <div className="doctor-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDoctorModal(false)}>✕</button>
            <h2>🩺 iPoo Doctor</h2>
            <p className="doctor-modal-subtitle">Your personalized bowel health analysis</p>

            {doctorError ? (
              <div className="doctor-error">
                <p>{doctorError}</p>
                <button onClick={loadDoctorAnalysis} className="doctor-retry-button">
                  Try Again
                </button>
              </div>
            ) : doctorAnalysis ? (
              <>
                {/* Regularity Status */}
                <div className="doctor-regularity-card">
                  <div className="doctor-regularity-header">
                    <h3>Regularity Status</h3>
                    <span 
                      className="doctor-regularity-badge"
                      style={{ backgroundColor: getRegularityColor(doctorAnalysis.regularity) }}
                    >
                      {getRegularityLabel(doctorAnalysis.regularity)}
                    </span>
                  </div>
                  <p className="doctor-regularity-analysis">{doctorAnalysis.analysis}</p>
                </div>

                {/* Statistics */}
                <div className="doctor-statistics-grid">
                  <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">📊</div>
                    <div className="doctor-stat-label">Total Visits</div>
                    <div className="doctor-stat-value">{doctorAnalysis.statistics.totalVisits}</div>
                  </div>
                  <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">📅</div>
                    <div className="doctor-stat-label">Visits/Week</div>
                    <div className="doctor-stat-value">{doctorAnalysis.statistics.visitsPerWeek}</div>
                  </div>
                  <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">⏱️</div>
                    <div className="doctor-stat-label">Avg Between</div>
                    <div className="doctor-stat-value">{doctorAnalysis.statistics.averageTimeBetweenVisits}h</div>
                  </div>
                  <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">📈</div>
                    <div className="doctor-stat-label">Consistency</div>
                    <div className="doctor-stat-value">{doctorAnalysis.statistics.consistencyScore}%</div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="doctor-recommendations-card">
                  <h3>💡 Recommendations</h3>
                  <ul className="doctor-recommendations-list">
                    {doctorAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="doctor-recommendation-item">
                        <span className="doctor-recommendation-number">{index + 1}</span>
                        <span className="doctor-recommendation-text">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="doctor-disclaimer">
                  ⚠️ This analysis is for informational purposes only and is not a substitute for professional medical advice.
                </div>
              </>
            ) : (
              <div className="doctor-loading">Analyzing your bowel movement patterns...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
