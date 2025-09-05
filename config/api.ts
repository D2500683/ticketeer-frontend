// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

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
    },
    UPLOAD: {
      IMAGE: `${API_BASE_URL}/api/upload/image`,
      DELETE_IMAGE: (publicId: string) => `${API_BASE_URL}/api/upload/image/${publicId}`,
    },
    SPOTIFY: {
      SEARCH: `${API_BASE_URL}/api/spotify/search`,
      TRACK: (id: string) => `${API_BASE_URL}/api/spotify/track/${id}`,
    },
    PLAYLIST: {
      GET: (eventId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist`,
      CREATE: (eventId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist`,
      REQUEST_SONG: (eventId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist/request`,
      VOTE: (eventId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist/vote`,
      APPROVE_SONG: (eventId: string, songId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist/approve/${songId}`,
      REJECT_SONG: (eventId: string, songId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist/reject/${songId}`,
      START_SESSION: (eventId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist/start`,
      END_SESSION: (eventId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist/end`,
      UPDATE_SETTINGS: (eventId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist/settings`,
      SET_CURRENT: (eventId: string) => `${API_BASE_URL}/api/livePlaylist/events/${eventId}/playlist/current`,
    },
    COLORS: {
      EXTRACT: `${API_BASE_URL}/api/colors/extract`,
    },
    YOUTUBE: {
      SEARCH: `${API_BASE_URL}/api/youtube/search`,
      VIDEO: (id: string) => `${API_BASE_URL}/api/youtube/video/${id}`,
    }
  }
};

export default API_CONFIG;
