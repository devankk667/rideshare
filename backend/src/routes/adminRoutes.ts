import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import {
    getActiveDriversSummary,
    getPassengerActivity,
    getDailyRideStats,
    getPopularRoutes,
    getPaymentAnalysis,
    getDriverPerformance,
    getIncidentAnalysis
} from '../controllers/adminController';

const router = Router();

router.use(authMiddleware);

router.get('/drivers/summary', getActiveDriversSummary);
router.get('/passengers/activity', getPassengerActivity);
router.get('/rides/stats', getDailyRideStats);
router.get('/routes/popular', getPopularRoutes);
router.get('/payments/analysis', getPaymentAnalysis);
router.get('/drivers/performance', getDriverPerformance);
router.get('/incidents/analysis', getIncidentAnalysis);

export default router;
