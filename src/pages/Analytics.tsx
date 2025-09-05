import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, Users, Calendar, DollarSign, Target, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// API functions
const fetchAnalytics = async (token: string) => {
  if (!token) throw new Error('No authentication token found');
  
  try {
    const response = await fetch('http://localhost:3001/api/events/user/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(`Failed to fetch analytics: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Analytics fetch error:', error);
    throw error;
  }
};

const fetchUserEvents = async (token: string) => {
  if (!token) throw new Error('No authentication token found');
  
  try {
    const response = await fetch('http://localhost:3001/api/events/user/my-events', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(`Failed to fetch events: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Events fetch error:', error);
    throw error;
  }
};

// Format currency for MUR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-MU', {
    style: 'currency',
    currency: 'MUR'
  }).format(amount);
};

// Process event types for pie chart
const processEventTypes = (events: any[]) => {
  const typeCounts: { [key: string]: number } = {};
  let totalEvents = events.length;

  events.forEach(event => {
    const category = event.category || 'Other';
    typeCounts[category] = (typeCounts[category] || 0) + 1;
  });

  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];
  return Object.entries(typeCounts).map(([name, count], index) => ({
    name,
    value: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
    color: colors[index % colors.length]
  }));
};

// Process top events
const processTopEvents = (events: any[]) => {
  return events
    .map(event => ({
      name: event.name,
      attendees: event.actualTicketsSold || 0,
      revenue: event.actualRevenue || 0,
      growth: event.actualRevenue && event.previousRevenue ? 
        Math.round(((event.actualRevenue - event.previousRevenue) / event.previousRevenue) * 100) : 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

export default function Analytics() {
  const { user, token, isAuthenticated } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics, error: analyticsError } = useQuery({
    queryKey: ['analytics', refreshKey, token],
    queryFn: () => fetchAnalytics(token!),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!token && isAuthenticated
  });

  // Fetch user events
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents, error: eventsError } = useQuery({
    queryKey: ['user-events', refreshKey, token],
    queryFn: () => fetchUserEvents(token!),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!token && isAuthenticated
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchAnalytics();
    refetchEvents();
  };

  // Show authentication required state
  if (!isAuthenticated || !token) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Authentication Required</h2>
            <p className="text-muted-foreground mt-2">Please log in to view analytics data.</p>
            <Button className="mt-4" asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (analyticsLoading || eventsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Process data
  const events = eventsData?.events || [];
  const eventTypes = processEventTypes(events);
  const topEvents = processTopEvents(events);
  const salesData = analytics?.salesData || [];
  const attendeeGrowth = analytics?.attendeeGrowth || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your event performance and growth metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="hover:shadow-soft transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            Real-time data
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics?.totalRevenue || 0)}</div>
            {analytics?.revenueGrowth !== undefined && (
              <div className="flex items-center text-sm">
                {analytics.revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={analytics.revenueGrowth >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics?.totalTicketsSold || 0}</div>
            {analytics?.attendeeGrowth !== undefined && (
              <div className="flex items-center text-sm">
                {analytics.attendeeGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={analytics.attendeeGrowth >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {analytics.attendeeGrowth >= 0 ? '+' : ''}{analytics.attendeeGrowth.toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events Hosted</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{events.length}</div>
            {analytics?.eventGrowth !== undefined && (
              <div className="flex items-center text-sm">
                {analytics.eventGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={analytics.eventGrowth >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {analytics.eventGrowth >= 0 ? '+' : ''}{analytics.eventGrowth.toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics?.conversionRate || 0}%</div>
            {analytics?.conversionGrowth !== undefined && (
              <div className="flex items-center text-sm">
                {analytics.conversionGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={analytics.conversionGrowth >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {analytics.conversionGrowth >= 0 ? '+' : ''}{analytics.conversionGrowth.toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Events Chart */}
        <Card className="col-span-2 bg-card border-border shadow-elegant">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue & Events Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="space-y-4">
                <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="events" className="space-y-4">
                <ChartContainer config={{ attendees: { label: "Attendees", color: "hsl(var(--secondary))" } }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendeeGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="attendees" stroke="hsl(var(--secondary))" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
        <Card className="bg-card border-border shadow-elegant">
          <CardHeader>
            <CardTitle className="text-foreground">Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={eventTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {eventTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {eventTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-muted-foreground">{type.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{type.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Events */}
      <Card className="bg-card border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Top Performing Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <h3 className="font-medium text-foreground">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">{event.attendees.toLocaleString()} attendees</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">{formatCurrency(event.revenue)}</div>
                  <div className={`text-sm flex items-center ${event.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {event.growth >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(event.growth)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}