import express from 'express';
import { getDashboard, getQuotes, acceptQuote } from '../controllers/concierge.controller.js';
import { requireConcierge } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', requireConcierge, getDashboard);
router.get('/bookings/:bookingId/quotes', requireConcierge, getQuotes);
router.post('/quotes/:quoteId/accept', requireConcierge, acceptQuote);

export default router;
