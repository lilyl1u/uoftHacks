import express from 'express';
import { getUserProfile, updateUserProfile, getUserBadges, getTopUsers } from '../controllers/userController';
import { generatePersonality, getPersonalityDescription } from '../controllers/personalityController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/top', getTopUsers);
router.get('/:id', authenticateToken, getUserProfile);
router.put('/:id', authenticateToken, updateUserProfile);
router.get('/:id/badges', authenticateToken, getUserBadges);
router.post('/:id/personality/generate', authenticateToken, generatePersonality);
router.get('/personality/:personalityType', authenticateToken, getPersonalityDescription);

export default router;
