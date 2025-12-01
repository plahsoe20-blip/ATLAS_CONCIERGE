import { Operator, Driver, Vehicle, Booking, Quote } from '../models/index.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// Get operator profile
export const getOperatorProfile = async (req, res, next) => {
  try {
    const operator = await Operator.findByUserId(req.user.id);
    if (!operator) {
      throw new NotFoundError('Operator profile not found');
    }

    res.json({ operator });
  } catch (error) {
    next(error);
  }
};

// Get operator dashboard stats
export const getDashboard = async (req, res, next) => {
  try {
    const operator = await Operator.findByUserId(req.user.id);
    if (!operator) {
      throw new NotFoundError('Operator profile not found');
    }

    const drivers = await Driver.findAll({ operatorId: operator.id });
    const vehicles = await Vehicle.findAll({ operatorId: operator.id });
    const bookings = await Booking.findAll({ operatorId: operator.id });

    const stats = {
      totalDrivers: drivers.length,
      onlineDrivers: drivers.filter(d => d.status === 'ONLINE').length,
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter(v => v.status === 'AVAILABLE').length,
      activeBookings: bookings.filter(b => ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'IN_PROGRESS'].includes(b.status)).length,
      totalBookings: operator.totalBookings,
      rating: operator.rating
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

// Submit quote for booking
export const submitQuote = async (req, res, next) => {
  try {
    const { bookingId, vehicleId, price, eta, notes } = req.body;

    if (!bookingId || !vehicleId || !price) {
      throw new ValidationError('Booking ID, vehicle ID, and price are required');
    }

    const operator = await Operator.findByUserId(req.user.id);
    if (!operator) {
      throw new NotFoundError('Operator profile not found');
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.operatorId !== operator.id) {
      throw new ForbiddenError('Vehicle not found or not owned by operator');
    }

    const quote = await Quote.create({
      bookingId,
      operatorId: operator.id,
      vehicleId,
      price,
      eta: eta || 15,
      notes: notes || ''
    });

    logger.info(`Quote submitted: ${quote.id} by operator ${operator.id}`);

    res.status(201).json({
      message: 'Quote submitted successfully',
      quote
    });
  } catch (error) {
    next(error);
  }
};

// Get fleet (vehicles)
export const getFleet = async (req, res, next) => {
  try {
    const operator = await Operator.findByUserId(req.user.id);
    if (!operator) {
      throw new NotFoundError('Operator profile not found');
    }

    const vehicles = await Vehicle.findAll({ operatorId: operator.id });

    res.json({ vehicles });
  } catch (error) {
    next(error);
  }
};

// Add vehicle
export const addVehicle = async (req, res, next) => {
  try {
    const { category, name, plateNumber, maxPassengers, maxLuggage, image, features } = req.body;

    if (!category || !name || !plateNumber) {
      throw new ValidationError('Category, name, and plate number are required');
    }

    const operator = await Operator.findByUserId(req.user.id);
    if (!operator) {
      throw new NotFoundError('Operator profile not found');
    }

    const vehicle = await Vehicle.create({
      operatorId: operator.id,
      category,
      name,
      plateNumber,
      maxPassengers: maxPassengers || 4,
      maxLuggage: maxLuggage || 2,
      image: image || '',
      features: features || []
    });

    logger.info(`Vehicle added: ${vehicle.id} by operator ${operator.id}`);

    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Get drivers
export const getDrivers = async (req, res, next) => {
  try {
    const operator = await Operator.findByUserId(req.user.id);
    if (!operator) {
      throw new NotFoundError('Operator profile not found');
    }

    const drivers = await Driver.findAll({ operatorId: operator.id });

    res.json({ drivers });
  } catch (error) {
    next(error);
  }
};

// Add driver
export const addDriver = async (req, res, next) => {
  try {
    const { userId, licenseNumber, licenseExpiry } = req.body;

    if (!userId || !licenseNumber || !licenseExpiry) {
      throw new ValidationError('User ID, license number, and expiry are required');
    }

    const operator = await Operator.findByUserId(req.user.id);
    if (!operator) {
      throw new NotFoundError('Operator profile not found');
    }

    const driver = await Driver.create({
      userId,
      operatorId: operator.id,
      licenseNumber,
      licenseExpiry
    });

    logger.info(`Driver added: ${driver.id} by operator ${operator.id}`);

    res.status(201).json({
      message: 'Driver added successfully',
      driver
    });
  } catch (error) {
    next(error);
  }
};
