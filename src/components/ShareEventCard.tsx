import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SocialShare from './SocialShare';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';

interface ShareEventCardProps {
  event: {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    location: string;
    image?: string;
    ticketTypes: Array<{
      name: string;
      price: number;
      available: number;
    }>;
    totalTicketsSold?: number;
    maxCapacity?: number;
  };
  variant?: 'compact' | 'full';
  showStats?: boolean;
}

const ShareEventCard: React.FC<ShareEventCardProps> = ({ 
  event, 
  variant = 'full',
  showStats = true 
}) => {
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

  const getAvailableTickets = () => {
    return event.ticketTypes.reduce((sum, ticket) => sum + ticket.available, 0);
  };

  const getTicketsSold = () => {
    return event.totalTicketsSold || 0;
  };

  const getPopularityLevel = () => {
    const soldPercentage = event.maxCapacity 
      ? (getTicketsSold() / event.maxCapacity) * 100 
      : 0;
    
    if (soldPercentage > 80) return { label: 'Almost Sold Out', color: 'bg-red-500' };
    if (soldPercentage > 60) return { label: 'Popular', color: 'bg-orange-500' };
    if (soldPercentage > 30) return { label: 'Trending', color: 'bg-blue-500' };
    return { label: 'Available', color: 'bg-green-500' };
  };

  const popularity = getPopularityLevel();

  if (variant === 'compact') {
    return (
      <Card className="w-full max-w-sm mx-auto bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{event.name}</h3>
              <Badge className={`${popularity.color} text-white text-xs`}>
                {popularity.label}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <SocialShare 
              event={event} 
              customMessage={`🎉 Don't miss ${event.name}! Limited tickets available.`}
              showInline={true}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {event.name}
            </CardTitle>
            <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
              {event.description}
            </p>
          </div>
          <Badge className={`${popularity.color} text-white shrink-0`}>
            {popularity.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Event Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {showStats && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Available Tickets</p>
                  <p className="text-sm text-gray-600">{getAvailableTickets()} remaining</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Attendees</p>
                  <p className="text-sm text-gray-600">{getTicketsSold()} going</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Types Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Ticket Options</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {event.ticketTypes.slice(0, 3).map((ticket, index) => (
              <div key={index} className="flex justify-between items-center bg-white rounded px-3 py-2">
                <span className="text-sm font-medium text-gray-700">{ticket.name}</span>
                <span className="text-sm font-bold text-gray-900">
                  {ticket.price > 0 ? `Rs ${ticket.price}` : 'Free'}
                </span>
              </div>
            ))}
            {event.ticketTypes.length > 3 && (
              <div className="flex items-center justify-center bg-gray-100 rounded px-3 py-2">
                <span className="text-xs text-gray-500">+{event.ticketTypes.length - 3} more</span>
              </div>
            )}
          </div>
        </div>

        {/* Social Share Section */}
        <div className="border-t pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Share this event</h4>
              <p className="text-sm text-gray-600">Help spread the word and invite friends!</p>
            </div>
            <SocialShare 
              event={event}
              customMessage={`🎉 You're invited to ${event.name}! Join me for an amazing experience. Tickets are selling fast!`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareEventCard;
