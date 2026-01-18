import express from 'express';
import { 
  getAllWashrooms, 
  getWashroomById, 
  createWashroom, 
  updateWashroom,
  deleteWashroom,
  getWashroomsByLocation,
  getTopVisitedWashrooms
} from '../controllers/washroomController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';

const router = express.Router();

router.get('/', getAllWashrooms);
router.get('/top-visited', getTopVisitedWashrooms);
router.get('/:id', getWashroomById);
router.post('/', authenticateToken, createWashroom);
router.put('/:id', authenticateToken, requireRole(['admin']), updateWashroom);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteWashroom);
router.get('/location/nearby', getWashroomsByLocation);

export default router;
