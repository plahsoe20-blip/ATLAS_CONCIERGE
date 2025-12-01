import express from 'express';
import { getDriverLocation } from '../services/socket.service.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/driver/:driverId', (req, res, next) => {
  try {
    const { driverId } = req.params;
    const location = getDriverLocation(driverId);

    if (!location) {
      throw new NotFoundError('Driver location not available');
    }

    res.json({ location });
  } catch (error) {
    next(error);
  }
});

export default router;
