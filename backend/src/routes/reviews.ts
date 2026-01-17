import express from 'express';
import { 
  createReview, 
  getReviewsByWashroom, 
  updateReview, 
  deleteReview,
  getUserReviews 
} from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, createReview);
router.get('/washroom/:washroomId', getReviewsByWashroom);
router.get('/user/:userId', authenticateToken, getUserReviews);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

export default router;
