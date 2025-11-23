import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import {
  getPassengerProfile,
  updatePassengerProfile,
  getRideHistory,
  requestRide,
  cancelRide,
  rateRide
} from '../controllers/passengerController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/passengers/profile
// @desc    Get passenger profile
// @access  Private
router.get('/profile', getPassengerProfile);

// @route   PUT /api/passengers/profile
// @desc    Update passenger profile
// @access  Private
router.put('/profile', updatePassengerProfile);

// @route   GET /api/passengers/rides
// @desc    Get passenger's ride history
// @access  Private
router.get('/rides', getRideHistory);

// @route   POST /api/passengers/rides/request
// @desc    Request a new ride
// @access  Private
router.post('/rides/request', requestRide);

// @route   PUT /api/passengers/rides/:rideId/cancel
// @desc    Cancel a ride
// @access  Private
router.put('/rides/:rideId/cancel', cancelRide);

// @route   POST /api/passengers/rides/:rideId/rate
// @desc    Rate a completed ride
// @access  Private
router.post('/rides/:rideId/rate', rateRide);

export default router;
