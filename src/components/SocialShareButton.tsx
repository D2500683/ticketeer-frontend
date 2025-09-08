import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Twitter, 
  Linkedin,
  Copy,
  ExternalLink 
} from 'lucide-react';
import { useSocialShare } from '@/hooks/useSocialShare';

interface SocialShareButtonProps {
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'twitter' | 'linkedin' | 'copy' | 'native';
  data: {
    title: string;
    text: string;
    url: string;
  };
  hashtags?: string[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  platform,
  data,
  hashtags = [],
  variant = 'default',
  size = 'default',
  className = '',
  children
}) => {
  const { shareToSocial, shareWithNativeAPI, copyToClipboard, isSharing } = useSocialShare();

  const platformConfig = {
    facebook: {
      icon: Facebook,
      label: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
      outlineColor: 'border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white'
    },
    instagram: {
      icon: Instagram,
      label: 'Instagram',
      color: 'bg-gradient-to-r from-[#E4405F] to-[#F77737] hover:from-[#D73654] hover:to-[#F56A2A] text-white',
      outlineColor: 'border-[#E4405F] text-[#E4405F] hover:bg-[#E4405F] hover:text-white'
    },
    whatsapp: {
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#22C55E] text-white',
      outlineColor: 'border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white'
    },
    twitter: {
      icon: Twitter,
      label: 'Twitter',
      color: 'bg-[#1DA1F2] hover:bg-[#1A91DA] text-white',
      outlineColor: 'border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white'
    },
    linkedin: {
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'bg-[#0A66C2] hover:bg-[#095BA0] text-white',
      outlineColor: 'border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white'
    },
    copy: {
      icon: Copy,
      label: 'Copy Link',
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      outlineColor: 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
    },
    native: {
      icon: Share2,
      label: 'Share',
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      outlineColor: 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
    }
  };

  const config = platformConfig[platform];
  const Icon = config.icon;

  const handleClick = async () => {
    if (platform === 'copy') {
      await copyToClipboard(data.url);
      return;
    }

    if (platform === 'native') {
      const nativeShareSuccess = await shareWithNativeAPI(data);
      if (!nativeShareSuccess) {
        // Fallback to copy if native share fails
        await copyToClipboard(data.url);
      }
      return;
    }

    await shareToSocial({
      platform: platform as 'facebook' | 'instagram' | 'whatsapp' | 'twitter' | 'linkedin',
      data,
      hashtags
    });
  };

  const getButtonStyles = () => {
    if (variant === 'outline') {
      return `border ${config.outlineColor}`;
    }
    if (variant === 'ghost') {
      return `hover:bg-gray-100 ${config.outlineColor.split(' ')[1]}`;
    }
    return config.color;
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isSharing}
      variant={variant === 'default' ? undefined : variant}
      size={size}
      className={`${variant === 'default' ? getButtonStyles() : ''} ${className}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {children || config.label}
    </Button>
  );
};

export default SocialShareButton;
