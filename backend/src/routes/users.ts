import express from 'express';
import { getUserProfile, updateUserProfile, getUserBadges } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/:id', authenticateToken, getUserProfile);
router.put('/:id', authenticateToken, updateUserProfile);
router.get('/:id/badges', authenticateToken, getUserBadges);

export default router;
