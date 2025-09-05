import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, MapPin, Clock, Users, Search, Filter, Star, Heart, Share2 } from 'lucide-react';
import { API_CONFIG } from '@/config/api';
import { Loading } from "@/components/ui/loading";

// API function to fetch all public events
const fetchPublicEvents = async () => {
  const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

// Helper function to format date
const formatEventDate = (startDate: string) => {
  const date = new Date(startDate);
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate(),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    time: date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  };
};

// Helper function to get event image
const getEventImage = (event: any) => {
  if (event.flyerUrl) return event.flyerUrl;
  if (event.images && event.images.length > 0) return event.images[0].url;
  return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop';
};

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['public-events'],
    queryFn: fetchPublicEvents,
  });

  // Filter events based on search and category
  const filteredEvents = events?.filter((event: any) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                           event.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = ["all", "music", "wellness", "art", "food", "sports", "tech"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load events</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="font-bold text-sm text-white">T</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Ticketeer</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/events" className="text-gray-900 font-medium">Events</Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link to="/signup">
                <Button className="bg-orange-500 hover:bg-orange-600">Sign Up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Find and book tickets for the best events in your city
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search events, venues, or organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900 rounded-full border-0 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Categories:</span>
            </div>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`capitalize whitespace-nowrap ${
                  selectedCategory === category 
                    ? "bg-orange-500 hover:bg-orange-600" 
                    : "hover:bg-gray-100"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory === "all" ? "All Events" : `${selectedCategory} Events`}
            </h2>
            <p className="text-gray-600">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event: any) => {
                const eventDate = formatEventDate(event.startDate);
                const minPrice = event.ticketTypes?.length > 0 
                  ? Math.min(...event.ticketTypes.map((t: any) => t.price))
                  : null;

                return (
                  <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative">
                      <img
                        src={getEventImage(event)}
                        alt={event.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 bg-white rounded-lg p-2 text-center shadow-md">
                        <div className="text-xs font-semibold text-orange-500">{eventDate.month}</div>
                        <div className="text-lg font-bold text-gray-900">{eventDate.day}</div>
                      </div>
                      {event.category && (
                        <Badge className="absolute top-4 right-4 bg-black/70 text-white">
                          {event.category}
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {event.name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>{eventDate.weekday}, {eventDate.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.venueName || event.location}</span>
                        </div>
                        {event.totalTicketsSold > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{event.totalTicketsSold} attending</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.shortSummary || event.description}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-left">
                          {minPrice ? (
                            <div>
                              <span className="text-sm text-gray-500">From</span>
                              <div className="text-xl font-bold text-gray-900">Rs{minPrice.toFixed(2)}</div>
                            </div>
                          ) : (
                            <div className="text-lg font-semibold text-gray-900">Free</div>
                          )}
                        </div>
                        <Link to={`/event/${event._id}`}>
                          <Button className="bg-orange-500 hover:bg-orange-600">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-xl">Ticketeer</span>
              </div>
              <p className="text-gray-400">
                Discover and book amazing events in your city.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Events</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/events" className="hover:text-white">Browse Events</Link></li>
                <li><Link to="/events?category=music" className="hover:text-white">Music</Link></li>
                <li><Link to="/events?category=wellness" className="hover:text-white">Wellness</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Refund Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Organizers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Create Event</Link></li>
                <li><Link to="/login" className="hover:text-white">Manage Events</Link></li>
                <li><Link to="/signup" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ticketeer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Events;
