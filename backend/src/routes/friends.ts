import express from 'express';
import {
  followUser,
  unfollowUser,
  getFriends,
  getFriendshipStatus,
  searchUsers,
} from '../controllers/friendsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Follow a user
router.post('/:id', followUser);

// Unfollow a user
router.delete('/:id', unfollowUser);

// Get friends list (defaults to current user, or specify userId query param)
router.get('/', getFriends);

// Check friendship status with a user
router.get('/status/:id', getFriendshipStatus);

// Search users
router.get('/search', searchUsers);

export default router;
