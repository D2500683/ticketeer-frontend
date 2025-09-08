import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  CalendarDays,
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Share2, 
  Heart, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Music,
  Mic,
  Settings,
  CheckCircle,
  ImageIcon,
  Youtube,
  ExternalLink,
  Sparkles,
  Instagram,
  Loader2 as Loading,
  ArrowLeft
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import LivePlaylist from "@/components/LivePlaylist";
import { format } from "date-fns";
import { API_CONFIG } from "@/config/api";
import SocialShareButton from "@/components/SocialShareButton";
import { useSocialShare } from "@/hooks/useSocialShare";
import CountdownTimer from "@/components/CountdownTimer";

// API function to fetch single event
const fetchEvent = async (id: string) => {
  const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(id));
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
};

// Helper function to format date and time
const formatDateTime = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const dateStr = start.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const timeStr = `${start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })} - ${end.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })}`;
  
  return { dateStr, timeStr };
};

// Helper function to get display image
const getEventImage = (event: any) => {
  if (event.flyerUrl) return event.flyerUrl;
  if (event.images && event.images.length > 0) return event.images[0].url;
  // Fallback to placeholder
  return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop';
};

// Generate subtle gradient background with accent color at top
const generateGradientBackground = (color: string) => {
  if (!color) return {};
  
  // Convert hex to RGB for gradient calculations
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create very subtle accent color at top
  const subtleAccent = `rgba(${r}, ${g}, ${b}, 0.15)`;
  
  return {
    background: `linear-gradient(180deg, ${subtleAccent} 0%, transparent 40%), hsl(var(--background))`,
    transition: 'background 0.5s ease-in-out'
  };
};

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLivePlaylist, setShowLivePlaylist] = useState(false);
  const [showGuestlistModal, setShowGuestlistModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Social sharing hook
  const { generateEventShareData } = useSocialShare();
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
  });

  // Check if current user is the event organizer (DJ)
  const isDJ = user && event && event.organizer === user.id;

  // Debug: Log event data to check enableLivePlaylist
  useEffect(() => {
    if (event) {
      console.log('Event data:', event);
      console.log('enableLivePlaylist:', event.enableLivePlaylist);
      console.log('isDJ:', isDJ);
      console.log('showLivePlaylist:', showLivePlaylist);
    }
  }, [event, isDJ, showLivePlaylist]);

  // Auto-play background music when event loads
  useEffect(() => {
    if (event?.songs && event.songs.length > 0) {
      const firstSongWithPreview = event.songs.find((song: any) => song.preview_url);
      if (firstSongWithPreview) {
        const audio = new Audio(firstSongWithPreview.preview_url);
        audio.volume = volume;
        audio.loop = false;
        audioRef.current = audio;
        
        // Auto-play with user interaction fallback
        const playAudio = async () => {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (error) {
            console.log('Auto-play blocked by browser, user interaction required');
          }
        };
        
        playAudio();
        
        // Handle song end - play next song
        audio.addEventListener('ended', () => {
          playNextSong();
        });
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [event]);

  // Auto-advance gallery carousel
  useEffect(() => {
    if (!event?.images || event.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }, 4000); // Change image every 4 seconds
    
    return () => clearInterval(interval);
  }, [event?.images]);

  const playNextSong = () => {
    if (!event?.songs || event.songs.length === 0) return;
    
    const songsWithPreview = event.songs.filter((song: any) => song.preview_url);
    if (songsWithPreview.length === 0) return;
    
    const nextIndex = (currentSongIndex + 1) % songsWithPreview.length;
    setCurrentSongIndex(nextIndex);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const nextSong = songsWithPreview[nextIndex];
    const audio = new Audio(nextSong.preview_url);
    audio.volume = volume;
    audioRef.current = audio;
    
    if (isPlaying) {
      audio.play();
    }
    
    audio.addEventListener('ended', () => {
      playNextSong();
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-900 text-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Loading size="lg" />
        </motion.div>
      </motion.div>
    );
  }

  if (error || !event) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-900 text-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-400">The event you're looking for doesn't exist.</p>
        </motion.div>
      </motion.div>
    );
  }

  const { dateStr, timeStr } = formatDateTime(event.startDate, event.endDate);
  
  // Get accent color from event data
  const accentColor = event.selectedAccentColor;
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-900 text-white"
      style={accentColor ? generateGradientBackground(accentColor) : {}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="border-b border-gray-800 px-3 sm:px-6 py-3 sm:py-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-xs sm:text-sm">R</span>
            </div>
            <span className="font-semibold text-sm sm:text-base">{event?.organizer?.username || 'ORGANIZER'}</span>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300 hidden sm:inline-flex text-xs">
              Verified
            </Badge>
          </div>
          <div className="flex gap-1 sm:gap-2">
            {/* Music Controls */}
            {event?.songs && event.songs.some((song: any) => song.preview_url) && (
              <motion.div 
                className="flex items-center gap-1 sm:gap-2 bg-gray-800 rounded-lg px-1.5 sm:px-3 py-1.5 sm:py-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-green-400 hover:text-green-300 p-1 sm:p-2 h-auto"
                  >
                    <motion.div
                      key={isPlaying ? 'pause' : 'play'}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </motion.div>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="hidden sm:block"
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-gray-300 p-1 sm:p-2"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </motion.div>
                <motion.input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-12 sm:w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer hidden sm:block"
                  whileHover={{ scale: 1.05 }}
                />
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:block"
            >
             
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:block"
            >
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Event Details */}
          <motion.div 
            className="space-y-3 sm:space-y-4 lg:space-y-6 order-2 lg:order-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.h1 
                className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 lg:mb-4 leading-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {event.name}
              </motion.h1>
              
              <motion.div 
                className="space-y-2 sm:space-y-3 text-gray-300"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div 
                  className="flex items-start gap-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{event.venueName || event.location}</span>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <CalendarDays className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{dateStr} at {timeStr}</span>
                </motion.div>
              </motion.div>

              <motion.p 
                className="text-gray-300 mt-3 sm:mt-4 text-base sm:text-lg leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                {event.shortSummary || event.description}
              </motion.p>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <CountdownTimer 
                targetDate={event.startDate} 
                className="w-full"
              />
            </motion.div>

            {/* About Section */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">About this event</h2>
              
              <p className="text-gray-300 leading-relaxed">
                {event.description || event.shortSummary || 'More details about this event will be available soon.'}
              </p>

              {event.ticketTypes && event.ticketTypes.length > 0 && (
                <div className="space-y-3">
                  <p className="font-semibold">Available ticket options:</p>
                  
                  <div className="space-y-2">
                    {event.ticketTypes.map((ticket: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>{ticket.name}</span>
                          {ticket.description && (
                            <span className="text-sm text-gray-400">- {ticket.description}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Rs {ticket.price.toFixed(2)}</div>
                          {event.showTicketAvailability && (
                            <div className="text-xs text-gray-400">
                              {ticket.quantity - ticket.sold} left
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendees Section */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="space-y-4 pb-24">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <h3 className="text-xl font-semibold">
                      Who's Going ({event.totalTicketsSold} {event.totalTicketsSold === 1 ? 'person' : 'people'})
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {event.attendees.slice(0, 6).map((attendee: any, index: number) => {
                      // Use customer info from orders
                      const displayName = attendee.customerInfo?.firstName ? 
                                         `${attendee.customerInfo.firstName} ${attendee.customerInfo.lastName || ''}`.trim() : 
                                         'Anonymous Attendee';
                      const avatarSeed = attendee.customerInfo?.email || `attendee-${index}`;
                      
                      return (
                        <div key={attendee.id || index} className="relative group">
                          <Avatar className="w-8 h-8 cursor-pointer">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                            <AvatarFallback className="text-xs">
                              {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Hover tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 hidden md:block">
                            {displayName}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGuestlistModal(true)}
                      className="ml-2 text-xs"
                    >
                      View Guestlist
                    </Button>
                  </div>
                </div>
              )}

              {/* Image Gallery Section */}
              {event.images && event.images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    <h3 className="text-xl font-semibold">Event Gallery ({event.images.length} images)</h3>
                  </div>
                  
                  {/* Image Carousel */}
                  <div className="relative overflow-hidden rounded-lg">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                      {event.images.map((image: any, index: number) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={image.alt || `Event image ${index + 1}`}
                          className="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover flex-shrink-0"
                        />
                      ))}
                    </div>

                    {/* Image Counter */}
                    {event.images.length > 1 && (
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center">
                        <div className="text-xs sm:text-sm font-medium text-white">
                          {currentImageIndex + 1} / {event.images.length}
                        </div>
                      </div>
                    )}

                    {/* Navigation Dots */}
                    {event.images.length > 1 && (
                      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2">
                        {event.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                              index === currentImageIndex 
                                ? 'bg-white' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {event.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => 
                            prev === 0 ? event.images.length - 1 : prev - 1
                          )}
                          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all duration-300"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => 
                            (prev + 1) % event.images.length
                          )}
                          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all duration-300"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* YouTube Video Section */}
              {event.youtubeVideo && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5" />
                    <h3 className="text-xl font-semibold">Featured Video</h3>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={event.youtubeVideo.thumbnail} 
                          alt={event.youtubeVideo.title}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600 rounded-full p-2">
                            <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white line-clamp-2 mb-1">{event.youtubeVideo.title}</h4>
                        <p className="text-sm text-gray-400 mb-3">{event.youtubeVideo.channelTitle}</p>
                        {event.youtubeVideo.description && (
                          <p className="text-sm text-gray-300 line-clamp-3 mb-3">{event.youtubeVideo.description}</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(event.youtubeVideo.url, '_blank')}
                          className="bg-red-600 hover:bg-red-700 border-red-600 text-white"
                        >
                          <Youtube className="w-4 h-4 mr-2" />
                          Watch on YouTube
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Spotify Songs Section */}
              {event.songs && event.songs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    <h3 className="text-xl font-semibold">Event Playlist ({event.songs.length} tracks)</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {event.songs.map((song: any, index: number) => (
                      <div key={song.id || index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors">
                        {song.image && (
                          <img 
                            src={song.image} 
                            alt={song.album}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{song.name}</h4>
                          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                          {song.album && (
                            <p className="text-xs text-gray-500 truncate">{song.album}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {song.preview_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const audio = new Audio(song.preview_url);
                                audio.play();
                              }}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {song.external_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(song.external_url, '_blank')}
                              className="text-green-400 hover:text-green-300"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Features Section */}
              {event.features && event.features.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-xl font-semibold">Event Features</h3>
                  </div>
                  
                  <div className="grid gap-3">
                    {event.features.map((feature: any, index: number) => (
                      <div key={feature.id || index} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        {feature.imageUrl && (
                          <img 
                            src={feature.imageUrl} 
                            alt={feature.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{feature.title}</h4>
                          {feature.description && (
                            <p className="text-sm text-gray-300 mt-1">{feature.description}</p>
                          )}
                          {feature.link && (
                            <a 
                              href={feature.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-2"
                            >
                              Learn more <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  This is a ticket only event and is strictly 21+.
                </p>
              </div>

              {/* Organizer/Host Profile Section */}
            </div>
          </motion.div>

          {/* Right Column - Event Image */}
          <motion.div 
            className="lg:sticky lg:top-8 order-1 lg:order-2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src={getEventImage(event)}
                alt={`${event.name} event flyer`}
                className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] object-cover rounded-lg"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              />
              
              {/* Share Button */}
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4">
                <Button
                  onClick={() => setShowShareModal(true)}
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-white/20"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
            
          </motion.div>
        </div>

        {/* Guestlist Modal */}
        <AnimatePresence>
          {showGuestlistModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowGuestlistModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Event Guestlist</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGuestlistModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {event.attendees.map((attendee: any, index: number) => {
                    const displayName = attendee.customerInfo?.firstName ? 
                                       `${attendee.customerInfo.firstName} ${attendee.customerInfo.lastName?.charAt(0) || ''}.` : 
                                       'Anonymous Attendee';
                    const avatarSeed = attendee.customerInfo?.email || `attendee-${index}`;
                    
                    return (
                      <div key={attendee.id || index} className="flex flex-col items-center text-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <Avatar className="w-12 h-12 mb-2">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                          <AvatarFallback className="text-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="w-full">
                          <p className="text-sm font-medium text-white truncate mb-1">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {attendee.ticketType}
                          </p>
                          {attendee.quantity > 1 && (
                            <p className="text-xs text-gray-500">
                              {attendee.quantity} tickets
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && event && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share Event
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
                
                {/* Event Preview */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <img 
                      src={getEventImage(event)} 
                      alt={event.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{event.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{event.location}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-4">Share this event with your friends:</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <SocialShareButton
                      platform="facebook"
                      data={generateEventShareData(event)}
                      hashtags={['Event', 'Tickets', event.name.replace(/\s+/g, '')]}
                      className="w-full"
                      size="sm"
                    />
                    
                    <SocialShareButton
                      platform="instagram"
                      data={generateEventShareData(event)}
                      hashtags={['Event', 'Tickets', event.name.replace(/\s+/g, '')]}
                      className="w-full"
                      size="sm"
                    />
                    
                    <SocialShareButton
                      platform="whatsapp"
                      data={generateEventShareData(event)}
                      hashtags={['Event', 'Tickets', event.name.replace(/\s+/g, '')]}
                      className="w-full"
                      size="sm"
                    />
                    
                    <SocialShareButton
                      platform="copy"
                      data={generateEventShareData(event)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    />
                  </div>

                  {/* Native Share Button */}
                  <div className="pt-3 border-t border-gray-700">
                    <SocialShareButton
                      platform="native"
                      data={generateEventShareData(event)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      More Options
                    </SocialShareButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live DJ Playlist Section - Auto-show if active */}
        {event?.enableLivePlaylist && (isDJ || showLivePlaylist) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Mic className="h-6 w-6 text-orange-500" />
                Live DJ Playlist
                {isDJ && (
                  <Button
                    size="sm"
                    asChild
                    className="ml-4 bg-orange-500 hover:bg-orange-600"
                  >
                    <Link to={`/event/${id}/playlist`}>
                      <Settings className="h-4 w-4 mr-2" />
                      DJ Dashboard
                    </Link>
                  </Button>
                )}
              </h2>
              {!isDJ && (
                <Button
                  variant="ghost"
                  onClick={() => setShowLivePlaylist(false)}
                  className="text-muted-foreground"
                >
                  Hide
                </Button>
              )}
            </div>
            <LivePlaylist eventId={id!} isDJ={isDJ || false} />
          </motion.div>
        )}

        {/* Show Live Playlist Button for Attendees - Only if playlist is enabled */}
        {event?.enableLivePlaylist && !isDJ && !showLivePlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 mb-24"
          >
            <Card className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-200/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Music className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Live DJ Experience</h3>
                  <p className="text-muted-foreground mb-4">
                    Join the live playlist to request songs and vote on what plays next!
                  </p>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowLivePlaylist(true);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    type="button"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Join Live Playlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </motion.div>

      {/* Fixed Sticky Ticket Purchase Button */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 z-40 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 sm:py-4 text-sm sm:text-base lg:text-lg rounded-full shadow-lg border-2 border-transparent hover:border-gray-200 transition-all duration-200"
              onClick={() => navigate(`/event/${id}/tickets`)}
            >
              <span className="truncate">Get Tickets - Rs {event.ticketTypes?.[0]?.price || '25'}</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default EventDetails;