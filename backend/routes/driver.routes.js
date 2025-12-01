import express from 'express';
import { getDriverProfile, updateStatus, updateLocation, getEarnings } from '../controllers/driver.controller.js';
import { requireDriver } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', requireDriver, getDriverProfile);
router.put('/status', requireDriver, updateStatus);
router.put('/location', requireDriver, updateLocation);
router.get('/earnings', requireDriver, getEarnings);

export default router;
