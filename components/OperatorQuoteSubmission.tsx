import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from './ui';
import { useStore } from '../context/Store';
import { BookingRequest, QuoteResponse, VehicleCategory } from '../types';
import { Clock, MapPin, Users, DollarSign, CheckCircle, XCircle, Edit2, Send, AlertCircle } from 'lucide-react';

export const OperatorQuoteSubmission: React.FC = () => {
  const { incomingRequests, submitQuote, user } = useStore();
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    price: 0,
    vehicleId: '',
    driverId: '',
    notes: '',
    estimatedPickupTime: '',
  });
  const [filter, setFilter] = useState<'pending' | 'quoted' | 'all'>('pending');

  // Filter requests
  const filteredRequests = incomingRequests.filter(req => {
    if (filter === 'pending') return !req.quotes || req.quotes.length === 0;
    if (filter === 'quoted') return req.quotes && req.quotes.length > 0;
    return true;
  });

  const handleSubmitQuote = async () => {
    if (!selectedRequest) return;

    const quote: QuoteResponse = {
      bookingId: selectedRequest.id!,
      operatorId: user?.companyId!,
      price: quoteForm.price,
      vehicleId: quoteForm.vehicleId,
      driverId: quoteForm.driverId,
      notes: quoteForm.notes,
      estimatedPickupTime: new Date(quoteForm.estimatedPickupTime).getTime(),
      status: 'pending',
      submittedAt: Date.now(),
    };

    await submitQuote(quote);

    // Reset form
    setSelectedRequest(null);
    setQuoteForm({
      price: 0,
      vehicleId: '',
      driverId: '',
      notes: '',
      estimatedPickupTime: '',
    });
  };

  const RequestCard = ({ request }: { request: BookingRequest }) => {
    const hasQuoted = request.quotes?.some(q => q.operatorId === user?.companyId);

    return (
      <Card
        className={`cursor-pointer transition-all hover:border-gold-500 ${selectedRequest?.id === request.id ? 'border-gold-500 bg-gold-500/5' : ''
          } ${hasQuoted ? 'border-l-4 border-l-green-500' : ''}`}
        onClick={() => setSelectedRequest(request)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                {request.type.toUpperCase()}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${hasQuoted ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                {hasQuoted ? 'Quote Submitted' : 'Pending Quote'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin size={14} />
                <span className="text-white">{request.pickupLocation}</span>
              </div>
              {request.dropoffLocation && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin size={14} />
                  <span className="text-white">{request.dropoffLocation}</span>
                </div>
              )}
              <div className="flex items-center gap-4 text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {request.date} {request.time}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {request.passengerCount} pax
                </span>
              </div>
            </div>

            {request.estimatedPrice && (
              <div className="mt-3 text-gold-500 font-medium">
                Est. ${request.estimatedPrice}
              </div>
            )}

            {hasQuoted && request.quotes && (
              <div className="mt-3 p-2 bg-green-500/10 rounded text-sm">
                <div className="text-green-500 flex items-center gap-1">
                  <CheckCircle size={14} />
                  Your quote: ${request.quotes.find(q => q.operatorId === user?.companyId)?.price}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Request List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif text-white">Incoming Requests</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-sm rounded ${filter === 'pending' ? 'bg-gold-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
            >
              Pending ({incomingRequests.filter(r => !r.quotes || r.quotes.length === 0).length})
            </button>
            <button
              onClick={() => setFilter('quoted')}
              className={`px-3 py-1 text-sm rounded ${filter === 'quoted' ? 'bg-gold-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
            >
              Quoted ({incomingRequests.filter(r => r.quotes && r.quotes.length > 0).length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-gold-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
            >
              All ({incomingRequests.length})
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {filteredRequests.length === 0 ? (
            <Card className="text-center py-12">
              <AlertCircle className="mx-auto mb-3 text-zinc-600" size={32} />
              <p className="text-zinc-400">No requests found</p>
            </Card>
          ) : (
            filteredRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </div>
      </div>

      {/* Right: Quote Form */}
      <div>
        {selectedRequest ? (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Submit Quote</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-zinc-400 hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Request Summary */}
              <div className="bg-zinc-900 p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Request Details</h4>
                <div className="text-white space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Type:</span>
                    <span>{selectedRequest.type.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vehicle:</span>
                    <span>{selectedRequest.vehicleCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Pickup:</span>
                    <span className="truncate ml-2">{selectedRequest.pickupLocation}</span>
                  </div>
                  {selectedRequest.dropoffLocation && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Dropoff:</span>
                      <span className="truncate ml-2">{selectedRequest.dropoffLocation}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-400">When:</span>
                    <span>{selectedRequest.date} {selectedRequest.time}</span>
                  </div>
                  {selectedRequest.estimatedPrice && (
                    <div className="flex justify-between pt-2 border-t border-zinc-800">
                      <span className="text-zinc-400">Est. Price:</span>
                      <span className="text-gold-500 font-medium">${selectedRequest.estimatedPrice}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Form */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  <DollarSign size={14} className="inline mr-1" />
                  Your Quote Price
                </label>
                <Input
                  type="number"
                  value={quoteForm.price || ''}
                  onChange={e => setQuoteForm({ ...quoteForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter price"
                  className="bg-zinc-900"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Recommended: ${selectedRequest.estimatedPrice}
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Vehicle Assignment</label>
                <Input
                  placeholder="Vehicle ID or Plate"
                  value={quoteForm.vehicleId}
                  onChange={e => setQuoteForm({ ...quoteForm, vehicleId: e.target.value })}
                  className="bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Driver Assignment</label>
                <Input
                  placeholder="Driver ID or Name"
                  value={quoteForm.driverId}
                  onChange={e => setQuoteForm({ ...quoteForm, driverId: e.target.value })}
                  className="bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Estimated Pickup Time</label>
                <Input
                  type="datetime-local"
                  value={quoteForm.estimatedPickupTime}
                  onChange={e => setQuoteForm({ ...quoteForm, estimatedPickupTime: e.target.value })}
                  className="bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={quoteForm.notes}
                  onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white"
                  rows={3}
                  placeholder="Special accommodations, route details, etc."
                />
              </div>

              <Button
                onClick={handleSubmitQuote}
                className="w-full"
                disabled={!quoteForm.price || !quoteForm.vehicleId || !quoteForm.driverId}
              >
                <Send size={16} className="mr-2" />
                Submit Quote
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-20">
            <Edit2 className="mx-auto mb-3 text-zinc-600" size={48} />
            <p className="text-zinc-400">Select a request to submit a quote</p>
          </Card>
        )}
      </div>
    </div>
  );
};
