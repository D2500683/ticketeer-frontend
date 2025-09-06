import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, MessageCircle, Phone, Mail, Calendar, DollarSign, Users, TrendingUp, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '@/config/api'

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone: string;
  };
  paymentScreenshot?: string;
  event?: {
    title: string;
  };
  totalAmount: number;
  paymentReference: string;
  paymentStatus: string;
  paymentMethod: string;
  organizerWhatsApp?: string;
  verificationNotes?: string;
  createdAt: string;
  eventId: {
    _id: string;
    name: string;
    date: string;
  };
  tickets: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface AdminStats {
  stats: {
    pending_verification: { count: number; totalAmount: number };
    pending_whatsapp_verification: { count: number; totalAmount: number };
    completed: { count: number; totalAmount: number };
    failed: { count: number; totalAmount: number };
  };
  recentOrders: Order[];
}

const AdminPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(60);

  // Fetch pending orders (both screenshot and WhatsApp verification)
  const { data: pendingOrders, isLoading: pendingLoading, refetch: refetchOrders, error: pendingError, isRefetching } = useQuery({
    queryKey: ['admin', 'pending-orders'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN.ORDERS_PENDING, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return response.json();
    },
    refetchInterval: 60000, // Refresh every 60 seconds to prevent rate limiting
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Disable to reduce requests
    refetchOnMount: true, // Always refetch on mount
    retry: 1, // Reduce retry attempts
    retryDelay: 5000, // Fixed 5-second delay between retries
    enabled: !!localStorage.getItem('token') // Only run if token exists
  });

  // Fetch admin stats
  const { data: adminStats, error: statsError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN.ORDERS_STATS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return response.json();
    },
    refetchInterval: 120000, // Refresh every 2 minutes to prevent rate limiting
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchOnWindowFocus: false, // Disable to reduce requests
    retry: 1, // Reduce retry attempts
    enabled: !!localStorage.getItem('token') // Only run if token exists
  });

  // Verification mutation
  const verifyOrderMutation = useMutation({
    mutationFn: async ({ orderId, action, notes }: { orderId: string; action: 'approve' | 'reject'; notes: string }) => {
      const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN.ORDERS_VERIFY(orderId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          action,
          notes
        })
      });
      if (!response.ok) throw new Error('Failed to verify order');
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === 'approve' ? 'Order Approved' : 'Order Rejected',
        description: variables.action === 'approve' ? 'Tickets have been sent to the customer' : 'Order has been rejected',
      });
      // Invalidate and refetch all admin queries immediately
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.refetchQueries({ queryKey: ['admin', 'pending-orders'] });
      queryClient.refetchQueries({ queryKey: ['admin', 'stats'] });
      setSelectedOrder(null);
      setVerificationNotes('');
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleVerification = (action: 'approve' | 'reject') => {
    if (!selectedOrder) return;
    verifyOrderMutation.mutate({
      orderId: selectedOrder._id,
      action,
      notes: verificationNotes
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MU', {
      style: 'currency',
      currency: 'MUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoRefreshCountdown(prev => {
        if (prev <= 1) {
          return 60; // Reset to 60 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const openWhatsApp = (phone: string, customerName: string, reference: string) => {
    const message = `Hi ${customerName}, thank you for your payment with reference ${reference}. Your tickets have been verified and sent to your email. Welcome to the event!`;
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#0C0C0C'}}>
      {/* Header */}
      <header className="border-b border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-50 shadow-sm" style={{backgroundColor: '#1A1A1A'}}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="border-l border-gray-600 pl-3 sm:pl-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-300 text-xs sm:text-sm">Payment Verification Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-300 font-medium">Organizer Panel</p>
              <p className="text-xs text-gray-400">Monitor & verify payments</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Stats Cards */}
        {adminStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <Card className="border border-gray-700 shadow-sm hover:shadow-md transition-shadow" style={{backgroundColor: '#1A1A1A'}}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-300">Pending Verification</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-400">
                      {(adminStats.stats.pending_whatsapp_verification?.count || 0) + (adminStats.stats.pending_verification?.count || 0)}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-orange-500" />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {formatCurrency((adminStats.stats.pending_whatsapp_verification?.totalAmount || 0) + (adminStats.stats.pending_verification?.totalAmount || 0))} total
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-700 shadow-sm hover:shadow-md transition-shadow" style={{backgroundColor: '#1A1A1A'}}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-300">Completed</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">
                      {adminStats.stats.completed.count}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-500" />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {formatCurrency(adminStats.stats.completed.totalAmount)} total
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-700 shadow-sm hover:shadow-md transition-shadow" style={{backgroundColor: '#1A1A1A'}}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-300">Total Revenue</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400">
                      {formatCurrency(adminStats.stats.completed.totalAmount)}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-500" />
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">From verified orders</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Orders */}
        <Card className="border border-gray-700 shadow-sm" style={{backgroundColor: '#1A1A1A'}}>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg lg:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-500" />
                <span className="text-sm sm:text-base lg:text-lg">Pending Orders ({pendingOrders?.length || 0})</span>
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => refetchOrders()}
                  variant="outline"
                  size="sm"
                  disabled={isRefetching}
                  className="border-orange-600 text-orange-400 hover:bg-orange-900/20 text-xs sm:text-sm w-full sm:w-auto"
                >
                  {isRefetching ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="ml-1 sm:ml-2">Refresh</span>
                </Button>
                <div className="text-xs text-gray-400 text-center sm:text-left">
                  Auto-refresh: {autoRefreshCountdown}s
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="flex flex-col sm:flex-row items-center justify-center py-6 sm:py-8 lg:py-12 gap-2 sm:gap-3">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 animate-spin text-orange-400" />
                <span className="text-gray-300 text-sm sm:text-base">Loading orders...</span>
              </div>
            ) : pendingError ? (
              <div className="text-center py-6 sm:py-8 lg:py-12">
                <p className="text-red-400 mb-3 sm:mb-4 text-sm sm:text-base">Failed to load orders</p>
                <Button onClick={() => refetchOrders()} variant="outline" size="sm" className="text-xs sm:text-sm border-gray-600 text-gray-300 hover:bg-gray-700">
                  Try Again
                </Button>
              </div>
            ) : !pendingOrders?.length ? (
              <div className="text-center py-6 sm:py-8 lg:py-12">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-300 text-sm sm:text-base">No pending orders</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {pendingOrders.map((order) => (
                  <div key={order._id} className="p-3 sm:p-4 lg:p-6 transition-colors hover:bg-opacity-20" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                      {/* Order Details */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start lg:items-center justify-between gap-2 sm:gap-3">
                          <h3 className="font-semibold text-white text-sm sm:text-base lg:text-lg break-words">
                            Order #{order.orderNumber}
                          </h3>
                          <Badge 
                            variant={order.paymentStatus === 'pending_whatsapp_verification' ? 'secondary' : 'outline'}
                            className="text-xs sm:text-sm w-fit bg-orange-900/30 text-orange-300 border-orange-600 shrink-0"
                          >
                            {order.paymentStatus === 'pending_whatsapp_verification' ? 'WhatsApp Verification' : 'Manual Verification'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-400">Customer:</span>
                            <p className="font-medium text-white break-words">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                            <p className="text-gray-300 break-all">{order.customerInfo.email}</p>
                            <p className="text-gray-300">{order.customerInfo.phone}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Event:</span>
                            <p className="font-medium text-white break-words">{order.event?.title || 'Unknown Event'}</p>
                            <p className="text-gray-300">Total: {formatCurrency(order.totalAmount)}</p>
                            <p className="text-gray-300">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {order.paymentReference && (
                          <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-3 sm:p-4">
                            <span className="text-xs sm:text-sm text-orange-300 font-medium">Payment Reference:</span>
                            <p className="font-mono text-sm sm:text-base text-orange-200 break-all mt-1">{order.paymentReference}</p>
                          </div>
                        )}
                      </div>
                      {/* Screenshot and Actions */}
                      <div className="space-y-3 sm:space-y-4">
                        {order.paymentScreenshot && (
                          <div>
                            <span className="text-xs sm:text-sm text-gray-400 block mb-2">Payment Screenshot:</span>
                            <div className="flex justify-center">
                              <img 
                                src={order.paymentScreenshot} 
                                alt="Payment Screenshot" 
                                className="w-full max-w-xs sm:max-w-sm rounded-lg border border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedImage(order.paymentScreenshot)}
                              />
                            </div>
                          </div>
                        )}
                        {order.paymentStatus === 'pending_whatsapp_verification' && (
                          <Button
                            onClick={() => openWhatsApp(order.customerInfo.phone, `${order.customerInfo.firstName} ${order.customerInfo.lastName}`, order.paymentReference || order.orderNumber)}
                            variant="outline"
                            className="w-full text-xs sm:text-sm py-2 sm:py-3 border-green-600 text-green-400 hover:bg-green-900/20"
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Send WhatsApp Confirmation
                          </Button>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <Button
                            onClick={() => {
                              setSelectedOrder(order);
                              setDialogOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white flex-1 text-xs sm:text-sm py-2 sm:py-3"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedOrder(order);
                              setDialogOpen(true);
                            }}
                            variant="destructive"
                            className="flex-1 text-xs sm:text-sm py-2 sm:py-3 bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Reject
                          </Button>
                        </div>
                        <Dialog open={dialogOpen && selectedOrder?._id === order._id} onOpenChange={setDialogOpen}>
                          <DialogContent className="max-w-xs sm:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-2 sm:mx-4 border-gray-700" style={{backgroundColor: '#1A1A1A'}}>
                            <DialogHeader>
                              <DialogTitle className="text-base sm:text-lg lg:text-xl break-words text-white">
                                {order.paymentMethod === 'mcb-juice-whatsapp' ? 'MCB Juice WhatsApp Verification' : 
                                 order.paymentMethod === 'bank-transfer-whatsapp' ? 'Bank Transfer WhatsApp Verification' : 
                                 'Screenshot Payment Verification'} - Order #{order.orderNumber}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 sm:space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm text-gray-300">
                                <div className="space-y-2">
                                  <p><strong className="text-white">Customer:</strong> {order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                                  <p><strong className="text-white">Email:</strong> {order.customerInfo.email}</p>
                                  <p><strong className="text-white">Phone:</strong> {order.customerInfo.phone}</p>
                                  <p><strong className="text-white">Amount:</strong> {formatCurrency(order.totalAmount)}</p>
                                </div>
                                <div className="space-y-2">
                                  <p><strong className="text-white">Event:</strong> {order.event?.title || 'Unknown Event'}</p>
                                  <p><strong className="text-white">Reference:</strong> {order.paymentReference}</p>
                                  <p><strong className="text-white">Date:</strong> {formatDate(order.createdAt)}</p>
                                  {order.organizerWhatsApp && (
                                    <p><strong className="text-white">WhatsApp:</strong> {order.organizerWhatsApp}</p>
                                  )}
                                </div>
                              </div>
                              
                              {(order.paymentMethod === 'mcb-juice-whatsapp' || order.paymentMethod === 'bank-transfer-whatsapp') && (
                                <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                                  <h4 className="font-medium text-blue-300 mb-2 flex items-center">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    WhatsApp Payment Confirmation
                                  </h4>
                                  <p className="text-sm text-blue-200 mb-3">
                                    Customer was instructed to send {order.paymentMethod === 'bank-transfer-whatsapp' ? 'bank transfer' : 'MCB Juice payment'} confirmation via WhatsApp to {order.organizerWhatsApp}.
                                    Please check your WhatsApp messages for payment confirmation from this customer.
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openWhatsApp(order.customerInfo.phone, `${order.customerInfo.firstName} ${order.customerInfo.lastName}`, order.paymentReference)}
                                    className="text-blue-300 border-blue-600 hover:bg-blue-900/30"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Send WhatsApp Confirmation
                                  </Button>
                                </div>
                              )}
                              
                              <div className="space-y-3 sm:space-y-4">
                                <Textarea
                                  placeholder="Add verification notes (required for rejection, optional for approval)..."
                                  value={verificationNotes}
                                  onChange={(e) => setVerificationNotes(e.target.value)}
                                  rows={3}
                                  className="resize-none border-gray-600 text-white placeholder-gray-400 text-sm sm:text-base"
                                  style={{backgroundColor: '#2A2A2A'}}
                                />
                                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedOrder(null);
                                      setVerificationNotes('');
                                      setDialogOpen(false);
                                    }}
                                    className="w-full sm:w-auto text-sm sm:text-base"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleVerification('reject')}
                                    disabled={verifyOrderMutation.isPending}
                                    className="w-full sm:w-auto text-sm sm:text-base"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    <span>Reject Order</span>
                                  </Button>
                                  <Button
                                    onClick={() => handleVerification('approve')}
                                    disabled={verifyOrderMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    <span>Approve & Send Tickets</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl w-full mx-2 sm:mx-4 border-gray-700" style={{backgroundColor: '#1A1A1A'}}>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg lg:text-xl text-white">Payment Screenshot</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center p-2 sm:p-4">
              <img 
                src={selectedImage} 
                alt="Payment Screenshot" 
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] lg:max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
