import { Booking, Quote } from '../models/index.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

// Get concierge dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({ conciergeId: req.user.id });

    const stats = {
      totalBookings: bookings.length,
      activeTrips: bookings.filter(b => ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'IN_PROGRESS'].includes(b.status)).length,
      completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
      totalSpend: bookings.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + (b.finalPrice || 0), 0),
      thisMonthSpend: bookings
        .filter(b => b.status === 'COMPLETED' && b.completedAt > Date.now() - 30 * 24 * 60 * 60 * 1000)
        .reduce((sum, b) => sum + (b.finalPrice || 0), 0)
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

// Get quotes for a booking
export const getQuotes = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.conciergeId !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    const quotes = await Quote.findAll({ bookingId, status: 'PENDING' });

    res.json({ quotes });
  } catch (error) {
    next(error);
  }
};

// Accept a quote
export const acceptQuote = async (req, res, next) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    const booking = await Booking.findById(quote.bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.conciergeId !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    // Update quote
    await Quote.update(quoteId, { status: 'ACCEPTED' });

    // Decline other quotes
    const allQuotes = await Quote.findAll({ bookingId: booking.id });
    for (const q of allQuotes) {
      if (q.id !== quoteId && q.status === 'PENDING') {
        await Quote.update(q.id, { status: 'DECLINED' });
      }
    }

    // Update booking
    await Booking.update(booking.id, {
      status: 'OPERATOR_ASSIGNED',
      operatorId: quote.operatorId,
      vehicleId: quote.vehicleId,
      selectedQuoteId: quoteId,
      finalPrice: quote.price
    });

    res.json({ message: 'Quote accepted successfully' });
  } catch (error) {
    next(error);
  }
};
