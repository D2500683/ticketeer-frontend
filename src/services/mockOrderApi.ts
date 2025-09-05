// Mock order service for local development
// This simulates the backend API until real endpoints are implemented

interface Order {
  _id: string;
  eventId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  tickets: Array<{
    ticketTypeId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  attendees?: Array<{
    ticketType: string;
    quantity: number;
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
    };
    isGuest: boolean;
  }>;
  createdAt: string;
  status: string;
}

// In-memory storage (in production this would be a database)
const orders: Map<string, Order> = new Map();

export const mockOrderApi = {
  // Create a new order
  createOrder: async (orderData: Omit<Order, '_id' | 'createdAt' | 'status'>): Promise<Order> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order: Order = {
      _id: orderId,
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };
    
    // Store in local memory
    orders.set(orderId, order);
    
    // Also store in localStorage for persistence across page reloads
    const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '{}');
    storedOrders[orderId] = order;
    localStorage.setItem('mockOrders', JSON.stringify(storedOrders));
    
    return order;
  },

  // Get an order by ID
  getOrder: async (orderId: string): Promise<Order> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check in-memory storage first
    let order = orders.get(orderId);
    
    // If not found, check localStorage
    if (!order) {
      const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '{}');
      order = storedOrders[orderId];
    }
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  },

  // Get all orders (for future use)
  getAllOrders: async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '{}');
    return Object.values(storedOrders);
  }
};
