import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import './ChampionBoard.css';

interface TopUser {
  id: number;
  username: string;
  avatar: string | null;
  personality_type: string | null;
  washrooms_visited: number;
  badges: string[] | null;
}

const ChampionBoard = () => {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopUsers();
  }, []);

  const loadTopUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getTopUsers(3);
      setTopUsers(data || []);
    } catch (error) {
      console.error('Failed to load top users:', error);
      setTopUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/app/profile/${userId}`);
  };

  const getMedal = (position: number): string => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  if (loading) {
    return (
      <div className="champion-board">
        <h2 className="champion-board-title">🏆 Champion Board</h2>
        <div className="champion-loading">Loading...</div>
      </div>
    );
  }

  if (topUsers.length === 0) {
    return (
      <div className="champion-board">
        <h2 className="champion-board-title">🏆 Champion Board</h2>
        <div className="champion-empty">No users with visits yet</div>
      </div>
    );
  }

  return (
    <div className="champion-board">
      <h2 className="champion-board-title">🏆 Champion Board</h2>
      <p className="champion-board-subtitle">Top 3 Most Visited Users</p>
      <div className="champion-list">
        {topUsers.map((user, index) => {
          const position = index + 1;

          return (
            <div
              key={user.id}
              className="champion-item"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="champion-rank">
                <span className="champion-medal">{getMedal(position)}</span>
              </div>
              <div className="champion-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <div className="champion-avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="champion-info">
                <h4 className="champion-name">{user.username}</h4>
                {user.personality_type && (
                  <p className="champion-personality">{user.personality_type}</p>
                )}
                <div className="champion-stats">
                  <span className="champion-visits">
                    🚽 {user.washrooms_visited} {user.washrooms_visited === 1 ? 'washroom' : 'washrooms'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChampionBoard;
