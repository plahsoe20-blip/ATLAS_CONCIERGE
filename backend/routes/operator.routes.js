import express from 'express';
import {
  getOperatorProfile,
  getDashboard,
  submitQuote,
  getFleet,
  addVehicle,
  getDrivers,
  addDriver
} from '../controllers/operator.controller.js';
import { requireOperator } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', requireOperator, getOperatorProfile);
router.get('/dashboard', requireOperator, getDashboard);
router.post('/quotes', requireOperator, submitQuote);
router.get('/fleet', requireOperator, getFleet);
router.post('/fleet', requireOperator, addVehicle);
router.get('/drivers', requireOperator, getDrivers);
router.post('/drivers', requireOperator, addDriver);

export default router;
