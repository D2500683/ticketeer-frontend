import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Play, Plus, ExternalLink, Youtube, X } from 'lucide-react';
import { API_CONFIG } from '@/config/api';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
  embedUrl: string;
}

interface YouTubeSearchProps {
  onVideoSelect: (video: YouTubeVideo) => void;
  selectedVideo: YouTubeVideo | null;
  onVideoRemove: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function YouTubeSearch({ 
  onVideoSelect, 
  selectedVideo, 
  onVideoRemove, 
  isOpen, 
  onClose 
}: YouTubeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const searchVideos = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_CONFIG.ENDPOINTS.YOUTUBE.SEARCH}?q=${encodeURIComponent(query)}&maxResults=10`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.videos);
      } else {
        console.error('YouTube search failed:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('YouTube search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchVideos(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Youtube className="w-5 h-5" />
              Add YouTube Video
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for YouTube videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Video */}
          {selectedVideo && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Selected Video</h4>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-24 h-18 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2">{selectedVideo.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedVideo.channelTitle}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(selectedVideo.publishedAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onVideoRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 mx-auto border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground mt-2">Searching YouTube...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((video) => (
                <div key={video.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="relative">
                    <img src={video.thumbnail} alt={video.title} className="w-32 h-24 rounded object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-2 mb-1">{video.title}</h4>
                    <p className="text-sm text-muted-foreground mb-1">{video.channelTitle}</p>
                    <p className="text-xs text-muted-foreground mb-2">{formatDate(video.publishedAt)}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {truncateText(video.description, 150)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedVideo?.id === video.id ? "secondary" : "default"}
                      size="sm"
                      onClick={() => onVideoSelect(video)}
                      disabled={selectedVideo?.id === video.id}
                    >
                      {selectedVideo?.id === video.id ? "Selected" : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                <Youtube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No videos found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Youtube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Search for YouTube videos to add to your event</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
