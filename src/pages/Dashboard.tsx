import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, DollarSign, TrendingUp, Plus, Eye, Edit, Trash2, Music, ShoppingCart, RefreshCw, ExternalLink, Filter, Mic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { API_CONFIG } from '@/config/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { checkAuthStatus, clearAuthStorage } from "@/utils/authDebug"

// API functions
const fetchAnalytics = async (token: string) => {
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.ANALYTICS.USER, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        // Clear invalid tokens and redirect to login
        clearAuthStorage();
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(`Failed to fetch analytics: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Analytics fetch error:', error);
    // Return mock data as fallback
    return {
      totalRevenue: 0,
      totalTicketsSold: 0,
      activeEvents: 0,
      recentTicketsSold: 0,
      upcomingEvents: [],
      salesData: [
        { name: 'Mon', sales: 0, revenue: 0 },
        { name: 'Tue', sales: 0, revenue: 0 },
        { name: 'Wed', sales: 0, revenue: 0 },
        { name: 'Thu', sales: 0, revenue: 0 },
        { name: 'Fri', sales: 0, revenue: 0 },
        { name: 'Sat', sales: 0, revenue: 0 },
        { name: 'Sun', sales: 0, revenue: 0 }
      ]
    };
  }
};

const fetchUserEvents = async (token: string) => {
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ORGANIZER, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        // Clear invalid tokens and redirect to login
        clearAuthStorage();
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(`Failed to fetch events: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Events fetch error:', error);
    // Return mock data as fallback
    return {
      events: []
    };
  }
};

// Format currency for MUR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-MU', {
    style: 'currency',
    currency: 'MUR'
  }).format(amount);
};

// Process ticket type data for pie chart
const processTicketTypeData = (events: any[]) => {
  const ticketCounts: { [key: string]: number } = {};
  let totalTickets = 0;

  events.forEach(event => {
    if (event.ticketTypes && Array.isArray(event.ticketTypes)) {
      event.ticketTypes.forEach((ticket: any) => {
        // First try to get sold count from attendees data (more accurate)
        let soldCount = 0;
        
        if (event.attendees && Array.isArray(event.attendees)) {
          event.attendees.forEach((attendee: any) => {
            if (attendee.ticketType === ticket.name && attendee.quantity) {
              soldCount += attendee.quantity;
            }
          });
        }
        
        // Fallback to ticket.sold if no attendees data
        if (soldCount === 0) {
          soldCount = ticket.sold || 0;
        }
        
        if (soldCount > 0) {
          ticketCounts[ticket.name] = (ticketCounts[ticket.name] || 0) + soldCount;
          totalTickets += soldCount;
        }
      });
    }
  });

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
  
  if (totalTickets === 0) {
    return [{ name: 'No Sales Yet', value: 100, percentage: 100, color: '#9ca3af' }];
  }
  
  return Object.entries(ticketCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, count], index) => ({
      name,
      value: count,
      percentage: Math.round((count / totalTickets) * 100),
      color: colors[index % colors.length]
    }));
};


