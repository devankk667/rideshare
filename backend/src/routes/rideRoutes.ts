import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import {
    createRide,
    updateRideStatus,
    getActiveRides,
    getRideDetails,
    getTrafficImpactAnalysis
} from '../controllers/rideController';

const router = Router();

router.use(authMiddleware);

router.post('/', createRide);
router.put('/:rideId/status', updateRideStatus);
router.get('/active', getActiveRides);
router.get('/:rideId', getRideDetails);
router.get('/traffic-impact', getTrafficImpactAnalysis);

export default router;
