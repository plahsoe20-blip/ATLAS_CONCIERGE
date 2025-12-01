import express from 'express';
import {
  createBooking,
  getBooking,
  getMyBookings,
  updateBookingStatus,
  cancelBooking,
  assignDriver,
  acceptBooking
} from '../controllers/booking.controller.js';
import { requireConcierge, requireOperator, requireDriver } from '../middleware/auth.js';

const router = express.Router();

// Concierge routes
router.post('/', requireConcierge, createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBooking);
router.post('/:id/cancel', cancelBooking);

// Operator routes
router.post('/:id/assign-driver', requireOperator, assignDriver);

// Driver routes
router.post('/:id/accept', requireDriver, acceptBooking);

// Common routes
router.put('/:id/status', updateBookingStatus);

export default router;
