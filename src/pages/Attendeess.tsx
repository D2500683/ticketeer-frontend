import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, Mail, Phone, MapPin, Calendar, Users, UserCheck, Clock, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { API_CONFIG } from "@/config/api";

// API functions
const fetchAttendees = async (token: string) => {
  if (!token) throw new Error('No authentication token found');
  
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.USER.ATTENDEES, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(`Failed to fetch attendees: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Attendees fetch error:', error);
    // Return empty array as fallback
    return { attendees: [] };
  }
};

const fetchUserEvents = async (token: string) => {
  if (!token) throw new Error('No authentication token found');
  
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ORGANIZER, {
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
    return { events: [] };
  }
};

// Format currency for MUR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-MU', {
    style: 'currency',
    currency: 'MUR'
  }).format(amount);
};

// Process attendees from events data
const processAttendeesFromEvents = (events: any[]) => {
  const attendeeMap = new Map();
  
  events.forEach(event => {
    event.attendees?.forEach((attendee: any) => {
      const userId = attendee.user?._id || attendee.user?.id;
      if (!userId) return;
      
      if (attendeeMap.has(userId)) {
        const existing = attendeeMap.get(userId);
        existing.registeredEvents += 1;
        existing.totalSpent += (attendee.ticketType ? 
          event.ticketTypes?.find((t: any) => t.name === attendee.ticketType)?.price * attendee.quantity || 0 : 0);
        existing.lastEvent = event.name;
      } else {
        const ticketPrice = attendee.ticketType ? 
          event.ticketTypes?.find((t: any) => t.name === attendee.ticketType)?.price * attendee.quantity || 0 : 0;
        
        attendeeMap.set(userId, {
          id: userId,
          name: attendee.user?.username || attendee.user?.name || 'Anonymous',
          email: attendee.user?.email || 'N/A',
          phone: attendee.user?.phone || 'N/A',
          location: attendee.user?.location || 'N/A',
          avatar: attendee.user?.avatar || '/placeholder.svg',
          registeredEvents: 1,
          totalSpent: ticketPrice,
          lastEvent: event.name,
          registrationDate: attendee.createdAt || event.createdAt,
          status: ticketPrice > 350 ? 'VIP' : ticketPrice > 0 ? 'Regular' : 'New'
        });
      }
    });
  });
  
  return Array.from(attendeeMap.values());
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "VIP": return "bg-primary text-primary-foreground";
    case "Regular": return "bg-secondary text-secondary-foreground";
    case "New": return "bg-accent text-accent-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function Attendees() {
  const { user, token, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch attendees from orders
  const { data: attendeesData, isLoading: attendeesLoading, refetch: refetchAttendees, error: attendeesError } = useQuery({
    queryKey: ['attendees', refreshKey, token],
    queryFn: () => fetchAttendees(token!),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!token && isAuthenticated
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchAttendees();
  };

  // Show authentication required state
  if (!isAuthenticated || !token) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center px-4">
            <h2 className="text-lg sm:text-xl font-semibold text-red-600">Authentication Required</h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Please log in to view attendees data.</p>
            <Button className="mt-4" asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (attendeesLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Get attendees from API response
  const attendees = attendeesData?.attendees || [];

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "vip") return matchesSearch && attendee.status === "VIP";
    if (activeTab === "regular") return matchesSearch && attendee.status === "Regular";
    if (activeTab === "new") return matchesSearch && attendee.status === "New";
    
    return matchesSearch;
  });

  const totalAttendees = attendees.length;
  const vipAttendees = attendees.filter(a => a.status === "VIP").length;
  const newAttendees = attendees.filter(a => a.status === "New").length;
  const totalRevenue = attendees.reduce((sum, a) => sum + a.totalSpent, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Attendees</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage and track your event attendees</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:space-x-2">
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            className="hover:shadow-soft transition-all duration-200 flex-1 sm:flex-none"
            size="sm"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <Button variant="outline" className="hover:shadow-soft transition-all duration-200 flex-1 sm:flex-none" size="sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button className="hover:shadow-glow transition-all duration-200 flex-1 sm:flex-none" size="sm">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Send Email</span>
            <span className="sm:hidden">Email</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Attendees</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold text-foreground">{totalAttendees}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Across all events</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">VIP Members</CardTitle>
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold text-foreground">{vipAttendees}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Premium attendees</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">New This Month</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold text-foreground">{newAttendees}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Recent registrations</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <div className="text-sm sm:text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">From attendees</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border shadow-elegant">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder="Search attendees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 bg-background border-border focus:ring-primary text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <Button variant="outline" className="hover:shadow-soft transition-all duration-200" size="sm">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-sm">Filters</span>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                <span className="hidden sm:inline">All ({totalAttendees})</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="vip" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                <span className="hidden sm:inline">VIP ({vipAttendees})</span>
                <span className="sm:hidden">VIP</span>
              </TabsTrigger>
              <TabsTrigger value="regular" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                <span className="hidden sm:inline">Regular ({attendees.filter(a => a.status === "Regular").length})</span>
                <span className="sm:hidden">Reg</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                <span className="hidden sm:inline">New ({newAttendees})</span>
                <span className="sm:hidden">New</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 sm:mt-6">
              <div className="space-y-3 sm:space-y-4">
                {filteredAttendees.map((attendee) => (
                  <Card key={attendee.id} className="bg-card border-border hover:shadow-soft transition-all duration-200 cursor-pointer">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            <AvatarImage src={attendee.avatar} alt={attendee.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                              {attendee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{attendee.name}</h3>
                              <Badge className={`${getStatusColor(attendee.status)} text-xs`}>
                                {attendee.status}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-muted-foreground gap-1 sm:gap-4">
                              <div className="flex items-center truncate">
                                <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{attendee.email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{attendee.phone}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{attendee.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right space-y-1 flex-shrink-0">
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {attendee.registeredEvents} events • {formatCurrency(attendee.totalSpent)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            Last: {attendee.lastEvent}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Joined: {new Date(attendee.registrationDate).toLocaleDateString('en-MU')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredAttendees.length === 0 && (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No attendees found</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}