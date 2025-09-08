import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, MapPin, Users, Clock, CheckCircle, Download, ArrowLeft, Mail, Smartphone, QrCode, ArrowRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { API_CONFIG } from '@/config/api'
import ConfirmationShare from '@/components/ConfirmationShare'

// API function to fetch order details
const fetchOrder = async (orderId: string) => {
  const response = await fetch(API_CONFIG.ENDPOINTS.ORDERS.GET_BY_ID(orderId));
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
};

// API function to fetch event details
const fetchEvent = async (eventId: string) => {
  const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(eventId));
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
};

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
  });

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', order?.eventId],
    queryFn: () => fetchEvent(order.eventId),
    enabled: !!order?.eventId,
  });

  const isLoading = orderLoading || eventLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Processing your order...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we confirm your ticket purchase</p>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Link to="/events">
            <Button className="w-full sm:w-auto">Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const eventDateTime = event ? formatDateTime(event.startDate) : null;
  const orderDateTime = formatDateTime(order.createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="font-bold text-xs sm:text-sm text-white">T</span>
              </div>
              <span className="font-bold text-lg sm:text-xl text-gray-900">Ticketeer</span>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link to="/events" className="text-sm sm:text-base text-gray-600 hover:text-gray-900">
                <span className="hidden sm:inline">Browse Events</span>
                <span className="sm:hidden">Events</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Your tickets have been purchased successfully
          </p>
          <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-200 text-xs sm:text-sm">
            Order #{order._id.slice(-8).toUpperCase()}
          </Badge>
        </div>

        {/* Enhanced Confirmation with Social Sharing */}
        {event && order && (
          <ConfirmationShare
            order={{
              orderNumber: order._id.slice(-8).toUpperCase(),
              totalAmount: order.totalAmount,
              tickets: order.tickets
            }}
            event={{
              _id: event._id,
              name: event.name,
              description: event.description || event.shortSummary || '',
              startDate: event.startDate,
              location: event.venueName || event.location,
              image: event.flyerUrl
            }}
            customerInfo={order.customerInfo}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
          {/* Left Column - Additional Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Name</p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Email</p>
                    <p className="font-medium text-sm sm:text-base break-all">{order.customerInfo.email}</p>
                  </div>
                </div>
                {order.customerInfo.phone && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-sm sm:text-base">{order.customerInfo.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Order Date</span>
                    <span className="text-right">{orderDateTime.date}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Order Time</span>
                    <span>{orderDateTime.time}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span>Payment Status</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {order.tickets.map((ticket: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs sm:text-sm">
                      <span className="truncate pr-2">{ticket.name} × {ticket.quantity}</span>
                      <span className="flex-shrink-0">Rs{(ticket.price * ticket.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Subtotal</span>
                    <span>Rs{(order.totalAmount / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Service Fee</span>
                    <span>Rs{(order.totalAmount * 0.05 / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm sm:text-base">
                    <span>Total</span>
                    <span>Rs{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            

            {/* Browse More Events */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 sm:p-6 text-center">
                <h3 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">
                  Discover More Events
                </h3>
                <p className="text-xs sm:text-sm text-orange-700 mb-3 sm:mb-4">
                  Find other amazing events happening in your area
                </p>
                <Link to="/">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto h-9 sm:h-10 text-sm">
                    Browse Events
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
