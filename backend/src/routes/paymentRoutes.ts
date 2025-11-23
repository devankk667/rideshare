import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import {
    processPayment,
    refundPayment,
    getPaymentHistory
} from '../controllers/paymentController';

const router = Router();

router.use(authMiddleware);

router.post('/', processPayment);
router.put('/:paymentId/refund', refundPayment);
router.get('/history', getPaymentHistory);

export default router;
