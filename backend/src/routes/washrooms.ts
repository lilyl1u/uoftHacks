import express from 'express';
import { 
  getAllWashrooms, 
  getWashroomById, 
  createWashroom, 
  updateWashroom,
  getWashroomsByLocation 
} from '../controllers/washroomController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllWashrooms);
router.get('/:id', getWashroomById);
router.post('/', authenticateToken, createWashroom);
router.put('/:id', authenticateToken, updateWashroom);
router.get('/location/nearby', getWashroomsByLocation);

export default router;
