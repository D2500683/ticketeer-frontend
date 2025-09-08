// API Configuration
// Determine if we're in development mode
const isDevelopment = import.meta.env.DEV;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Default URLs based on environment
const getDefaultApiUrl = () => {
  if (isDevelopment && isLocalhost) {
    return 'http://localhost:5001';
  }
  return 'https://ticketeer-backend-2.onrender.com';
};

const API_BASE_URL = import.meta.env.VITE_API_URL || getDefaultApiUrl();
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || getDefaultApiUrl();

// Log current configuration for debugging
console.log('🔗 API Configuration:', {
  environment: isDevelopment ? 'development' : 'production',
  isLocalhost,
  apiUrl: API_BASE_URL,
  socketUrl: SOCKET_URL
});

// Helper function to make API requests with CORS handling
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  SOCKET_URL: SOCKET_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/auth/login`,
      SIGNUP: `${API_BASE_URL}/api/auth/register`,
      VERIFY: `${API_BASE_URL}/api/auth/validate`,
    },
    EVENTS: {
      BASE: `${API_BASE_URL}/api/events`,
      CREATE: `${API_BASE_URL}/api/events`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/events/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/events/${id}`,
      GET_BY_ID: (id: string) => `${API_BASE_URL}/api/events/${id}`,
      GET_BY_ORGANIZER: `${API_BASE_URL}/api/events/user/my-events`,
      PURCHASE: (id: string) => `${API_BASE_URL}/api/events/${id}/purchase`,
    },
    ORDERS: {
      BASE: `${API_BASE_URL}/api/orders`,
      CREATE: `${API_BASE_URL}/api/orders`,
      GET_BY_ID: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
      VERIFY: (id: string) => `${API_BASE_URL}/api/orders/${id}/verify`,
      MCB_JUICE: `${API_BASE_URL}/api/orders/mcb-juice`,
      MCB_JUICE_WHATSAPP: `${API_BASE_URL}/api/orders/mcb-juice-whatsapp`,
      BANK_TRANSFER_WHATSAPP: `${API_BASE_URL}/api/orders/bank-transfer-whatsapp`,
    },
    ADMIN: {
      ORDERS_PENDING: `${API_BASE_URL}/api/admin/orders/pending`,
      ORDERS_STATS: `${API_BASE_URL}/api/admin/orders/stats`,
      ORDERS_VERIFY: (id: string) => `${API_BASE_URL}/api/admin/orders/${id}/verify`,
      ORDERS_SCREENSHOT: (id: string) => `${API_BASE_URL}/api/admin/orders/${id}/screenshot`,
    },
    ANALYTICS: {
      USER: `${API_BASE_URL}/api/events/user/analytics`,
    },
    USER: {
      PROFILE: `${API_BASE_URL}/api/users/profile`,
      CHANGE_PASSWORD: `${API_BASE_URL}/api/users/change-password`,
      EVENTS_SUMMARY: `${API_BASE_URL}/api/users/events-summary`,
      TICKETS: `${API_BASE_URL}/api/users/tickets`,
      DELETE_ACCOUNT: `${API_BASE_URL}/api/users/account`,
      ATTENDEES: `${API_BASE_URL}/api/events/user/attendees`,
    },
    UPLOAD: {
      IMAGE: `${API_BASE_URL}/api/upload/image`,
      DELETE_IMAGE: (publicId: string) => `${API_BASE_URL}/api/upload/image/${publicId}`,
    },
    SPOTIFY: {
      SEARCH: `${API_BASE_URL}/api/spotify/search`,
      TRACK: (id: string) => `${API_BASE_URL}/api/spotify/track/${id}`,
    },
    YOUTUBE: {
      SEARCH: `${API_BASE_URL}/api/youtube/search`,
      VIDEO: (id: string) => `${API_BASE_URL}/api/youtube/video/${id}`,
    },
    PLAYLIST: {
      GET: (eventId: string) => `${API_BASE_URL}/api/playlists/events/${eventId}/playlist`,
      CREATE: (eventId: string) => `${API_BASE_URL}/api/playlists/events/${eventId}/playlist`,
      REQUEST_SONG: (eventId: string) => `${API_BASE_URL}/api/playlists/events/${eventId}/playlist/request`,
      VOTE: (eventId: string) => `${API_BASE_URL}/api/playlists/events/${eventId}/playlist/vote`,
      UPDATE_SONG: (eventId: string, songId: string) => `${API_BASE_URL}/api/playlists/events/${eventId}/playlist/songs/${songId}`,
      UPDATE_SETTINGS: (eventId: string) => `${API_BASE_URL}/api/playlists/events/${eventId}/playlist/settings`,
      SET_CURRENT: (eventId: string) => `${API_BASE_URL}/api/playlists/events/${eventId}/playlist/current`,
    },
    COLORS: {
      EXTRACT: `${API_BASE_URL}/api/colors/extract`,
    }
  }
};

export default API_CONFIG;
