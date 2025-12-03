import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Luggage, DollarSign, Car } from 'lucide-react';
import { Button, Input, Card } from './ui';
import { BookingType, VehicleCategory } from '../types';
import { useStore } from '../context/Store';

export const HourlyCharterBooking: React.FC = () => {
  const { pricingRules, createBookingRequest } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleCategory: VehicleCategory.SEDAN,
    pickupLocation: '',
    date: '',
    time: '',
    hours: 3,
    days: 1,
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    passengerCount: 1,
    luggageCount: 0,
    specialRequests: '',
  });
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const calculatePrice = () => {
    const rule = pricingRules[formData.vehicleCategory];
    if (!rule) return 0;

    const { hourlyRate, minHours, taxRate, driverCommissionPct } = rule;
    const effectiveHours = Math.max(formData.hours, minHours);

    // Hourly Charter Formula: hourlyRate × hours × days
    const subtotal = hourlyRate * effectiveHours * formData.days;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return Math.round(total * 100) / 100;
  };

  React.useEffect(() => {
    setEstimatedPrice(calculatePrice());
  }, [formData.vehicleCategory, formData.hours, formData.days]);

  const handleSubmit = async () => {
    const booking = {
      type: BookingType.HOURLY,
      pickupLocation: formData.pickupLocation,
      date: formData.date,
      time: formData.time,
      durationHours: formData.hours,
      durationDays: formData.days,
      vehicleCategory: formData.vehicleCategory,
      passengerName: formData.passengerName,
      passengerPhone: formData.passengerPhone,
      passengerEmail: formData.passengerEmail,
      passengerCount: formData.passengerCount,
      luggageCount: formData.luggageCount,
      specialRequests: formData.specialRequests,
      estimatedPrice,
      pickupTime: new Date(`${formData.date}T${formData.time}`).getTime(),
    };

    await createBookingRequest(booking);
    setStep(1);
    setFormData({
      vehicleCategory: VehicleCategory.SEDAN,
      pickupLocation: '',
      date: '',
      time: '',
      hours: 3,
      days: 1,
      passengerName: '',
      passengerPhone: '',
      passengerEmail: '',
      passengerCount: 1,
      luggageCount: 0,
      specialRequests: '',
    });
  };

  const VehicleOption = ({ category, label, price }: any) => (
    <button
      onClick={() => setFormData({ ...formData, vehicleCategory: category })}
      className={`p-4 border rounded-lg transition-all ${formData.vehicleCategory === category
          ? 'border-gold-500 bg-gold-500/10'
          : 'border-zinc-800 hover:border-zinc-700'
        }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-medium">{label}</p>
          <p className="text-zinc-400 text-sm">${price}/hour</p>
        </div>
        <Car className="text-gold-500" size={24} />
      </div>
    </button>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-white mb-2">Hourly Charter Booking</h2>
        <p className="text-zinc-400">Book a vehicle with a driver for multiple hours or days</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-gold-500 text-black' : 'bg-zinc-800 text-zinc-500'
                }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-gold-500' : 'bg-zinc-800'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Vehicle & Duration */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-zinc-400 mb-3">Select Vehicle Class</label>
            <div className="grid grid-cols-2 gap-3">
              <VehicleOption
                category={VehicleCategory.SEDAN}
                label="Luxury Sedan"
                price={pricingRules[VehicleCategory.SEDAN]?.hourlyRate || 95}
              />
              <VehicleOption
                category={VehicleCategory.SUV}
                label="Luxury SUV"
                price={pricingRules[VehicleCategory.SUV]?.hourlyRate || 125}
              />
              <VehicleOption
                category={VehicleCategory.SPRINTER}
                label="Executive Sprinter"
                price={pricingRules[VehicleCategory.SPRINTER]?.hourlyRate || 175}
              />
              <VehicleOption
                category={VehicleCategory.LIMO}
                label="First Class Limo"
                price={pricingRules[VehicleCategory.LIMO]?.hourlyRate || 225}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-2">Hours per Day</label>
              <Input
                type="number"
                min="1"
                max="24"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 1 })}
                className="bg-zinc-900"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Minimum: {pricingRules[formData.vehicleCategory]?.minHours || 3} hours
              </p>
            </div>
            <div>
              <label className="block text-zinc-400 mb-2">Number of Days</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                className="bg-zinc-900"
              />
            </div>
          </div>

          <div className="bg-zinc-900 p-4 rounded-lg">
            <div className="flex items-center justify-between text-white">
              <span>Estimated Total:</span>
              <span className="text-2xl font-bold text-gold-500">${estimatedPrice}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              {formData.hours} hours × {formData.days} days × $
              {pricingRules[formData.vehicleCategory]?.hourlyRate || 0}/hr + tax
            </p>
          </div>

          <Button onClick={() => setStep(2)} className="w-full">
            Continue to Details
          </Button>
        </div>
      )}

      {/* Step 2: Trip Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Starting Location
            </label>
            <Input
              placeholder="Address or landmark"
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              className="bg-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Start Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-2">
                <Clock size={16} className="inline mr-2" />
                Start Time
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="bg-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-2">
                <Users size={16} className="inline mr-2" />
                Passengers
              </label>
              <Input
                type="number"
                min="1"
                value={formData.passengerCount}
                onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) || 1 })}
                className="bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-2">
                <Luggage size={16} className="inline mr-2" />
                Luggage
              </label>
              <Input
                type="number"
                min="0"
                value={formData.luggageCount}
                onChange={(e) => setFormData({ ...formData, luggageCount: parseInt(e.target.value) || 0 })}
                className="bg-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-2">Special Requests (Optional)</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white"
              rows={3}
              placeholder="Child seats, accessibility needs, preferred route, etc."
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Passenger Info */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 mb-2">Passenger Name</label>
            <Input
              placeholder="Full name"
              value={formData.passengerName}
              onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
              className="bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-2">Phone Number</label>
            <Input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.passengerPhone}
              onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
              className="bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-2">Email (Optional)</label>
            <Input
              type="email"
              placeholder="passenger@example.com"
              value={formData.passengerEmail}
              onChange={(e) => setFormData({ ...formData, passengerEmail: e.target.value })}
              className="bg-zinc-900"
            />
          </div>

          <div className="bg-zinc-900 p-4 rounded-lg mt-6">
            <h3 className="text-white font-medium mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Vehicle:</span>
                <span className="text-white">{formData.vehicleCategory}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Duration:</span>
                <span className="text-white">{formData.hours}h × {formData.days} days</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Start:</span>
                <span className="text-white">{formData.date} at {formData.time}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between font-medium">
                <span className="text-white">Total:</span>
                <span className="text-gold-500 text-lg">${estimatedPrice}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!formData.passengerName || !formData.passengerPhone || !formData.pickupLocation}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
