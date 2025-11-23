import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import {
    registerDriver,
    updateDriverStatus,
    addVehicle,
    getDriverVehicles,
    getHighPerformingDrivers,
    getDriverProfile
} from '../controllers/driverController';

const router = Router();

router.use(authMiddleware);

router.post('/register', registerDriver);
router.put('/status', updateDriverStatus);
router.post('/vehicles', addVehicle);
router.get('/vehicles', getDriverVehicles);
router.get('/high-performing', getHighPerformingDrivers);
router.get('/profile', getDriverProfile);

export default router;
