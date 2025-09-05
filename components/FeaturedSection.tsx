import { ArrowRight, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { API_CONFIG } from '@/config/api'

// API function to fetch events
const fetchEvents = async () => {
  const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

const FeaturedSection = () => {
  // Fetch events data
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  // Randomly select a featured event that changes on each component mount/reload
  const featuredEvent = useMemo(() => {
    if (events.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  }, [events]);

  // Format date and time
  const formatEventDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };
  return (
    <section className="px-6 mt-16">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Editorial Story */}
          <div className="story-card">
            <div className="mb-4">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Community Spotlight
              </span>
            </div>
            <h2 className="text-3xl font-cal font-bold mb-4 text-foreground">
              How Local Events Are Bringing Communities Together
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Discover the inspiring stories of event organizers who are creating meaningful 
              connections in their neighborhoods. From intimate cooking classes to outdoor 
              music gatherings, these community builders are proving that the best experiences 
              happen when people come together.
            </p>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80 font-semibold p-0 group"
            >
              Read Full Story
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Featured Event Card */}
          {isLoading ? (
            <div className="event-card p-0 overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <div className="bg-gray-300 h-6 w-16 rounded-full"></div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-300 h-4 w-full mb-2 rounded"></div>
                <div className="bg-gray-300 h-4 w-2/3 mb-4 rounded"></div>
                <div className="flex items-center justify-between">
                  <div className="bg-gray-300 h-4 w-20 rounded"></div>
                  <div className="bg-gray-300 h-10 w-24 rounded-full"></div>
                </div>
              </div>
            </div>
          ) : featuredEvent ? (
            <div className="event-card p-0 overflow-hidden">
              <div 
                className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20"
                style={{
                  backgroundImage: featuredEvent.flyerUrl ? `url(${featuredEvent.flyerUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-cal font-bold mb-2 line-clamp-2">
                    {featuredEvent.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm opacity-90">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatEventDateTime(featuredEvent.startDate).date}, {formatEventDateTime(featuredEvent.startDate).time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{featuredEvent.venueName || featuredEvent.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {featuredEvent.description || "Join us for an amazing event experience!"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Starting at <span className="font-semibold text-foreground">
                      {featuredEvent.ticketTypes && featuredEvent.ticketTypes.length > 0 
                        ? `Rs${Math.min(...featuredEvent.ticketTypes.map(t => t.price)).toFixed(2)}`
                        : 'Free'
                      }
                    </span>
                  </div>
                  <Link to={`/event/${featuredEvent._id}`}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                      Get Tickets
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="event-card p-0 overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-lg font-semibold">No events available</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground mb-4">
                  Check back soon for exciting upcoming events!
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Coming soon
                  </div>
                  <Link to="/events">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FeaturedSection