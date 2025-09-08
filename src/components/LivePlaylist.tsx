import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Heart, 
  Search, 
  Plus, 
  Music, 
  Users, 
  Clock,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Settings
} from 'lucide-react';
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

interface LivePlaylistProps {
  eventId: string;
  isDJ: boolean;
}

const LivePlaylist: React.FC<LivePlaylistProps> = ({ eventId, isDJ }) => {
  const { user, token } = useAuth();
  // Using toast from sonner
  const [playlist, setPlaylist] = useState<LivePlaylistData | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [activeTab, setActiveTab] = useState<'request' | 'queue' | 'controls'>('request');

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_CONFIG.SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('joinEvent', eventId);

    // Listen for real-time updates
    newSocket.on('songRequested', (data) => {
      if (data.eventId === eventId) {
        fetchPlaylist();
        toast(`New Song Request: ${data.song.requestedByName} requested "${data.song.trackName}"`);
      }
    });

    newSocket.on('songVoted', (data) => {
      if (data.eventId === eventId) {
        fetchPlaylist();
      }
    });

    newSocket.on('songStatusChanged', (data) => {
      if (data.eventId === eventId) {
        fetchPlaylist();
        toast(`Song Status Updated: Song status changed to ${data.status}`);
      }
    });

    newSocket.on('currentTrackChanged', (data) => {
      if (data.eventId === eventId) {
        fetchPlaylist();
      }
    });

    newSocket.on('liveSessionStarted', (data) => {
      if (data.eventId === eventId) {
        toast.success(`Live Session Started: ${data.djName} started the live DJ session!`);
        fetchPlaylist();
      }
    });

    newSocket.on('liveSessionEnded', (data) => {
      if (data.eventId === eventId) {
        toast.success("Live Session Ended: The live DJ session has ended.");
        fetchPlaylist();
      }
    });

    return () => {
      newSocket.emit('leaveEvent', eventId);
      newSocket.disconnect();
    };
  }, [eventId]);

  // Fetch playlist data
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

  // Initialize or create playlist (DJ only)
  const initializePlaylist = async () => {
    if (!isDJ || !token) return;

    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.PLAYLIST.CREATE(eventId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchPlaylist();
        toast.success("Live Playlist Initialized: Your live DJ playlist is ready!");
      }
    } catch (error) {
      console.error('Error initializing playlist:', error);
      toast.error("Failed to initialize live playlist");
    }
  };

  // Search for songs
  const searchSongs = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`${API_CONFIG.ENDPOINTS.SPOTIFY.SEARCH}?q=${encodeURIComponent(searchQuery)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks || []);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
      toast.error("Search Failed: Unable to search for songs. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Request a song
  const requestSong = async (track: any) => {
    // Get requester info from user input
    const requesterName = prompt("Enter your name:");
    if (!requesterName) {
      toast.error("Name Required: Please enter your name to request a song");
      return;
    }

    const requesterEmail = prompt("Enter your email (optional):");

    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.PLAYLIST.REQUEST_SONG(eventId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spotifyTrackId: track.id,
          requesterName,
          requesterEmail: requesterEmail || undefined
        })
      });

      if (response.ok) {
        toast.success(`Song Requested: "${track.name}" has been added to the queue!`);
        setSearchResults([]);
        setSearchQuery('');
      } else {
        const error = await response.json();
        toast.error(`Request Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error requesting song:', error);
    }
  };

  // Vote on a song
  const voteSong = async (songId: string, voteType: 'up' | 'down') => {
    if (!token) {
      toast.error("Login Required: Please log in to vote on songs");
      return;
    }

    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.PLAYLIST.VOTE(eventId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          songId,
          voteType
        })
      });

      if (response.ok) {
        // Playlist will update via socket
      } else {
        const error = await response.json();
        toast.error(`Vote Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // DJ Controls
  const updateSongStatus = async (songId: string, status: string) => {
    if (!isDJ || !token) return;

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
        // Playlist will update via socket
      }
    } catch (error) {
      console.error('Error updating song status:', error);
    }
  };

  const startLiveSession = () => {
    if (socket && isDJ) {
      socket.emit('startLiveSession', {
        eventId,
        djId: user?.id,
        djName: user?.username
      });
    }
  };

  const stopLiveSession = () => {
    if (socket && isDJ) {
      socket.emit('stopLiveSession', {
        eventId,
        djId: user?.id
      });
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [eventId]);

  if (!playlist) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Live DJ Playlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDJ ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Initialize Live Playlist</h3>
                <p className="text-muted-foreground mb-4">
                  Set up your live DJ playlist to start accepting song requests and managing your event's music.
                </p>
                <Button onClick={initializePlaylist}>
                  Initialize Live Playlist
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Live Playlist Not Available</h3>
                <p className="text-muted-foreground mb-4">
                  The event organizer hasn't set up the live playlist yet. Please check back later or contact the organizer.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="w-full space-y-6">
      {/* Live Session Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${playlist.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {playlist.isActive ? 'Live Session Active' : 'Session Inactive'}
              </span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {connectedUsers} listening
              </Badge>
            </div>
            {isDJ && (
              <div className="flex gap-2">
                {!playlist.isActive ? (
                  <Button onClick={startLiveSession} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Start Live Session
                  </Button>
                ) : (
                  <Button onClick={stopLiveSession} variant="destructive" className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    End Session
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Track */}
      {playlist.currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-lg p-6 border border-orange-200/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{playlist.currentTrack.trackName}</h3>
              <p className="text-muted-foreground">{playlist.currentTrack.artist}</p>
            </div>
            <Badge className="bg-orange-500">Now Playing</Badge>
          </div>
        </motion.div>
      )}

      <div className="w-full">
        <div className="flex space-x-1 mb-4">
          <button 
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2 rounded-md ${activeTab === 'request' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Request Songs
          </button>
          <button 
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-md ${activeTab === 'queue' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Queue ({playlist.queue.length})
          </button>
          {isDJ && (
            <button 
              onClick={() => setActiveTab('controls')}
              className={`px-4 py-2 rounded-md ${activeTab === 'controls' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              DJ Controls
            </button>
          )}
        </div>

        {/* Song Request Tab */}
        {activeTab === 'request' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Request Songs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchSongs()}
                />
                <Button onClick={searchSongs} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  <AnimatePresence>
                    {searchResults.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        {track.image && (
                          <img
                            src={track.image}
                            alt={track.album}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{track.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {track.artist}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => requestSong(track)}
                          disabled={!playlist.settings.allowRequests}
                        >
                          Request
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Song Queue
                </span>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{playlist.stats.totalRequests} requests</span>
                  <span>•</span>
                  <span>{playlist.stats.totalVotes} votes</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  <AnimatePresence>
                    {playlist.queue
                      .sort((a, b) => b.voteScore - a.voteScore)
                      .map((song, index) => (
                        <motion.div
                          key={song._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center gap-3 p-4 border rounded-lg bg-card"
                        >
                          <div className="text-sm font-medium text-muted-foreground w-6">
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
                              Requested by {song.requestedByName}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={song.status === 'pending' ? 'secondary' : 'default'}>
                              {song.status}
                            </Badge>
                            
                            {playlist.settings.votingEnabled && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => voteSong(song._id, 'up')}
                                  className="h-8 w-8 p-0"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium min-w-[2rem] text-center">
                                  {song.voteScore}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => voteSong(song._id, 'down')}
                                  className="h-8 w-8 p-0"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {isDJ && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateSongStatus(song._id, 'approved')}
                                  className="h-8 px-2"
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateSongStatus(song._id, 'played')}
                                  className="h-8 px-2"
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        )}

        {/* DJ Controls Tab */}
        {isDJ && activeTab === 'controls' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  DJ Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Allow Requests</label>
                    <Button
                      variant={playlist.settings.allowRequests ? "default" : "secondary"}
                      className="w-full"
                    >
                      {playlist.settings.allowRequests ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voting</label>
                    <Button
                      variant={playlist.settings.votingEnabled ? "default" : "secondary"}
                      className="w-full"
                    >
                      {playlist.settings.votingEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Session Stats</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-500">
                        {playlist.stats.totalRequests}
                      </div>
                      <div className="text-sm text-muted-foreground">Requests</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">
                        {playlist.stats.totalVotes}
                      </div>
                      <div className="text-sm text-muted-foreground">Votes</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-500">
                        {playlist.stats.uniqueRequesters}
                      </div>
                      <div className="text-sm text-muted-foreground">Users</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePlaylist;
