import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Settings, 
  Users, 
  Music, 
  Clock,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  BarChart3,
  Volume2,
  Shuffle,
  Repeat,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { API_CONFIG } from '@/config/api';
import io from 'socket.io-client';

interface Song {
  _id: string;
  spotifyTrackId: string;
  trackName: string;
  artist: string;
  album?: string;
  duration: number;
  previewUrl?: string;
  imageUrl?: string;
  externalUrl: string;
  requestedBy: string;
  requestedByName: string;
  votes: Array<{
    userId: string;
    voteType: 'up' | 'down';
    timestamp: Date;
  }>;
  voteScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'played';
  requestedAt: Date;
  playedAt?: Date;
}

interface LivePlaylistData {
  _id: string;
  eventId: string;
  djId: string;
  isActive: boolean;
  currentTrack?: {
    spotifyTrackId: string;
    trackName: string;
    artist: string;
    startedAt: Date;
    duration: number;
  };
  queue: Song[];
  playHistory: Song[];
  settings: {
    allowRequests: boolean;
    requireApproval: boolean;
    maxRequestsPerUser: number;
    votingEnabled: boolean;
    autoPlayNext: boolean;
  };
  stats: {
    totalRequests: number;
    totalVotes: number;
    uniqueRequesters: number;
  };
}

