import React, { useState, useEffect } from 'react';
import { Search, Music, Play, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  preview_url: string | null;
  external_url: string;
  image: string | null;
  popularity: number;
}

interface SpotifySearchProps {
  onTrackSelect: (track: SpotifyTrack) => void;
  selectedTracks: SpotifyTrack[];
  onTrackRemove: (trackId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotifySearch({ 
  onTrackSelect, 
  selectedTracks, 
  onTrackRemove, 
  isOpen, 
  onClose 
}: SpotifySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const searchTracks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:3001/api/spotify/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.tracks);
      } else {
        console.error('Spotify search failed:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Spotify search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTracks(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const playPreview = (previewUrl: string, trackId: string) => {
    if (playingPreview === trackId) {
      setPlayingPreview(null);
      // Stop audio
      const audio = document.getElementById(`audio-${trackId}`) as HTMLAudioElement;
      if (audio) audio.pause();
    } else {
      setPlayingPreview(trackId);
      // Play audio
      const audio = document.getElementById(`audio-${trackId}`) as HTMLAudioElement;
      if (audio) audio.play();
    }
  };

  const isTrackSelected = (trackId: string) => {
    return selectedTracks.some(track => track.id === trackId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Music className="w-5 h-5" />
              Add Songs from Spotify
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Tracks */}
          {selectedTracks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Selected Songs ({selectedTracks.length})</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    {track.image && (
                      <img src={track.image} alt={track.album} className="w-8 h-8 rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTrackRemove(track.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 mx-auto border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground mt-2">Searching Spotify...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((track) => (
                <div key={track.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  {track.image && (
                    <img src={track.image} alt={track.album} className="w-12 h-12 rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatDuration(track.duration)}
                      </Badge>
                      {track.popularity > 70 && (
                        <Badge variant="outline" className="text-xs">Popular</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {track.preview_url && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playPreview(track.preview_url!, track.id)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <audio
                          id={`audio-${track.id}`}
                          src={track.preview_url}
                          onEnded={() => setPlayingPreview(null)}
                        />
                      </>
                    )}
                    <Button
                      variant={isTrackSelected(track.id) ? "secondary" : "default"}
                      size="sm"
                      onClick={() => onTrackSelect(track)}
                      disabled={isTrackSelected(track.id)}
                    >
                      {isTrackSelected(track.id) ? "Added" : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No songs found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Search for songs to add to your event</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
