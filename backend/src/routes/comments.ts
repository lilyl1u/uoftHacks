import express from 'express';
import {
  createComment,
  getCommentsByReview,
  deleteComment,
} from '../controllers/commentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/review/:reviewId', authenticateToken, createComment);
router.get('/review/:reviewId', getCommentsByReview);
router.delete('/:commentId', authenticateToken, deleteComment);

export default router;
