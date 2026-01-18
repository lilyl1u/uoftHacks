import express from 'express';
import {
  likeReview,
  unlikeReview,
  getLikeCount,
  checkIfLiked,
  getLikesForReview,
} from '../controllers/likeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/review/:reviewId', authenticateToken, likeReview);
router.delete('/review/:reviewId', authenticateToken, unlikeReview);
router.get('/review/:reviewId/count', getLikeCount);
router.get('/review/:reviewId/check', authenticateToken, checkIfLiked);
router.get('/review/:reviewId', getLikesForReview);

export default router;
