/**
 * Social Media Sharing Utilities
 * Provides helper functions for social media integrations
 */

export interface ShareContent {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export interface EventShareData {
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  ticketPrice?: string;
  organizerName?: string;
  imageUrl?: string;
}

/**
 * Generate optimized content for different social platforms
 */
export const generatePlatformContent = (
  baseContent: ShareContent,
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'twitter' | 'linkedin'
): string => {
  const { title, description, url, hashtags = [] } = baseContent;
  
  switch (platform) {
    case 'facebook':
      return `${title}\n\n${description}\n\n🔗 ${url}`;
    
    case 'instagram':
      // Instagram prefers shorter text with more emojis
      const instagramHashtags = hashtags.map(tag => `#${tag}`).join(' ');
      return `${title} ✨\n\n${description}\n\n${instagramHashtags}\n\nLink in bio! 👆`;
    
    case 'whatsapp':
      return `${title}\n\n${description}\n\n🎟️ Get your tickets: ${url}`;
    
    case 'twitter':
      // Twitter has character limits, so keep it concise
      const twitterHashtags = hashtags.slice(0, 3).map(tag => `#${tag}`).join(' ');
      const maxLength = 280 - url.length - twitterHashtags.length - 10; // Buffer for spacing
      const shortDescription = description.length > maxLength 
        ? description.substring(0, maxLength - 3) + '...' 
        : description;
      return `${title}\n\n${shortDescription}\n\n${twitterHashtags}\n\n${url}`;
    
    case 'linkedin':
      return `${title}\n\n${description}\n\nEvent Details: ${url}`;
    
    default:
      return `${title}\n\n${description}\n\n${url}`;
  }
};

/**
 * Generate event-specific share content
 */
export const generateEventShareContent = (eventData: EventShareData): ShareContent => {
  const { eventName, eventDate, location, ticketPrice, organizerName, imageUrl } = eventData;
  
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const title = `🎉 ${eventName}`;
  
  let description = `Join me at ${eventName}!\n\n`;
  description += `📅 ${formattedDate}\n`;
  description += `📍 ${location}\n`;
  
  if (ticketPrice) {
    description += `🎫 From ${ticketPrice}\n`;
  }
  
  if (organizerName) {
    description += `👥 Organized by ${organizerName}\n`;
  }
  
  description += `\nDon't miss out - get your tickets now!`;

  const hashtags = [
    'Event',
    'Tickets',
    eventName.replace(/\s+/g, ''),
    'Fun',
    'Entertainment'
  ];

  return {
    title,
    description,
    url: `${window.location.origin}/events/${eventData.eventId}`,
    image: imageUrl,
    hashtags
  };
};

/**
 * Generate ticket confirmation share content
 */
export const generateTicketConfirmationContent = (
  eventData: EventShareData,
  orderNumber: string,
  customerName: string
): ShareContent => {
  const { eventName, eventDate, location, imageUrl } = eventData;
  
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const title = `🎫 I'm going to ${eventName}!`;
  
  let description = `Just secured my spot at ${eventName}! 🎉\n\n`;
  description += `📅 ${formattedDate}\n`;
  description += `📍 ${location}\n`;
  description += `🎟️ Order #${orderNumber}\n\n`;
  description += `Who else is coming? Tickets are still available!`;

  const hashtags = [
    'Going',
    'Excited',
    eventName.replace(/\s+/g, ''),
    'Event',
    'Tickets'
  ];

  return {
    title,
    description,
    url: `${window.location.origin}/events/${eventData.eventId}`,
    image: imageUrl,
    hashtags
  };
};

/**
 * Check if native sharing is available
 */
export const isNativeSharingAvailable = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator;
};

/**
 * Get platform-specific share URLs
 */
export const getPlatformShareUrl = (
  platform: 'facebook' | 'whatsapp' | 'twitter' | 'linkedin',
  content: ShareContent
): string => {
  const encodedUrl = encodeURIComponent(content.url);
  const encodedText = encodeURIComponent(generatePlatformContent(content, platform));
  const encodedTitle = encodeURIComponent(content.title);

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}`;
    
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodeURIComponent(content.description)}`;
    
    default:
      return content.url;
  }
};

/**
 * Track social sharing analytics (placeholder for future implementation)
 */
export const trackSocialShare = (
  platform: string,
  eventId: string,
  shareType: 'event' | 'ticket_confirmation'
): void => {
  // This would integrate with your analytics service
  console.log('Social share tracked:', {
    platform,
    eventId,
    shareType,
    timestamp: new Date().toISOString()
  });
  
  // Example: Send to analytics service
  // analytics.track('social_share', { platform, eventId, shareType });
};

/**
 * Generate QR code URL for easy sharing
 */
export const generateQRCodeUrl = (url: string, size: number = 200): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
};

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
