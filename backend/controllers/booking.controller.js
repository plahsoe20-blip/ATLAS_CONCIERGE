import { Booking, Quote, Transaction } from '../models/index.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import { calculateQuote } from '../services/pricing.service.js';
import { broadcastToOperators } from '../services/socket.service.js';

// Create a new booking request
export const createBooking = async (req, res, next) => {
  try {
    const { type, details, vehicleCategory } = req.body;

    // Validation
    if (!type || !details) {
      throw new ValidationError('Booking type and details are required');
    }

    // Calculate estimated price using pricing engine
    const estimatedPrice = await calculateQuote({
      type,
      vehicleCategory,
      distanceKm: details.distanceKm || 0,
      durationHours: details.durationHours || 3,
      durationDays: details.durationDays || 1,
      locationContext: details.pickupLocation
    });

    // Create booking
    const booking = await Booking.create({
      conciergeId: req.user.id,
      type,
      details,
      status: 'SOURCING',
      estimatedPrice: estimatedPrice.total
    });

    logger.info(`New booking created: ${booking.id} by ${req.user.id}`);

    // Broadcast to operators via WebSocket
    broadcastToOperators({
      type: 'NEW_BOOKING_REQUEST',
      booking
    });

    res.status(201).json({
      message: 'Booking request created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check authorization
    if (
      booking.conciergeId !== req.user.id &&
      booking.operatorId !== req.user.id &&
      booking.driverId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      throw new ForbiddenError('Access denied');
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

// Get all bookings for current user
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let filters = {};

    // Filter based on user role
    switch (req.user.role) {
      case 'CONCIERGE':
      case 'CLIENT':
        filters.conciergeId = req.user.id;
        break;
      case 'OPERATOR':
        filters.operatorId = req.user.id;
        break;
      case 'DRIVER':
        filters.driverId = req.user.id;
        break;
    }

    if (status) {
      filters.status = status;
    }

    let bookings = await Booking.findAll(filters);

    // Pagination
    const total = bookings.length;
    bookings = bookings
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      bookings,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, metadata } = req.body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Authorization check based on status transition
    // (Implement detailed state machine logic here)

    const updatedBooking = await Booking.update(id, { status, ...metadata });

    logger.info(`Booking ${id} status updated to ${status}`);

    // Notify relevant parties via WebSocket
    broadcastToOperators({
      type: 'BOOKING_STATUS_UPDATED',
      booking: updatedBooking
    });

    res.json({
      message: 'Booking status updated',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user can cancel
    if (booking.conciergeId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Only the booking creator can cancel');
    }

    // Check if cancellation is allowed (e.g., not already completed)
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      throw new ValidationError(`Cannot cancel booking with status ${booking.status}`);
    }

    const updatedBooking = await Booking.update(id, {
      status: 'CANCELLED',
      cancelledAt: Date.now(),
      cancellationReason: reason || 'No reason provided'
    });

    logger.info(`Booking ${id} cancelled by ${req.user.id}`);

    // Handle refund if payment was captured
    // (Implement refund logic here)

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Assign driver to booking (Operator only)
export const assignDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { driverId, vehicleId } = req.body;

    if (!driverId || !vehicleId) {
      throw new ValidationError('Driver ID and Vehicle ID are required');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user is the assigned operator
    if (booking.operatorId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Only the assigned operator can assign drivers');
    }

    const updatedBooking = await Booking.update(id, {
      driverId,
      vehicleId,
      status: 'DRIVER_ASSIGNED'
    });

    logger.info(`Driver ${driverId} assigned to booking ${id}`);

    // Notify driver via WebSocket
    broadcastToOperators({
      type: 'DRIVER_ASSIGNED',
      booking: updatedBooking,
      driverId
    });

    res.json({
      message: 'Driver assigned successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Accept booking (Driver only)
export const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user is the assigned driver
    if (booking.driverId !== req.user.id) {
      throw new ForbiddenError('Only the assigned driver can accept this booking');
    }

    const updatedBooking = await Booking.update(id, {
      status: 'DRIVER_EN_ROUTE'
    });

    logger.info(`Booking ${id} accepted by driver ${req.user.id}`);

    res.json({
      message: 'Booking accepted',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};
