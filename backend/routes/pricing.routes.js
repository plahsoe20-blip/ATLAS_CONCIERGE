import express from 'express';
import { calculateQuote } from '../services/pricing.service.js';

const router = express.Router();

router.post('/calculate', async (req, res, next) => {
  try {
    const quote = await calculateQuote(req.body);
    res.json({ quote });
  } catch (error) {
    next(error);
  }
});

export default router;
