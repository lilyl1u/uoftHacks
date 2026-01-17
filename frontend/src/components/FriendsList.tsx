import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './FriendsList.css';

interface Friend {
  id: number;
  username: string;
  avatar: string | null;
  personality_type: string | null;
}

interface FriendsListProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const FriendsList = ({ userId, isOpen, onClose }: FriendsListProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen, userId]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getFriends(userId);
      setFriends(data);
    } catch (err) {
      console.error('Failed to load friends:', err);
      setError('Failed to load friends');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="friends-modal-overlay" onClick={onClose}>
      <div className="friends-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="friends-modal-header">
          <h2>Friends</h2>
          <button className="friends-close-btn" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="friends-loading">Loading friends...</div>}
        
        {error && <p className="friends-error">{error}</p>}

        {!loading && friends && friends.length > 0 ? (
          <div className="friends-list">
            {friends.map((friend) => (
              <div key={friend.id} className="friend-item">
                <div className="friend-avatar-modal">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.username} />
                  ) : (
                    <div className="avatar-placeholder-modal">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="friend-details">
                  <h3>{friend.username}</h3>
                  {friend.personality_type && (
                    <p className="friend-personality">{friend.personality_type}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="no-friends-found">No friends found.</p>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
