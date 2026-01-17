import express from 'express';
import { getUserProfile, updateUserProfile, getUserBadges, getTopUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/top', getTopUsers);
router.get('/:id', authenticateToken, getUserProfile);
router.put('/:id', authenticateToken, updateUserProfile);
router.get('/:id/badges', authenticateToken, getUserBadges);

export default router;
