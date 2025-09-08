import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Share2, Instagram, Facebook, MessageCircle, Copy, Download, Camera, ExternalLink } from 'lucide-react';

interface SocialShareProps {
  event: {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    location: string;
    image?: string;
    ticketTypes: Array<{
      name: string;
      price: number;
    }>;
  };
  shareUrl?: string;
  customMessage?: string;
  showInline?: boolean;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  event, 
  shareUrl, 
  customMessage,
  showInline = false 
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Generate share URL
  const eventUrl = shareUrl || `${window.location.origin}/events/${event._id}`;
  
  // Generate share content
  const shareTitle = `🎉 ${event.name}`;
  const shareDescription = customMessage || `Join me at ${event.name}! 📅 ${new Date(event.startDate).toLocaleDateString()} 📍 ${event.location}`;
  const shareHashtags = ['Event', 'Tickets', 'Fun', event.name.replace(/\s+/g, '')];
  
  // Price range for display
  const prices = event.ticketTypes.map(t => t.price).filter(p => p > 0);
  const priceRange = prices.length > 0 
    ? prices.length === 1 
      ? `Rs ${prices[0]}`
      : `Rs ${Math.min(...prices)} - Rs ${Math.max(...prices)}`
    : 'Free';

  const fullShareText = `${shareDescription}\n\n🎫 Tickets: ${priceRange}\n🔗 Get yours: ${eventUrl}`;

  // Social media sharing functions
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(fullShareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    
    toast({
      title: "Shared to Facebook!",
      description: "Event shared successfully",
    });
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Shared to WhatsApp!",
      description: "Event shared successfully",
    });
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct URL sharing, so we'll copy text and provide instructions
    copyToClipboard(fullShareText);
    
    toast({
      title: "Instagram Share Ready!",
      description: "Text copied! Open Instagram and paste in your story or post",
    });
    
    // Open Instagram web (if available)
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Share text copied successfully",
      });
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copied to clipboard!",
        description: "Share text copied successfully",
      });
    });
  };

  const copyShareUrl = () => {
    copyToClipboard(eventUrl);
  };

  const downloadEventImage = async () => {
    if (!event.image) {
      toast({
        title: "No image available",
        description: "This event doesn't have a shareable image",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(event.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.name.replace(/\s+/g, '_')}_event.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Image downloaded!",
        description: "Event image saved to your device",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the event image",
        variant: "destructive",
      });
    }
  };

  const ShareButtons = () => (
    <div className="space-y-4">
      {/* Quick Share Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={shareToFacebook}
          className="bg-[#1877F2] hover:bg-[#166FE5] text-white w-full"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        
        <Button
          onClick={shareToWhatsApp}
          className="bg-[#25D366] hover:bg-[#22C55E] text-white w-full"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
        
        <Button
          onClick={shareToInstagram}
          className="bg-gradient-to-r from-[#E4405F] to-[#F77737] hover:from-[#D73654] to-[#F56A2A] text-white w-full"
        >
          <Instagram className="h-4 w-4 mr-2" />
          Instagram
        </Button>
      </div>

      {/* Additional Options */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={copyShareUrl}
            variant="outline"
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          
          {event.image && (
            <Button
              onClick={downloadEventImage}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          )}
        </div>

        {/* Share Preview */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-2">Share Preview:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{shareTitle}</p>
              <p>{shareDescription}</p>
              <p className="text-blue-600">🎫 {priceRange}</p>
              <p className="text-xs text-gray-500 break-all">{eventUrl}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (showInline) {
    return (
      <div className="w-full">
        <ShareButtons />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Share2 className="h-4 w-4 mr-2" />
          Share Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {event.name}
          </DialogTitle>
        </DialogHeader>
        <ShareButtons />
      </DialogContent>
    </Dialog>
  );
};

export default SocialShare;