export default function Dashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Don't redirect immediately, let the component show the auth required message
      console.log('User not authenticated');
    }
  }, [isAuthenticated]);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics, error: analyticsError } = useQuery({
    queryKey: ['analytics', refreshKey, token],
    queryFn: () => fetchAnalytics(token!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryOnMount: false,
    enabled: !!token && isAuthenticated
  });

  // Fetch user events
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents, error: eventsError } = useQuery({
    queryKey: ['user-events', refreshKey, token],
    queryFn: () => fetchUserEvents(token!),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryOnMount: false,
    enabled: !!token && isAuthenticated
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchAnalytics();
    refetchEvents();
  };

  // Filter data based on selected event
  const getFilteredData = () => {
    const events = eventsData?.events || [];
    
    if (selectedEventId === 'all') {
      return {
        events,
        totalRevenue: analytics?.totalRevenue || 0,
        totalTicketsSold: analytics?.totalTicketsSold || 0,
        activeEvents: analytics?.activeEvents || 0,
        recentTicketsSold: analytics?.recentTicketsSold || 0
      };
    }
    
    const selectedEvent = events.find(event => event._id === selectedEventId);
    if (!selectedEvent) {
      return {
        events: [],
        totalRevenue: 0,
        totalTicketsSold: 0,
        activeEvents: 0,
        recentTicketsSold: 0
      };
    }
    
    console.log('Selected Event:', selectedEvent);
    console.log('Ticket Types:', selectedEvent.ticketTypes);
    console.log('Attendees:', selectedEvent.attendees);
    
    // Calculate metrics from attendees data (more reliable than ticketTypes.sold)
    let eventRevenue = 0;
    let eventTicketsSold = 0;
    
    if (selectedEvent.attendees && Array.isArray(selectedEvent.attendees)) {
      selectedEvent.attendees.forEach((attendee: any) => {
        if (attendee.ticketType && attendee.quantity) {
          const ticketType = selectedEvent.ticketTypes?.find((t: any) => t.name === attendee.ticketType);
          if (ticketType) {
            eventRevenue += (ticketType.price || 0) * (attendee.quantity || 1);
            eventTicketsSold += attendee.quantity || 1;
          }
        }
      });
    }
    
    // Fallback to ticketTypes.sold if attendees data is not available
    if (eventTicketsSold === 0 && selectedEvent.ticketTypes) {
      eventRevenue = selectedEvent.ticketTypes.reduce((sum: number, ticket: any) => {
        return sum + ((ticket.sold || 0) * (ticket.price || 0));
      }, 0);
      
      eventTicketsSold = selectedEvent.ticketTypes.reduce((sum: number, ticket: any) => {
        return sum + (ticket.sold || 0);
      }, 0);
    }
    
    console.log('Calculated Revenue:', eventRevenue);
    console.log('Calculated Tickets Sold:', eventTicketsSold);
    
    return {
      events: [selectedEvent],
      totalRevenue: eventRevenue,
      totalTicketsSold: eventTicketsSold,
      activeEvents: selectedEvent.status === 'active' ? 1 : 0,
      recentTicketsSold: eventTicketsSold
    };
  };

  const filteredData = getFilteredData();

  // Process data for charts with fallbacks
  const salesData = selectedEventId === 'all' ? 
    (analytics?.salesData || [
      { name: 'Mon', sales: 0, revenue: 0 },
      { name: 'Tue', sales: 0, revenue: 0 },
      { name: 'Wed', sales: 0, revenue: 0 },
      { name: 'Thu', sales: 0, revenue: 0 },
      { name: 'Fri', sales: 0, revenue: 0 },
      { name: 'Sat', sales: 0, revenue: 0 },
      { name: 'Sun', sales: 0, revenue: 0 }
    ]) : [
      // For single event, show simplified data
      { name: 'Event', sales: filteredData.totalTicketsSold, revenue: filteredData.totalRevenue }
    ];
  
  const ticketTypes = filteredData.events && filteredData.events.length > 0 ? 
    processTicketTypeData(filteredData.events) : [
      { name: 'No Events Yet', value: 100, percentage: 100, color: '#9ca3af' }
    ];
    
  const upcomingEvents = selectedEventId === 'all' ? 
    (analytics?.upcomingEvents || []) : 
    filteredData.events.map(event => {
      // Calculate sold tickets from attendees data (more accurate)
      let sold = 0;
      let revenue = 0;
      
      if (event.attendees && Array.isArray(event.attendees)) {
        event.attendees.forEach((attendee: any) => {
          if (attendee.ticketType && attendee.quantity) {
            const ticketType = event.ticketTypes?.find((t: any) => t.name === attendee.ticketType);
            if (ticketType) {
              sold += attendee.quantity || 1;
              revenue += (ticketType.price || 0) * (attendee.quantity || 1);
            }
          }
        });
      }
      
      // Fallback to ticketTypes.sold if no attendees data
      if (sold === 0 && event.ticketTypes) {
        sold = event.ticketTypes.reduce((sum: number, ticket: any) => sum + (ticket.sold || 0), 0);
        revenue = event.ticketTypes.reduce((sum: number, ticket: any) => sum + ((ticket.sold || 0) * (ticket.price || 0)), 0);
      }
      
      const total = event.ticketTypes?.reduce((sum: number, ticket: any) => sum + (ticket.quantity || 0), 0) || 0;
      
      return {
        id: event._id,
        name: event.name,
        date: event.startDate,
        sold,
        total,
        revenue
      };
    });
  
  const recentActivity = analytics?.recentActivity && analytics.recentActivity.length > 0 ? 
    analytics.recentActivity : [
      {
        id: 'no-data',
        type: 'message',
        message: 'No recent activity available. Create your first event to see activity here.',
        time: 'Just now',
        amount: 0
      }
    ];

  // Loading state
  if (analyticsLoading || eventsLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show authentication required state
  if (!isAuthenticated || !token) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Authentication Required</h2>
            <p className="text-muted-foreground mt-2">Please log in to view your dashboard data.</p>
            <Button className="mt-4" asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-in fade-in-50 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {user?.username}! Here's what's happening with your events.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Event Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-[200px] sm:w-[250px]">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    All Events
                  </div>
                </SelectItem>
                {(eventsData?.events || []).map((event: any) => (
                  <SelectItem key={event._id} value={event._id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="truncate">{event.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleRefresh}
            className="self-start sm:self-auto hover:scale-105 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-green-600 transition-colors">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatCurrency(filteredData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground group-hover:text-green-500 transition-colors">
              {filteredData.recentTicketsSold} tickets {selectedEventId === 'all' ? 'this month' : 'sold'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-blue-600 transition-colors">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {filteredData.totalTicketsSold}
            </div>
            <p className="text-xs text-muted-foreground group-hover:text-blue-500 transition-colors">
              {filteredData.activeEvents} active {selectedEventId === 'all' ? 'events' : 'event'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-purple-600 transition-colors">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {selectedEventId === 'all' ? (eventsData?.events?.length || 0) : 1}
            </div>
            <p className="text-xs text-muted-foreground group-hover:text-purple-500 transition-colors">
              {selectedEventId === 'all' ? 'Total Events Created' : 'Event Selected'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-orange-600 transition-colors">Active Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {filteredData.activeEvents}
            </div>
            <p className="text-xs text-muted-foreground group-hover:text-orange-500 transition-colors">
              {upcomingEvents.length} upcoming {selectedEventId === 'all' ? 'events' : 'event'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Chart */}
        <Card className="hover:shadow-xl transition-all duration-500 group">
          <CardHeader>
            <CardTitle className="group-hover:text-primary transition-colors">Sales Performance</CardTitle>
            <CardDescription className="group-hover:text-primary/70 transition-colors">
              {selectedEventId === 'all' ? 'Last 7 days ticket sales and revenue' : 'Event ticket sales and revenue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sales" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="sales" className="hover:bg-primary/10 transition-all duration-300">Tickets Sold</TabsTrigger>
                <TabsTrigger value="revenue" className="hover:bg-primary/10 transition-all duration-300">Revenue</TabsTrigger>
              </TabsList>
              <TabsContent value="sales" className="h-[250px] sm:h-[300px] lg:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="revenue" className="h-[250px] sm:h-[300px] lg:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Ticket Types Distribution */}
        <Card className="hover:shadow-xl transition-all duration-500 group">
          <CardHeader>
            <CardTitle className="group-hover:text-primary transition-colors">Ticket Type Distribution</CardTitle>
            <CardDescription className="group-hover:text-primary/70 transition-colors">Sales breakdown by ticket category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] lg:h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percentage }) => percentage ? `${name}: ${percentage}%` : `${name}`}
                    labelLine={false}
                  >
                    {ticketTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
              {ticketTypes.map((type) => (
                <div key={type.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-xs sm:text-sm">
                    {type.name}: {type.value} tickets ({type.percentage || 0}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Events */}
        <Card className="hover:shadow-xl transition-all duration-500 group">
          <CardHeader>
            <CardTitle className="group-hover:text-primary transition-colors">
              {selectedEventId === 'all' ? 'Upcoming Events' : 'Selected Event'}
            </CardTitle>
            <CardDescription className="group-hover:text-primary/70 transition-colors">
              {selectedEventId === 'all' ? 'Next 5 events requiring attention' : 'Event details and performance'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id || event._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2 sm:gap-0 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors">{event.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-primary/70 transition-colors">
                      {new Date(event.date || event.startDate).toLocaleDateString('en-MU')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex sm:flex-col sm:text-right space-x-4 sm:space-x-0 sm:space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
                          {event.sold || 0}/{event.total || 0} sold
                        </Badge>
                      </div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {formatCurrency(event.revenue || 0)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/event/${event.id || event._id}`}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                      {event.enableLivePlaylist && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/event/${event.id || event._id}/playlist`}>
                            <Mic className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="hover:shadow-xl transition-all duration-500 group">
          <CardHeader>
            <CardTitle className="group-hover:text-primary transition-colors">Recent Activity</CardTitle>
            <CardDescription className="group-hover:text-primary/70 transition-colors">Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-accent/30 transition-all duration-300 cursor-pointer group">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'sale' && <ShoppingCart className="h-4 w-4 text-green-500" />}
                    {activity.type === 'refund' && <RefreshCw className="h-4 w-4 text-red-500" />}
                    {activity.type === 'message' && <Eye className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm group-hover:text-primary transition-colors">{activity.message}</p>
                    <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">{activity.time}</p>
                  </div>
                  {activity.amount !== 0 && (
                    <div className={`text-xs sm:text-sm font-medium ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}