import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsService } from '../services/api';
import './UserSearch.css';

interface User {
  id: number;
  username: string;
  avatar: string | null;
  personality_type: string | null;
  is_friend: boolean;
}

interface UserSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSearch = ({ isOpen, onClose }: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setUsers([]);
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for:', query);
      const results = await friendsService.searchUsers(query);
      console.log('Search results received:', results);
      setUsers(results);
    } catch (error: any) {
      console.error('Failed to search users:', error);
      console.error('Error details:', error.response?.data || error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      await friendsService.followUser(userId);
      // Update the user's friend status
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, is_friend: true } : user
        )
      );
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      await friendsService.unfollowUser(userId);
      // Update the user's friend status
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, is_friend: false } : user
        )
      );
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleViewProfile = (userId: number) => {
    navigate(`/app/profile/${userId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="user-search-overlay" onClick={onClose}>
      <div className="user-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-search-header">
          <h2>Search Users</h2>
          <button className="user-search-close" onClick={onClose}>✕</button>
        </div>

        <div className="user-search-input-container">
          <input
            type="text"
            className="user-search-input"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        {loading && (
          <div className="user-search-loading">Searching...</div>
        )}

        {!loading && searchQuery.length >= 2 && users.length === 0 && (
          <div className="user-search-empty">No users found</div>
        )}

        {!loading && searchQuery.length < 2 && (
          <div className="user-search-hint">Type at least 2 characters to search</div>
        )}

        {!loading && users.length > 0 && (
          <div className="user-search-results">
            {users.map((user) => (
              <div key={user.id} className="user-search-item">
                <div 
                  className="user-search-item-info"
                  onClick={() => handleViewProfile(user.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="user-search-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} />
                    ) : (
                      <div className="user-search-avatar-placeholder">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-search-details">
                    <h3>{user.username}</h3>
                    {user.personality_type && (
                      <p className="user-search-personality">{user.personality_type}</p>
                    )}
                  </div>
                </div>
                <button
                  className={`user-search-follow-btn ${user.is_friend ? 'following' : ''}`}
                  onClick={() => user.is_friend ? handleUnfollow(user.id) : handleFollow(user.id)}
                  disabled={followLoading[user.id]}
                >
                  {followLoading[user.id]
                    ? (user.is_friend ? 'Unfollowing...' : 'Following...')
                    : (user.is_friend ? 'Unfollow' : 'Follow')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
