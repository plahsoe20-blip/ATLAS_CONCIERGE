import { Driver, User } from '../models/index.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// Get driver profile
export const getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findByUserId(req.user.id);
    if (!driver) {
      throw new NotFoundError('Driver profile not found');
    }

    const user = await User.findById(req.user.id);

    res.json({
      driver,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Update driver status
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['ONLINE', 'OFFLINE', 'BUSY'].includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const driver = await Driver.findByUserId(req.user.id);
    if (!driver) {
      throw new NotFoundError('Driver profile not found');
    }

    const updated = await Driver.update(driver.id, { status });

    logger.info(`Driver ${driver.id} status updated to ${status}`);

    res.json({
      message: 'Status updated',
      driver: updated
    });
  } catch (error) {
    next(error);
  }
};

// Update driver location
export const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng, heading, speed } = req.body;

    const driver = await Driver.findByUserId(req.user.id);
    if (!driver) {
      throw new NotFoundError('Driver profile not found');
    }

    const updated = await Driver.update(driver.id, {
      currentLocation: { lat, lng, heading, speed, timestamp: Date.now() }
    });

    res.json({
      message: 'Location updated',
      location: updated.currentLocation
    });
  } catch (error) {
    next(error);
  }
};

// Get driver earnings
export const getEarnings = async (req, res, next) => {
  try {
    const driver = await Driver.findByUserId(req.user.id);
    if (!driver) {
      throw new NotFoundError('Driver profile not found');
    }

    // Mock earnings data (should calculate from completed bookings)
    const earnings = {
      today: 245.50,
      thisWeek: 1250.75,
      thisMonth: 4890.25,
      totalTrips: driver.totalTrips,
      rating: driver.rating
    };

    res.json({ earnings });
  } catch (error) {
    next(error);
  }
};