const LivePlaylistDashboard: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [playlist, setPlaylist] = useState<LivePlaylistData | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    if (!eventId) return;

    const newSocket = io(API_CONFIG.SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('joinEvent', eventId);

    // Listen for real-time updates
    newSocket.on('songRequested', (data) => {
      if (data.eventId === eventId) {
        fetchPlaylist();
        toast.success(`${data.song.requestedByName} requested "${data.song.trackName}"`);
      }
    });

    newSocket.on('songVoted', (data) => {
      if (data.eventId === eventId) {
        fetchPlaylist();
      }
    });

    return () => {
      newSocket.emit('leaveEvent', eventId);
      newSocket.disconnect();
    };
  }, [eventId]);

  // Fetch event and playlist data
  const fetchEvent = async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(eventId));
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        
        // Check if user is authorized (event organizer)
        if (eventData.organizer !== user?.id) {
          toast.error("You are not authorized to manage this event's playlist");
          navigate('/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.PLAYLIST.GET(eventId));
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  };

  useEffect(() => {
    if (eventId && user) {
      Promise.all([fetchEvent(), fetchPlaylist()]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [eventId, user]);

  // DJ Controls
  const updateSongStatus = async (songId: string, status: string) => {
    if (!token) return;

    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.PLAYLIST.UPDATE_SONG(eventId, songId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchPlaylist();
        toast.success(`Song ${status} successfully`);
      }
    } catch (error) {
      console.error('Error updating song status:', error);
    }
  };

  const updatePlaylistSettings = async (newSettings: Partial<LivePlaylistData['settings']>) => {
    if (!token) return;

    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.PLAYLIST.UPDATE_SETTINGS(eventId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        fetchPlaylist();
        toast.success("Playlist settings have been updated");
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const startLiveSession = () => {
    if (socket) {
      socket.emit('startLiveSession', {
        eventId,
        djId: user?.id,
        djName: user?.username
      });
      toast.success("Your live DJ session is now active!");
    }
  };

  const stopLiveSession = () => {
    if (socket) {
      socket.emit('stopLiveSession', {
        eventId,
        djId: user?.id
      });
      toast.success("Your live DJ session has been stopped");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading DJ Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Live Playlist Found</h3>
                <p className="text-muted-foreground mb-4">
                  This event doesn't have a live playlist enabled.
                </p>
                <Button onClick={() => navigate(`/event/${eventId}`)}>
                  View Event Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Music className="h-6 w-6 text-orange-500" />
                  DJ Dashboard
                </h1>
                <p className="text-muted-foreground">{event?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${playlist.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">
                  {playlist.isActive ? 'Live' : 'Offline'}
                </span>
              </div>
              
              {!playlist.isActive ? (
                <Button onClick={startLiveSession} className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Go Live
                </Button>
              ) : (
                <Button onClick={stopLiveSession} variant="destructive">
                  <Pause className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{playlist.stats.totalRequests}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{playlist.stats.totalVotes}</div>
                <div className="text-sm text-muted-foreground">Total Votes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{playlist.stats.uniqueRequesters}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">{playlist.queue.length}</div>
                <div className="text-sm text-muted-foreground">Queue Length</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Track */}
        {playlist.currentTrack && (
          <Card className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-200/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <Music className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{playlist.currentTrack.trackName}</h3>
                  <p className="text-muted-foreground">{playlist.currentTrack.artist}</p>
                </div>
                <Badge className="bg-orange-500">Now Playing</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue">Queue ({playlist.queue.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History ({playlist.playHistory.length})</TabsTrigger>
          </TabsList>

          {/* Queue Management */}
          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Song Queue Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                      {playlist.queue
                        .sort((a, b) => b.voteScore - a.voteScore)
                        .map((song, index) => (
                          <div
                            key={song._id}
                            className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                          >
                            <div className="text-sm font-medium text-muted-foreground w-8">
                              #{index + 1}
                            </div>
                            
                            {song.imageUrl && (
                              <img
                                src={song.imageUrl}
                                alt={song.album}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{song.trackName}</h4>
                              <p className="text-sm text-muted-foreground">{song.artist}</p>
                              <p className="text-xs text-muted-foreground">
                                Requested by {song.requestedByName} • {song.voteScore} votes
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant={
                                song.status === 'pending' ? 'secondary' : 
                                song.status === 'approved' ? 'default' : 
                                'destructive'
                              }>
                                {song.status}
                              </Badge>
                              
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateSongStatus(song._id, 'approved')}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateSongStatus(song._id, 'rejected')}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateSongStatus(song._id, 'played')}
                                  className="h-8 w-8 p-0"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    
                    {playlist.queue.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Music className="h-8 w-8 mx-auto mb-2" />
                        <p>No songs in queue yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Playlist Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Allow Song Requests</Label>
                      <p className="text-sm text-muted-foreground">Let attendees request songs</p>
                    </div>
                    <Switch
                      checked={playlist.settings.allowRequests}
                      onCheckedChange={(checked) => updatePlaylistSettings({ allowRequests: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Require Approval</Label>
                      <p className="text-sm text-muted-foreground">Review requests before playing</p>
                    </div>
                    <Switch
                      checked={playlist.settings.requireApproval}
                      onCheckedChange={(checked) => updatePlaylistSettings({ requireApproval: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Enable Voting</Label>
                      <p className="text-sm text-muted-foreground">Let attendees vote on requests</p>
                    </div>
                    <Switch
                      checked={playlist.settings.votingEnabled}
                      onCheckedChange={(checked) => updatePlaylistSettings({ votingEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Auto Play Next</Label>
                      <p className="text-sm text-muted-foreground">Automatically play top voted songs</p>
                    </div>
                    <Switch
                      checked={playlist.settings.autoPlayNext}
                      onCheckedChange={(checked) => updatePlaylistSettings({ autoPlayNext: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Max Requests per User</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={playlist.settings.maxRequestsPerUser}
                    onChange={(e) => updatePlaylistSettings({ 
                      maxRequestsPerUser: parseInt(e.target.value) || 3 
                    })}
                    className="max-w-24"
                  />
                  <p className="text-sm text-muted-foreground">
                    Limit how many songs each attendee can request
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Play History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Play History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {playlist.playHistory.map((song, index) => (
                      <div key={song._id} className="flex items-center gap-4 p-3 border rounded-lg">
                        {song.imageUrl && (
                          <img
                            src={song.imageUrl}
                            alt={song.album}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{song.trackName}</h4>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {song.playedAt && new Date(song.playedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    
                    {playlist.playHistory.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <p>No songs played yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LivePlaylistDashboard;
