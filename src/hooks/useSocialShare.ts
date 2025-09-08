import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Utility function to convert URL to File object
const urlToFile = async (url: string, filename: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

interface ShareData {
  title: string;
  text: string;
  url: string;
  image?: string;
}

interface SocialShareOptions {
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'twitter' | 'linkedin';
  data: ShareData;
  hashtags?: string[];
}

export const useSocialShare = () => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const generateShareUrl = (options: SocialShareOptions): string => {
    const { platform, data, hashtags = [] } = options;
    const encodedUrl = encodeURIComponent(data.url);
    const encodedText = encodeURIComponent(data.text);
    const encodedTitle = encodeURIComponent(data.title);
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(`${data.title}\n\n${data.text}\n\n${data.url}`)}`;
      
      case 'twitter':
        const twitterText = `${data.text} ${hashtagString}`.trim();
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodedUrl}`;
      
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`;
      
      case 'instagram':
        // Instagram doesn't support direct URL sharing
        return 'https://www.instagram.com/';
      
      default:
        return data.url;
    }
  };

  const shareToSocial = async (options: SocialShareOptions) => {
    setIsSharing(true);
    
    try {
      const shareUrl = generateShareUrl(options);
      
      if (options.platform === 'instagram') {
        // Special handling for Instagram
        await copyToClipboard(`${options.data.title}\n\n${options.data.text}\n\n${options.data.url}`);
        toast({
          title: "Instagram Share Ready!",
          description: "Content copied to clipboard. Open Instagram to paste and share!",
        });
        
        // Open Instagram after a short delay
        setTimeout(() => {
          window.open(shareUrl, '_blank');
        }, 1000);
      } else if (options.platform === 'whatsapp') {
        // Special handling for WhatsApp with image
        if (options.data.image && navigator.share) {
          // Try native sharing first (works on mobile with images)
          try {
            await navigator.share({
              title: options.data.title,
              text: options.data.text,
              url: options.data.url,
              files: options.data.image ? [await urlToFile(options.data.image, 'event-image.jpg')] : undefined
            });
            
            toast({
              title: "Shared to WhatsApp!",
              description: "Event shared with image successfully",
            });
            return;
          } catch (nativeError) {
            console.log('Native share failed, falling back to web share');
          }
        }
        
        // Fallback: Open WhatsApp web with text and provide image instructions
        window.open(shareUrl, '_blank');
        
        if (options.data.image) {
          // Copy image URL for manual sharing
          setTimeout(async () => {
            await copyToClipboard(options.data.image!);
            toast({
              title: "Image URL Copied!",
              description: "Paste the image URL in WhatsApp to share the event flyer",
            });
          }, 2000);
        }
        
        toast({
          title: "WhatsApp Opened!",
          description: options.data.image ? "Message sent. Image URL will be copied for you to paste." : "Message ready to send",
        });
      } else {
        // Open share dialog for other platforms
        const popup = window.open(
          shareUrl, 
          `share-${options.platform}`,
          'width=600,height=400,scrollbars=yes,resizable=yes'
        );
        
        if (popup) {
          toast({
            title: `Shared to ${options.platform.charAt(0).toUpperCase() + options.platform.slice(1)}!`,
            description: "Share dialog opened successfully",
          });
        } else {
          throw new Error('Popup blocked');
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "Share Failed",
        description: "Could not open share dialog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const shareWithNativeAPI = async (data: ShareData): Promise<boolean> => {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      
      toast({
        title: "Shared successfully!",
        description: "Content shared using device's native sharing",
      });
      
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
      return false;
    }
  };

  const generateEventShareData = (event: any, customMessage?: string): ShareData => {
    const eventUrl = `${window.location.origin}/events/${event._id}`;
    const defaultMessage = `Join me at ${event.name}! 📅 ${new Date(event.startDate).toLocaleDateString()} 📍 ${event.location}`;
    
    return {
      title: `🎉 ${event.name}`,
      text: customMessage || defaultMessage,
      url: eventUrl,
      image: event.imageUrl || event.image || (event.images && event.images[0])
    };
  };

  const generateTicketShareData = (event: any, orderNumber: string): ShareData => {
    const eventUrl = `${window.location.origin}/events/${event._id}`;
    
    return {
      title: `🎫 I'm going to ${event.name}!`,
      text: `Just got my tickets for ${event.name}! 🎉\n📅 ${new Date(event.startDate).toLocaleDateString()}\n📍 ${event.location}\n\nJoin me - tickets still available!`,
      url: eventUrl,
      image: event.imageUrl || event.image || (event.images && event.images[0])
    };
  };

  return {
    shareToSocial,
    shareWithNativeAPI,
    copyToClipboard,
    generateEventShareData,
    generateTicketShareData,
    isSharing,
  };
};

export default useSocialShare;
