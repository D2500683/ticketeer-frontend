import { useState } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, Users, Clock, CreditCard, ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { API_CONFIG } from '@/config/api'

// API function to fetch single event
const fetchEvent = async (id: string) => {
  const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(id));
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
};

// Helper function to format date and time
const formatDateTime = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const dateStr = start.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const timeStr = `${start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })} - ${end.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })}`;
  
  return { dateStr, timeStr };
};

// Helper function to get event image
const getEventImage = (event: any) => {
  if (event.flyerUrl) return event.flyerUrl;
  if (event.images && event.images.length > 0) return event.images[0].url;
  return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop';
};

// Generate subtle gradient background with accent color at top
const generateGradientBackground = (color: string) => {
  if (!color) return {};
  
  // Convert hex to RGB for gradient calculations
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create very subtle accent color at top
  const subtleAccent = `rgba(${r}, ${g}, ${b}, 0.15)`;
  
  return {
    background: `linear-gradient(180deg, ${subtleAccent} 0%, transparent 40%), hsl(var(--background))`,
    transition: 'background 0.5s ease-in-out'
  };
};

interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
  price: number;
  name: string;
}

const TicketPurchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection[]>([]);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
  });

  const updateTicketQuantity = (ticketType: any, change: number) => {
    setSelectedTickets(prev => {
      const existing = prev.find(t => t.ticketTypeId === ticketType._id);
      const newQuantity = existing ? existing.quantity + change : change;
      
      if (newQuantity <= 0) {
        return prev.filter(t => t.ticketTypeId !== ticketType._id);
      }
      
      const maxQuantity = ticketType.quantity - ticketType.sold;
      const finalQuantity = Math.min(newQuantity, maxQuantity);
      
      if (existing) {
        return prev.map(t => 
          t.ticketTypeId === ticketType._id 
            ? { ...t, quantity: finalQuantity }
            : t
        );
      } else {
        return [...prev, {
          ticketTypeId: ticketType._id,
          quantity: finalQuantity,
          price: ticketType.price,
          name: ticketType.name
        }];
      }
    });
  };

  const getTicketQuantity = (ticketTypeId: string) => {
    return selectedTickets.find(t => t.ticketTypeId === ticketTypeId)?.quantity || 0;
  };

  const getTotalPrice = () => {
    return selectedTickets.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0);
  };

  const getTotalTickets = () => {
    return selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0);
  };

  const handleProceedToCheckout = () => {
    if (selectedTickets.length === 0) return;
    
    // Store ticket selection in sessionStorage for checkout
    sessionStorage.setItem('ticketSelection', JSON.stringify({
      eventId: id,
      tickets: selectedTickets,
      totalPrice: getTotalPrice(),
      totalTickets: getTotalTickets()
    }));
    
    navigate('/checkout');
  };

  if (isLoading) return <div>Loading...</div>;

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-300">The event you're looking for doesn't exist.</p>
          <Link to="/events">
            <Button className="mt-4 bg-white text-black hover:bg-gray-100">Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { dateStr, timeStr } = formatDateTime(event.startDate, event.endDate);
  
  // Get accent color from event data
  const accentColor = event.selectedAccentColor;

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white"
      style={accentColor ? generateGradientBackground(accentColor) : {}}
    >
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to={`/event/${id}`}>
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-gray-300 hover:text-white hover:bg-gray-700 text-sm">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Back to Event</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="font-bold text-xs sm:text-sm text-white">T</span>
                </div>
                <span className="font-bold text-lg sm:text-xl text-white">Ticketeer</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {getTotalTickets() > 0 && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300">
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Event Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="lg:sticky lg:top-8 bg-gray-800 border-gray-700">
              <div className="relative">
                <img
                  src={getEventImage(event)}
                  alt={event.name}
                  className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center text-white">
                  <div className="text-xs font-medium">{dateStr.split(',')[0]}</div>
                  <div className="text-xs sm:text-sm font-bold">{timeStr.split(' - ')[0]}</div>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{event.name}</h2>
                <div className="space-y-2 sm:space-y-3 text-gray-300">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{event.venueName || event.location}</span>
                  </div>
                  {event.totalTicketsSold > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{event.totalTicketsSold} attending</span>
                    </div>
                  )}
                </div>
                {event.category && (
                  <Badge className="mt-3 sm:mt-4 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border-orange-500/30">
                    {event.category}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ticket Selection */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Select Tickets</h1>
              <p className="text-gray-300 text-sm sm:text-base">Choose your ticket type and quantity</p>
            </div>

            {/* Ticket Types */}
            <div className="space-y-3 sm:space-y-4">
              {event.ticketTypes && event.ticketTypes.length > 0 ? (
                event.ticketTypes.map((ticketType: any, index: number) => {
                  const available = ticketType.quantity - ticketType.sold;
                  const selectedQuantity = getTicketQuantity(ticketType._id);
                  const isAvailable = available > 0;
                  
                  return (
                    <Card key={index} className={`bg-gray-800 border-gray-700 ${!isAvailable ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-white">
                                {ticketType.name}
                              </h3>
                              <span className="text-xl sm:text-2xl font-bold text-white">
                                Rs {ticketType.price.toFixed(2)}
                              </span>
                            </div>
                            {ticketType.description && (
                              <p className="text-gray-300 mb-2 text-sm sm:text-base">{ticketType.description}</p>
                            )}
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                              <span>{available} available</span>
                              {!isAvailable && <span className="text-red-400 font-medium">Sold Out</span>}
                            </div>
                          </div>
                          
                          {isAvailable && (
                            <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTicketQuantity(ticketType, -1)}
                                disabled={selectedQuantity === 0}
                                className="w-8 h-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium text-white text-sm sm:text-base">
                                {selectedQuantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTicketQuantity(ticketType, 1)}
                                disabled={selectedQuantity >= available}
                                className="w-8 h-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <p className="text-gray-300">No ticket information available for this event.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            {selectedTickets.length > 0 && (
              <Card className="border-orange-500/30 bg-orange-500/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.ticketTypeId} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">
                        {ticket.name} × {ticket.quantity}
                      </span>
                      <span className="font-semibold text-white text-sm sm:text-base">
                        Rs {(ticket.price * ticket.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-600 pt-3 sm:pt-4">
                    <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-white">Rs {getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Event Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 text-white">Event Information</h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {event.shortSummary || event.description || 'More details about this event will be available soon.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase;
