import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SocialShareButton from './SocialShareButton';
import { useSocialShare } from '@/hooks/useSocialShare';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Ticket, 
  Users,
  Share2,
  Sparkles 
} from 'lucide-react';

interface ConfirmationShareProps {
  order: {
    orderNumber: string;
    totalAmount: number;
    tickets: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  event: {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    location: string;
    image?: string;
  };
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ConfirmationShare: React.FC<ConfirmationShareProps> = ({
  order,
  event,
  customerInfo
}) => {
  const { generateTicketShareData } = useSocialShare();

  const shareData = generateTicketShareData(event, order.orderNumber);
  const hashtags = ['Event', 'Tickets', 'Fun', event.name.replace(/\s+/g, '')];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MU', {
      style: 'currency',
      currency: 'MUR'
    }).format(amount);
  };

  const totalTickets = order.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            🎉 You're Going to {event.name}!
          </h2>
          <p className="text-green-700">
            Order #{order.orderNumber} confirmed • {totalTickets} ticket{totalTickets > 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Your Tickets</p>
                  <p className="text-sm text-gray-600">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Attendee</p>
                  <p className="text-sm text-gray-600">{customerInfo.firstName} {customerInfo.lastName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Ticket Summary</h4>
            <div className="space-y-2">
              {order.tickets.map((ticket, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    {ticket.quantity}x {ticket.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(ticket.price * ticket.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Share2 className="h-5 w-5" />
            Share Your Excitement!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-blue-700 mb-4">
              Let your friends know you're going! Share on social media and invite them to join you.
            </p>
            
            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <SocialShareButton
                platform="facebook"
                data={shareData}
                hashtags={hashtags}
                size="sm"
                className="w-full"
              />
              
              <SocialShareButton
                platform="instagram"
                data={shareData}
                hashtags={hashtags}
                size="sm"
                className="w-full"
              />
              
              <SocialShareButton
                platform="whatsapp"
                data={shareData}
                hashtags={hashtags}
                size="sm"
                className="w-full"
              />
              
              <SocialShareButton
                platform="copy"
                data={shareData}
                size="sm"
                variant="outline"
                className="w-full"
              />
            </div>

            {/* Share Preview */}
            <div className="bg-white rounded-lg p-4 border border-blue-200 text-left">
              <h5 className="font-medium text-gray-900 mb-2">Share Preview:</h5>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{shareData.title}</p>
                <p className="text-xs text-gray-600">{shareData.text}</p>
                <p className="text-xs text-blue-600 break-all">{shareData.url}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Check Your Email</p>
                <p>Your tickets have been sent to {customerInfo.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Save the Date</p>
                <p>Add this event to your calendar so you don't miss it</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Invite Friends</p>
                <p>Share the event and make it even more fun together</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationShare;
