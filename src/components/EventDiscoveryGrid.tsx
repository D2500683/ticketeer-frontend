import { Clock, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// API function to fetch events
const fetchEvents = async () => {
  try {
    console.log('Fetching events from:', 'http://localhost:3001/api/events?limit=100');
    const response = await fetch('http://localhost:3001/api/events?limit=100');
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    console.log('Events array:', data.events);
    console.log('Events count:', data.events?.length);
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Helper function to format date
const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};

// Helper function to get display image
const getEventImage = (event: any) => {
  if (event.flyerUrl) return event.flyerUrl;
  if (event.images && event.images.length > 0) return event.images[0].url;
  // Fallback to placeholder based on event type/name
  const name = event.name.toLowerCase();
  if (name.includes('wellness') || name.includes('yoga') || name.includes('ritual')) {
    return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop';
  }
  if (name.includes('music') || name.includes('jazz') || name.includes('concert')) {
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop';
};

// Helper function to determine card size based on event importance
const getEventSize = (event: any, index: number) => {
  if (index === 0) return 'large'; // First event is large
  if (event.ticketTypes?.some((t: any) => t.sold > 50)) return 'medium'; // Popular events
  return Math.random() > 0.7 ? 'medium' : 'small'; // Random distribution for visual variety
};

const EventDiscoveryGrid = () => {
  const navigate = useNavigate();
  
  const { data: eventsData, isLoading, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 30 * 1000, // 30 seconds - shorter cache for new events
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Extract events array from the API response object
  const events = Array.isArray(eventsData) ? eventsData : (eventsData?.events || []);
  
  console.log('eventsData:', eventsData);
  console.log('eventsData type:', typeof eventsData);
  console.log('eventsData keys:', eventsData ? Object.keys(eventsData) : 'undefined');
  console.log('events:', events);
  console.log('events.length:', events.length);
  console.log('All event names:', events.map(e => e.name));

  const handleViewEvent = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  if (isLoading) {
    return (
      <section className="mt-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Discover Upcoming Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find your next adventure with events happening in your community
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Discover Upcoming Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unable to load events. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) {
    return (
      <section className="mt-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Discover Upcoming Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No events available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16">
      {/* Header section with container */}
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Discover Upcoming Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find your next adventure with events happening in your community
          </p>
        </div>
      </div>

      {/* Mobile: Full width with padding, Desktop: Container with columns */}
      <div className="md:container md:mx-auto md:px-6">
        {/* Mobile: Flex column */}
        <div className="flex flex-col gap-4 px-4 md:hidden">
          {events.map((event, index) => (
            <div 
              key={event._id} 
              className={`relative rounded-lg overflow-hidden shadow-lg group cursor-pointer ${
                getEventSize(event, index) === 'large' ? 'h-80' : 
                getEventSize(event, index) === 'medium' ? 'h-64' : 'h-48'
              }`}
            >
              <img 
                src={getEventImage(event)} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
              
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Content overlay */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                    {formatEventDate(event.startDate)}
                  </div>
                  {(event.status === 'published' || event.status === 'draft') && (
                    <div className="text-xs font-medium bg-green-500/80 px-2 py-1 rounded">
                      {event.status === 'published' ? 'Open' : 'Preview'}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-1 leading-tight">
                    {event.name}
                  </h3>
                  {event.shortSummary && (
                    <p className="text-sm opacity-90 mb-2">
                      {event.shortSummary}
                    </p>
                  )}
                  <p className="text-xs opacity-80 mb-3">
                    {event.venueName || event.location}
                  </p>
                  
                  {/* Attendees Preview */}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-2">
                        {event.attendees.slice(0, 3).map((attendee: any, idx: number) => (
                          <Avatar key={idx} className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${attendee.user?.username || 'anonymous'}`} />
                            <AvatarFallback className="text-xs">
                              {(attendee.user?.username || 'A').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {event.attendees.length > 3 && (
                          <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white">+{event.attendees.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs opacity-80">
                        {event.totalTicketsSold} going
                      </span>
                    </div>
                  )}
                  
                  <Button 
                    size="sm"
                    onClick={() => handleViewEvent(event._id)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Event
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: CSS columns masonry layout */}
        <div className="hidden md:block md:columns-2 lg:columns-4 gap-4 space-y-4">
          {events.map((event, index) => (
            <div 
              key={event._id} 
              className={`relative break-inside-avoid rounded-lg overflow-hidden shadow-lg group cursor-pointer ${
                getEventSize(event, index) === 'large' ? 'h-80' : 
                getEventSize(event, index) === 'medium' ? 'h-64' : 'h-48'
              }`}
            >
              <img 
                src={getEventImage(event)} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
              
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Content overlay */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                    {formatEventDate(event.startDate)}
                  </div>
                  {(event.status === 'published' || event.status === 'draft') && (
                    <div className="text-xs font-medium bg-green-500/80 px-2 py-1 rounded">
                      {event.status === 'published' ? 'Open' : 'Preview'}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-1 leading-tight">
                    {event.name}
                  </h3>
                  {event.shortSummary && (
                    <p className="text-sm opacity-90 mb-2">
                      {event.shortSummary}
                    </p>
                  )}
                  <p className="text-xs opacity-80 mb-3">
                    {event.venueName || event.location}
                  </p>
                  
                  {/* Attendees Preview */}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-2">
                        {event.attendees.slice(0, 3).map((attendee: any, idx: number) => (
                          <Avatar key={idx} className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${attendee.user?.username || 'anonymous'}`} />
                            <AvatarFallback className="text-xs">
                              {(attendee.user?.username || 'A').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {event.attendees.length > 3 && (
                          <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white">+{event.attendees.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs opacity-80">
                        {event.totalTicketsSold} going
                      </span>
                    </div>
                  )}
                  
                  <Button 
                    size="sm"
                    onClick={() => handleViewEvent(event._id)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Event
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer section with container */}
    </section>
  )
}

export default EventDiscoveryGrid