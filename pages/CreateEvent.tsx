import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building, 
  Upload, 
  Plus, 
  Edit3, 
  Users, 
  Eye, 
  EyeOff,
  Lock,
  Youtube,
  Image as ImageIcon,
  Sparkles,
  Music,
  X,
  CreditCard,
  Smartphone
} from "lucide-react";
import SpotifySearch from '../components/SpotifySearch';
import YouTubeSearch from '../components/YouTubeSearch';

const CreateEvent = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create events.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, toast]);

  const [eventData, setEventData] = useState({
    name: "",
    shortSummary: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: "",
    location: "",
    venueName: "",
    ticketPrice: "10.00",
    isRecurring: false,
    ticketTypes: [
      {
        name: "General Admission",
        price: 10.00,
        quantity: 100,
        description: "",
        isVisible: true,
        requiresApproval: false,
        limitTicketValidity: false,
        limitPurchaseQuantity: false
      }
    ],
    showOnExplore: true,
    passwordProtected: false,
    showTicketAvailability: true,
    // Live DJ Playlist Settings
    enableLivePlaylist: false,
    livePlaylistSettings: {
      allowRequests: true,
      requireApproval: true,
      maxRequestsPerUser: 3,
      votingEnabled: true,
      autoPlayNext: false
    },
    // Payment Settings
    mcbJuiceNumber: "",
    organizerWhatsApp: ""
  });

  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [tempDescription, setTempDescription] = useState("");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [isCreatingNewTicket, setIsCreatingNewTicket] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [eventFeatures, setEventFeatures] = useState([]);
  const [currentFeature, setCurrentFeature] = useState({
    title: "",
    link: "",
    hasStartEndTimes: false,
    description: "",
    image: null,
    imageUrl: ""
  });
  const [isUploadingFeatureImage, setIsUploadingFeatureImage] = useState(false);
  const [cardVisibility, setCardVisibility] = useState({
    tickets: true,
    guestlist: true,
    eventFeatures: true,
    youtubeVideo: true,
    imageGallery: true,
    livePlaylist: true,
    pageSettings: true
  });
  const [uploadedFlyer, setUploadedFlyer] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [flyerUrl, setFlyerUrl] = useState('');
  const [isUploadingFlyer, setIsUploadingFlyer] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isSpotifySearchOpen, setIsSpotifySearchOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [extractedColors, setExtractedColors] = useState([]);
  const [selectedAccentColor, setSelectedAccentColor] = useState('#3b82f6');
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isYouTubeSearchOpen, setIsYouTubeSearchOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [currentTicket, setCurrentTicket] = useState({
    name: "Default Ticket",
    grossPrice: "8.19",
    displayPrice: "10.00",
    quantity: "Unlimited",
    description: "",
    limitSalesPeriod: false,
    limitTicketValidity: false,
    limitPurchaseQuantity: false
  });

  const mockAttendees = [
    { id: 1, name: "David", avatar: "" },
    { id: 2, name: "Sarah", avatar: "" },
    { id: 3, name: "Mike", avatar: "" },
    { id: 4, name: "Emma", avatar: "" },
    { id: 5, name: "John", avatar: "" },
    { id: 6, name: "Lisa", avatar: "" },
    { id: 7, name: "Tom", avatar: "" },
    { id: 8, name: "Anna", avatar: "" }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateEvent = async () => {
    if (!isAuthenticated || !token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create events.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    if (!eventData.name.trim() || !eventData.startDate || !eventData.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, date, location).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time for API
      const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime || '00:00'}`);
      const endDateTime = eventData.endDate 
        ? new Date(`${eventData.endDate}T${eventData.endTime || '23:59'}`)
        : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours later

      const eventPayload = {
        name: eventData.name.trim(),
        description: eventData.description.trim(),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: eventData.location.trim(),
        venueName: eventData.venueName.trim(),
        ticketTypes: eventData.ticketTypes.map(ticket => ({
          name: ticket.name,
          price: ticket.price,
          quantity: ticket.quantity,
          description: ticket.description
        })),
        flyerUrl: flyerUrl, // Cloud image URL
        songs: selectedSongs, // Spotify tracks
        youtubeVideo: selectedVideo, // YouTube video
        images: galleryImages.map(img => ({ url: img.url, alt: img.originalName })), // Gallery images
        features: eventFeatures, // Event features
        selectedAccentColor: selectedAccentColor, // Accent color for theming
        isRecurring: eventData.isRecurring,
        isPublic: eventData.showOnExplore,
        requiresApproval: eventData.passwordProtected,
        showTicketAvailability: eventData.showTicketAvailability,
        // Live DJ Playlist fields
        enableLivePlaylist: eventData.enableLivePlaylist,
        livePlaylistSettings: eventData.livePlaylistSettings,
        // Payment Settings
        mcbJuiceNumber: eventData.mcbJuiceNumber,
        organizerWhatsApp: eventData.organizerWhatsApp
      };

      const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const createdEvent = await response.json();

      toast({
        title: "Event Created Successfully!",
        description: `${eventData.name} has been created and is ready for attendees.`,
      });

      // Navigate to dashboard or event details
      navigate('/dashboard');

    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error Creating Event",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDescriptionModal = () => {
    setTempDescription(eventData.description);
    setIsDescriptionModalOpen(true);
  };

  const handleSaveDescription = () => {
    setEventData(prev => ({ ...prev, description: tempDescription }));
    setIsDescriptionModalOpen(false);
  };

  const handleCancelDescription = () => {
    setTempDescription("");
    setIsDescriptionModalOpen(false);
  };

  const handleOpenTicketModal = (ticketIndex = 0) => {
    const ticket = eventData.ticketTypes[ticketIndex];
    setCurrentTicketIndex(ticketIndex);
    setIsCreatingNewTicket(false);
    setCurrentTicket({
      name: ticket.name,
      grossPrice: (ticket.price * 0.9).toFixed(2), // Assuming 10% fee
      displayPrice: ticket.price.toFixed(2),
      quantity: ticket.quantity.toString(),
      description: ticket.description,
      limitSalesPeriod: false,
      limitTicketValidity: ticket.limitTicketValidity,
      limitPurchaseQuantity: ticket.limitPurchaseQuantity
    });
    setIsTicketModalOpen(true);
  };

  const handleCreateNewTicket = () => {
    setIsCreatingNewTicket(true);
    setCurrentTicket({
      name: "New Ticket Type",
      grossPrice: "9.00",
      displayPrice: "10.00",
      quantity: "100",
      description: "",
      limitSalesPeriod: false,
      limitTicketValidity: false,
      limitPurchaseQuantity: false
    });
    setIsTicketModalOpen(true);
  };

  const handleSaveTicket = () => {
    const updatedTicket = {
      name: currentTicket.name,
      price: parseFloat(currentTicket.displayPrice),
      quantity: parseInt(currentTicket.quantity) || 100,
      description: currentTicket.description,
      isVisible: true,
      requiresApproval: false,
      limitTicketValidity: currentTicket.limitTicketValidity,
      limitPurchaseQuantity: currentTicket.limitPurchaseQuantity
    };

    setEventData(prev => {
      if (isCreatingNewTicket) {
        // Add new ticket type
        return {
          ...prev,
          ticketTypes: [...prev.ticketTypes, updatedTicket]
        };
      } else {
        // Update existing ticket type
        return {
          ...prev,
          ticketPrice: currentTicketIndex === 0 ? currentTicket.displayPrice : prev.ticketPrice,
          ticketTypes: prev.ticketTypes.map((ticket, index) => 
            index === currentTicketIndex ? updatedTicket : ticket
          )
        };
      }
    });
    setIsTicketModalOpen(false);
  };

  const handleDeleteTicket = (ticketIndex) => {
    if (eventData.ticketTypes.length > 1) {
      setEventData(prev => ({
        ...prev,
        ticketTypes: prev.ticketTypes.filter((_, index) => index !== ticketIndex)
      }));
    }
  };

  const handleCancelTicket = () => {
    setIsTicketModalOpen(false);
  };

  const handleTicketChange = (field: string, value: string | boolean) => {
    setCurrentTicket(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenFeatureModal = () => {
    setCurrentFeature({
      title: "",
      link: "",
      hasStartEndTimes: false,
      description: "",
      image: null,
      imageUrl: ""
    });
    setIsFeatureModalOpen(true);
  };

  const handleSaveFeature = () => {
    if (currentFeature.title.trim()) {
      setEventFeatures(prev => [...prev, { ...currentFeature, id: Date.now() }]);
      setIsFeatureModalOpen(false);
    }
  };

  const handleCancelFeature = () => {
    setIsFeatureModalOpen(false);
  };

  const handleFeatureChange = (field: string, value: string | boolean) => {
    setCurrentFeature(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG or JPG image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingFeatureImage(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(API_CONFIG.ENDPOINTS.UPLOAD.IMAGE, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setCurrentFeature(prev => ({
        ...prev,
        image: file,
        imageUrl: data.url
      }));

      toast({
        title: "Image Uploaded",
        description: "Feature image uploaded successfully.",
      });
    } catch (error) {
      console.error('Feature image upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload feature image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFeatureImage(false);
    }
  };

  const handleRemoveFeatureImage = () => {
    setCurrentFeature(prev => ({
      ...prev,
      image: null,
      imageUrl: ""
    }));
  };

  const handleDeleteFeature = (featureId) => {
    setEventFeatures(prev => prev.filter(feature => feature.id !== featureId));
  };

  const toggleCardVisibility = (cardName) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  const handleFlyerUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PNG or JPG image.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setIsUploadingFlyer(true);
      setUploadedFlyer(file);
      
      try {
        // Upload to backend server
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(API_CONFIG.ENDPOINTS.UPLOAD.IMAGE, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        const imageUrl = data.url;
        
        setFlyerUrl(imageUrl);
        setFlyerPreview(imageUrl);

        // Extract colors from uploaded flyer
        await extractColorsFromImage(imageUrl);

        toast({
          title: "Flyer Uploaded",
          description: "Your event flyer has been uploaded successfully.",
        });
      } catch (error) {
        console.error('Upload error:', error);
        
        // Fallback to local preview if upload fails
        const reader = new FileReader();
        reader.onload = (e) => {
          setFlyerPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        toast({
          title: "Upload Warning",
          description: "Upload failed, using local preview only.",
          variant: "destructive",
        });
      } finally {
        setIsUploadingFlyer(false);
      }
    }
  };

  const handleRemoveFlyer = () => {
    setUploadedFlyer(null);
    setFlyerPreview(null);
    setFlyerUrl("");
    setExtractedColors([]);
    setSelectedAccentColor('#3b82f6');
  };

  const extractColorsFromImage = async (imageUrl) => {
    try {
      setIsExtractingColors(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/colors/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedColors(data.colors);
        if (data.colors.length > 0) {
          setSelectedAccentColor(data.colors[0].hex);
        }
        toast({
          title: "Colors Extracted",
          description: `Found ${data.colors.length} accent colors from your flyer!`,
        });
      }
    } catch (error) {
      console.error('Color extraction error:', error);
    } finally {
      setIsExtractingColors(false);
    }
  };

  const handleTrackSelect = (track) => {
    if (!selectedSongs.find(song => song.id === track.id)) {
      setSelectedSongs(prev => [...prev, track]);
      toast({
        title: "Song Added",
        description: `"${track.name}" by ${track.artist} added to your event.`,
      });
    }
  };

  const handleTrackRemove = (trackId) => {
    setSelectedSongs(prev => prev.filter(song => song.id !== trackId));
  };

  // Font options for title customization
  const fontOptions = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Playfair Display', family: '"Playfair Display", serif' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif' },
    { name: 'Open Sans', family: '"Open Sans", sans-serif' },
    { name: 'Lora', family: 'Lora, serif' },
    { name: 'Poppins', family: 'Poppins, sans-serif' },
    { name: 'Merriweather', family: 'Merriweather, serif' },
    { name: 'Nunito', family: 'Nunito, sans-serif' },
    { name: 'Source Sans Pro', family: '"Source Sans Pro", sans-serif' }
  ];

  const handleFontChange = (fontName) => {
    setSelectedFont(fontName);
    setIsFontDropdownOpen(false);
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    toast({
      title: "Video Added",
      description: `"${video.title}" has been added to your event.`,
    });
  };

  const handleVideoRemove = () => {
    setSelectedVideo(null);
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Validate files
    const validFiles = files.filter((file: File) => {
      const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid image format. Please use PNG, JPG, or JPEG.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB. Please choose a smaller image.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (!validFiles.length) return;

    setIsUploadingGallery(true);

    try {
      const uploadPromises = validFiles.map(async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(API_CONFIG.ENDPOINTS.UPLOAD.IMAGE, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        return {
          id: Date.now() + Math.random(), // Temporary ID
          url: data.url,
          filename: data.filename,
          originalName: file.name,
          size: file.size
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setGalleryImages(prev => [...prev, ...uploadedImages]);

      toast({
        title: "Images Uploaded",
        description: `${uploadedImages.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Some images failed to upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (imageId) => {
    setGalleryImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Generate subtle gradient background with accent color at top
  const generateGradientBackground = (color) => {
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

  return (
    <div 
      className="min-h-screen bg-background"
      style={extractedColors.length > 0 ? generateGradientBackground(selectedAccentColor) : {}}
    >
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="shadow-subtle">
                Sell Tickets
              </Button>
              <Button variant="ghost" size="sm">
                RSVP
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="shadow-subtle">
                <Upload className="w-4 h-4 mr-2" />
                Upload your flyer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Name */}
            <div className="space-y-4">
              <Input
                placeholder="My Event Name"
                value={eventData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="text-3xl font-bold border-none bg-transparent px-0 text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0"
                style={{ fontFamily: fontOptions.find(f => f.name === selectedFont)?.family || 'Inter, sans-serif' }}
              />
              
              <Button variant="outline" size="sm" className="shadow-subtle hover:shadow-glow transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Short Summary
              </Button>
            </div>

            {/* Dates Section */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={eventData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        className="shadow-subtle"
                      />
                      <Input
                        type="time"
                        value={eventData.startTime}
                        onChange={(e) => handleInputChange("startTime", e.target.value)}
                        className="shadow-subtle"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={eventData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        className="shadow-subtle"
                      />
                      <Input
                        type="time"
                        value={eventData.endTime}
                        onChange={(e) => handleInputChange("endTime", e.target.value)}
                        className="shadow-subtle"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Recurring Series</span>
                  </div>
                  <Switch
                    checked={eventData.isRecurring}
                    onCheckedChange={(checked) => handleInputChange("isRecurring", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="w-5 h-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start shadow-subtle hover:shadow-glow transition-all duration-300"
                  onClick={handleOpenDescriptionModal}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {eventData.description ? "Edit Description" : "Add Description"}
                </Button>
                {eventData.description && (
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {eventData.description}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter event location"
                    value={eventData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="shadow-subtle"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="venue" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Venue Name
                  </Label>
                  <Input
                    id="venue"
                    placeholder="Enter venue name"
                    value={eventData.venueName}
                    onChange={(e) => handleInputChange("venueName", e.target.value)}
                    className="shadow-subtle"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tickets */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5" />
                    Tickets
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardVisibility('tickets')}>
                    {cardVisibility.tickets ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {cardVisibility.tickets && (
                <CardContent className="space-y-4">
                {eventData.ticketTypes.map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border/40 rounded-lg bg-card/50">
                    <div>
                      <h3 className="font-medium">{ticket.name}</h3>
                      <p className="text-lg font-semibold">Rs{ticket.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{ticket.quantity} available</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenTicketModal(index)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      {eventData.ticketTypes.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTicket(index)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full shadow-subtle hover:shadow-glow transition-all duration-300"
                  onClick={handleCreateNewTicket}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket Type
                </Button>
                </CardContent>
              )}
            </Card>

            {/* Payment Settings */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5" />
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mcbJuiceNumber" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    MCB Juice Number (Optional)
                  </Label>
                  <Input
                    id="mcbJuiceNumber"
                    placeholder="e.g., +230 5XXX XXXX"
                    value={eventData.mcbJuiceNumber}
                    onChange={(e) => handleInputChange("mcbJuiceNumber", e.target.value)}
                    className="shadow-subtle"
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers will transfer money to this MCB Juice number for ticket payments
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizerWhatsApp" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    WhatsApp Number for Payment Verification (Required for MCB Juice)
                  </Label>
                  <Input
                    id="organizerWhatsApp"
                    placeholder="e.g., +230 5XXX XXXX"
                    value={eventData.organizerWhatsApp}
                    onChange={(e) => handleInputChange("organizerWhatsApp", e.target.value)}
                    className="shadow-subtle"
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers will send payment receipts to this WhatsApp number for verification
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Guestlist */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Guestlist
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardVisibility('guestlist')}>
                    {cardVisibility.guestlist ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {cardVisibility.guestlist && (
                <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    David and {mockAttendees.length - 1} others going
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mockAttendees.map((attendee, index) => (
                      <Avatar key={attendee.id} className="w-10 h-10 shadow-subtle">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback className="text-xs">
                          {attendee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                </CardContent>
              )}
            </Card>

            {/* Event Features */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Event Features
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardVisibility('eventFeatures')}>
                    {cardVisibility.eventFeatures ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {cardVisibility.eventFeatures && (
                <CardContent>
                  {eventFeatures.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No event features added yet</p>
                    <Button 
                      variant="outline" 
                      onClick={handleOpenFeatureModal}
                      className="shadow-subtle hover:shadow-glow transition-all duration-300"
                    >
                      Add Feature
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eventFeatures.map((feature) => (
                      <div key={feature.id} className="flex items-start gap-3 p-3 border border-border/40 rounded-lg bg-card/50">
                        {feature.imageUrl && (
                          <img 
                            src={feature.imageUrl} 
                            alt={feature.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{feature.title}</h4>
                          {feature.link && (
                            <p className="text-sm text-muted-foreground">{feature.link}</p>
                          )}
                          {feature.description && (
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteFeature(feature.id)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={handleOpenFeatureModal}
                      className="w-full shadow-subtle hover:shadow-glow transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                )}
                </CardContent>
              )}
            </Card>

            {/* YouTube Video */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5" />
                    YouTube Video
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardVisibility('youtubeVideo')}>
                    {cardVisibility.youtubeVideo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {cardVisibility.youtubeVideo && (
                <CardContent className="space-y-4">
                  {selectedVideo ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Selected Video</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsYouTubeSearchOpen(true)}
                          className="shadow-subtle hover:shadow-glow transition-all duration-300"
                        >
                          <Youtube className="w-4 h-4 mr-2" />
                          Change Video
                        </Button>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-24 h-18 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-2">{selectedVideo.title}</p>
                          <p className="text-sm text-muted-foreground">{selectedVideo.channelTitle}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(selectedVideo.url, '_blank')}
                            >
                              <Youtube className="w-4 h-4 mr-1" />
                              Watch
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleVideoRemove}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No YouTube video added yet</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsYouTubeSearchOpen(true)}
                        className="shadow-subtle hover:shadow-glow transition-all duration-300"
                      >
                        <Youtube className="w-4 h-4 mr-2" />
                        Add YouTube Video
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Image Gallery */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Image Gallery
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardVisibility('imageGallery')}>
                    {cardVisibility.imageGallery ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {cardVisibility.imageGallery && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Event Images ({galleryImages.length})</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                      disabled={isUploadingGallery}
                      className="shadow-subtle hover:shadow-glow transition-all duration-300"
                    >
                      {isUploadingGallery ? (
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      {isUploadingGallery ? "Uploading..." : "Add Images"}
                    </Button>
                  </div>

                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img 
                            src={image.url} 
                            alt={image.originalName}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveGalleryImage(image.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate">
                              {image.originalName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-border/40 rounded-lg">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No images added yet</p>
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('gallery-upload')?.click()}
                        disabled={isUploadingGallery}
                        className="shadow-subtle hover:shadow-glow transition-all duration-300"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Add Images
                      </Button>
                    </div>
                  )}

                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleGalleryUpload}
                    multiple
                    className="hidden"
                  />
                </CardContent>
              )}
            </Card>

            {/* Live DJ Playlist */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-orange-500" />
                    Live DJ Playlist
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardVisibility('livePlaylist')}>
                    {cardVisibility.livePlaylist ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {cardVisibility.livePlaylist && (
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-border/40 rounded-lg bg-gradient-to-r from-orange-50/50 to-pink-50/50">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-orange-500" />
                      <div>
                        <Label className="font-medium">Enable Live DJ Playlist</Label>
                        <p className="text-sm text-muted-foreground">Allow real-time song requests and voting during your event</p>
                      </div>
                    </div>
                    <Switch
                      checked={eventData.enableLivePlaylist}
                      onCheckedChange={(checked) => setEventData(prev => ({ ...prev, enableLivePlaylist: checked }))}
                    />
                  </div>

                  {eventData.enableLivePlaylist && (
                    <div className="space-y-4 pl-4 border-l-2 border-orange-200">
                      <h4 className="font-medium text-orange-700">Playlist Settings</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                          <div>
                            <Label className="font-medium">Allow Song Requests</Label>
                            <p className="text-xs text-muted-foreground">Let attendees request songs</p>
                          </div>
                          <Switch
                            checked={eventData.livePlaylistSettings.allowRequests}
                            onCheckedChange={(checked) => setEventData(prev => ({
                              ...prev,
                              livePlaylistSettings: { ...prev.livePlaylistSettings, allowRequests: checked }
                            }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                          <div>
                            <Label className="font-medium">Require Approval</Label>
                            <p className="text-xs text-muted-foreground">Review requests before playing</p>
                          </div>
                          <Switch
                            checked={eventData.livePlaylistSettings.requireApproval}
                            onCheckedChange={(checked) => setEventData(prev => ({
                              ...prev,
                              livePlaylistSettings: { ...prev.livePlaylistSettings, requireApproval: checked }
                            }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                          <div>
                            <Label className="font-medium">Enable Voting</Label>
                            <p className="text-xs text-muted-foreground">Let attendees vote on requests</p>
                          </div>
                          <Switch
                            checked={eventData.livePlaylistSettings.votingEnabled}
                            onCheckedChange={(checked) => setEventData(prev => ({
                              ...prev,
                              livePlaylistSettings: { ...prev.livePlaylistSettings, votingEnabled: checked }
                            }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                          <div>
                            <Label className="font-medium">Auto Play Next</Label>
                            <p className="text-xs text-muted-foreground">Automatically play top voted songs</p>
                          </div>
                          <Switch
                            checked={eventData.livePlaylistSettings.autoPlayNext}
                            onCheckedChange={(checked) => setEventData(prev => ({
                              ...prev,
                              livePlaylistSettings: { ...prev.livePlaylistSettings, autoPlayNext: checked }
                            }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Max Requests per User</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={eventData.livePlaylistSettings.maxRequestsPerUser}
                          onChange={(e) => setEventData(prev => ({
                            ...prev,
                            livePlaylistSettings: { 
                              ...prev.livePlaylistSettings, 
                              maxRequestsPerUser: parseInt(e.target.value) || 3 
                            }
                          }))}
                          className="max-w-24"
                        />
                        <p className="text-xs text-muted-foreground">Limit how many songs each attendee can request</p>
                      </div>

                      <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Music className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-800">Live DJ Features</p>
                            <p className="text-blue-600">
                              Your attendees will be able to search Spotify, request songs, and vote in real-time during your event. 
                              You'll get a dedicated DJ dashboard to manage the playlist.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Page Settings */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg">
                    <Eye className="w-5 h-5" />
                    Page Settings
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardVisibility('pageSettings')}>
                    {cardVisibility.pageSettings ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {cardVisibility.pageSettings && (
                <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">Show on Explore</Label>
                    <p className="text-sm text-muted-foreground">Make your event discoverable</p>
                  </div>
                  <Switch
                    checked={eventData.showOnExplore}
                    onCheckedChange={(checked) => handleInputChange("showOnExplore", checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">Password Protected Event</Label>
                    <p className="text-sm text-muted-foreground">Restrict access with a password</p>
                  </div>
                  <Switch
                    checked={eventData.passwordProtected}
                    onCheckedChange={(checked) => handleInputChange("passwordProtected", checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">Show Ticket Availability</Label>
                    <p className="text-sm text-muted-foreground">Display remaining ticket count to attendees</p>
                  </div>
                  <Switch
                    checked={eventData.showTicketAvailability}
                    onCheckedChange={(checked) => handleInputChange("showTicketAvailability", checked)}
                  />
                </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Flyer Upload */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6">
                {flyerPreview ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden group">
                    <img 
                      src={flyerPreview} 
                      alt="Event flyer preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => document.getElementById('flyer-upload').click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={handleRemoveFlyer}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="aspect-square border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center bg-card/30 hover:bg-card/50 transition-colors cursor-pointer group"
                    onClick={() => !isUploadingFlyer && document.getElementById('flyer-upload').click()}
                  >
                    <div className="text-center space-y-3">
                      {isUploadingFlyer ? (
                        <div className="animate-spin w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}
                      <div>
                        <p className="font-medium group-hover:text-foreground transition-colors">
                          {isUploadingFlyer ? "Uploading..." : "Upload your flyer"}
                        </p>
                        <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  id="flyer-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFlyerUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Spotify Integration */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Event Playlist</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsSpotifySearchOpen(true)}
                    className="shadow-subtle hover:shadow-glow transition-all duration-300"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Add from Spotify
                  </Button>
                </div>
                
                {selectedSongs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSongs.map((song) => (
                      <div key={song.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        {song.image && (
                          <img src={song.image} alt={song.album} className="w-10 h-10 rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{song.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTrackRemove(song.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No songs added yet. Click "Add from Spotify" to search for tracks.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Customization */}
            <Card className="shadow-depth hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between shadow-subtle hover:shadow-glow transition-all duration-300"
                    onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">Aa</span>
                      Title Font: {selectedFont}
                    </span>
                    <span className="text-muted-foreground">{isFontDropdownOpen ? '▲' : '▼'}</span>
                  </Button>
                  
                  {isFontDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {fontOptions.map((font) => (
                        <button
                          key={font.name}
                          onClick={() => handleFontChange(font.name)}
                          className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                          style={{ fontFamily: font.family }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{font.name}</span>
                            <span className="text-sm text-muted-foreground">Aa</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            The quick brown fox jumps over the lazy dog
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between shadow-subtle hover:shadow-glow transition-all duration-300"
                    onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                    disabled={extractedColors.length === 0}
                  >
                    <span className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: selectedAccentColor }}
                      ></div>
                      {extractedColors.length > 0 ? 'Accent Color' : 'Upload flyer to extract colors'}
                      {isExtractingColors && (
                        <div className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full" />
                      )}
                    </span>
                    <span className="text-muted-foreground">▼</span>
                  </Button>
                  
                  {isColorDropdownOpen && extractedColors.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-3">
                      <div className="text-sm font-medium mb-2">Colors from your flyer:</div>
                      <div className="grid grid-cols-3 gap-2">
                        {extractedColors.map((color, index) => (
                          <button
                            key={index}
                            className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                              selectedAccentColor === color.hex 
                                ? 'border-primary bg-primary/5' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setSelectedAccentColor(color.hex);
                              setIsColorDropdownOpen(false);
                            }}
                          >
                            <div 
                              className="w-8 h-8 rounded-full border mb-1" 
                              style={{ backgroundColor: color.hex }}
                            ></div>
                            <span className="text-xs text-gray-600">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button 
              className="w-full h-12 shadow-depth hover:shadow-elevated transition-all duration-300 bg-primary hover:bg-primary/90"
              onClick={handleCreateEvent}
              disabled={isSubmitting || !isAuthenticated}
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </div>
      </div>

      {/* Description Modal */}
      <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Event Description
            </DialogTitle>
            <DialogDescription>
              Provide a detailed description of your event. This will help attendees understand what to expect.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Describe your event in detail..."
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              className="min-h-[200px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Help attendees understand what makes your event special</span>
              <span>{tempDescription.length}/2000</span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelDescription}>
              Cancel
            </Button>
            <Button onClick={handleSaveDescription} className="bg-primary hover:bg-primary/90">
              Save Description
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Edit Modal */}
      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isCreatingNewTicket ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              {isCreatingNewTicket ? "Create New Ticket Type" : "Edit Ticket"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Ticket Name */}
            <div className="space-y-2">
              <Input
                value={currentTicket.name}
                onChange={(e) => handleTicketChange("name", e.target.value)}
                className="font-medium text-lg"
                placeholder="Ticket name"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">QTY</Label>
              <Input
                value={currentTicket.quantity}
                onChange={(e) => handleTicketChange("quantity", e.target.value)}
                placeholder="Unlimited"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gross Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    value={currentTicket.grossPrice}
                    onChange={(e) => handleTicketChange("grossPrice", e.target.value)}
                    className="pl-8"
                    placeholder="8.19"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Display Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    value={currentTicket.displayPrice}
                    onChange={(e) => handleTicketChange("displayPrice", e.target.value)}
                    className="pl-8"
                    placeholder="10.00"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={currentTicket.description}
                onChange={(e) => handleTicketChange("description", e.target.value)}
                placeholder="Add ticket description..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Ticket Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Ticket Settings</Label>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  More settings
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Limit Sales Period</Label>
                  <Switch
                    checked={currentTicket.limitSalesPeriod}
                    onCheckedChange={(checked) => handleTicketChange("limitSalesPeriod", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Limit Ticket Validity</Label>
                  <Switch
                    checked={currentTicket.limitTicketValidity}
                    onCheckedChange={(checked) => handleTicketChange("limitTicketValidity", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Limit Purchase Quantity</Label>
                  <Switch
                    checked={currentTicket.limitPurchaseQuantity}
                    onCheckedChange={(checked) => handleTicketChange("limitPurchaseQuantity", checked)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelTicket}>
              Cancel
            </Button>
            <Button onClick={handleSaveTicket} className="bg-primary hover:bg-primary/90">
              Save Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Features Modal */}
      <Dialog open={isFeatureModalOpen} onOpenChange={setIsFeatureModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Featured Section
            </DialogTitle>
            <DialogDescription>
              Display your event's performers, sponsors and more
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Feature Icon/Image Upload */}
            <div className="flex justify-center">
              {currentFeature.imageUrl ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden group">
                  <img 
                    src={currentFeature.imageUrl} 
                    alt="Feature preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => document.getElementById('feature-image-upload')?.click()}
                        className="p-1 h-6"
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={handleRemoveFeatureImage}
                        className="p-1 h-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-20 h-20 border-2 border-dashed border-border/40 rounded-lg flex items-center justify-center bg-card/30 hover:bg-card/50 transition-colors cursor-pointer group"
                  onClick={() => document.getElementById('feature-image-upload')?.click()}
                >
                  {isUploadingFeatureImage ? (
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              )}
              <input
                id="feature-image-upload"
                type="file"
                accept="image/*"
                onChange={handleFeatureImageUpload}
                className="hidden"
              />
            </div>

            {/* Feature Title */}
            <div className="space-y-2">
              <Input
                placeholder="Feature Title"
                value={currentFeature.title}
                onChange={(e) => handleFeatureChange("title", e.target.value)}
                className="text-center font-medium"
              />
            </div>

            {/* Custom Link */}
            <div className="space-y-2">
              <Input
                placeholder="https://custom-link.com"
                value={currentFeature.link}
                onChange={(e) => handleFeatureChange("link", e.target.value)}
                className="text-center"
              />
            </div>

            {/* Start/End Times Toggle */}
            <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="font-medium">Start/End Times</Label>
              </div>
              <Switch
                checked={currentFeature.hasStartEndTimes}
                onCheckedChange={(checked) => handleFeatureChange("hasStartEndTimes", checked)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Add a description for this feature..."
                value={currentFeature.description}
                onChange={(e) => handleFeatureChange("description", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelFeature}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeature} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spotify Search Modal */}
      <SpotifySearch
        isOpen={isSpotifySearchOpen}
        onClose={() => setIsSpotifySearchOpen(false)}
        onTrackSelect={handleTrackSelect}
        selectedTracks={selectedSongs}
        onTrackRemove={handleTrackRemove}
      />

      {/* YouTube Search Modal */}
      <YouTubeSearch
        isOpen={isYouTubeSearchOpen}
        onClose={() => setIsYouTubeSearchOpen(false)}
        onVideoSelect={handleVideoSelect}
        selectedVideo={selectedVideo}
        onVideoRemove={handleVideoRemove}
      />
    </div>
  );
};

export default CreateEvent;