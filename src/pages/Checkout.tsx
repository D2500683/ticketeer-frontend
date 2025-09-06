import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import { ArrowLeft, CreditCard, Lock, Mail, User, Phone, MapPin, Calendar, Smartphone, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockOrderApi } from "@/services/mockOrderApi";
import MCBJuiceManualPayment from "@/components/MCBJuiceManualPayment";

// Clean black and white theme - no gradients needed

// API function to fetch single event
const fetchEvent = async (id: string) => {
  console.log('Fetching event with URL:', `${import.meta.env.VITE_API_URL}/api/events/${id}`);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`);
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  
  if (!response.ok) {
    const text = await response.text();
    console.log('Error response text:', text);
    throw new Error(`Failed to fetch event: ${response.status} - ${text}`);
  }
  return response.json();
};

// API function to create order
const createOrder = async (orderData: any) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  
  return response.json();
};

interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
  price: number;
  name: string;
}

interface CheckoutData {
  eventId: string;
  tickets: TicketSelection[];
  totalPrice: number;
  totalTickets: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [accountNumber, setAccountNumber] = useState<string>("");
  
  // Customer Information Form
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  // Payment method is now only MCB Juice
  const [paymentMethod] = useState<'mcb-juice'>('mcb-juice');

  // Load checkout data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem('ticketSelection');
    if (storedData) {
      setCheckoutData(JSON.parse(storedData));
    } else {
      // Redirect back if no checkout data
      navigate('/events');
    }
  }, [navigate]);

  const { data: event } = useQuery({
    queryKey: ['event', checkoutData?.eventId],
    queryFn: () => fetchEvent(checkoutData!.eventId),
    enabled: !!checkoutData?.eventId,
  });

  // Fetch account number from event data
  useEffect(() => {
    console.log('Event data in checkout:', event);
    console.log('Account number from event:', event?.accountNumber);
    if (event?.accountNumber) {
      setAccountNumber(event.accountNumber);
      console.log('Setting account number to:', event.accountNumber);
    }
  }, [event]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    });
  };

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };


  const validateForm = () => {
    const requiredCustomerFields = ['firstName', 'lastName', 'email'];
    
    for (const field of requiredCustomerFields) {
      if (!customerInfo[field as keyof typeof customerInfo]) {
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      return false;
    }
    
    return true;
  };

  const validateFormWithToast = () => {
    const requiredCustomerFields = ['firstName', 'lastName', 'email'];
    
    for (const field of requiredCustomerFields) {
      if (!customerInfo[field as keyof typeof customerInfo]) {
        toast({
          title: "Missing Information",
          description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };



  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const serviceFee = 0; // No service fee
  const totalWithFees = checkoutData.totalPrice;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link to={`/event/${checkoutData.eventId}/tickets`}>
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-gray-600 hover:text-black hover:bg-gray-100 shrink-0 p-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Back to Tickets</span>
                  <span className="sm:hidden text-sm">Back</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center shrink-0">
                  <span className="font-bold text-xs sm:text-sm text-white">T</span>
                </div>
                <span className="font-bold text-lg sm:text-xl text-black truncate">Ticketeer</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 shrink-0">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Secure Checkout</span>
              <span className="sm:hidden">Secure</span>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-2 lg:order-1 min-w-0">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Checkout</h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Complete your ticket purchase securely</p>
            </div>

            {/* Customer Information */}
            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 text-base sm:text-lg lg:text-xl">
                  <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="truncate">Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2 min-w-0">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.firstName}
                      onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                      placeholder="John"
                      className="h-10 sm:h-11 w-full bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 min-w-0">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                      placeholder="Doe"
                      className="h-10 sm:h-11 w-full bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                      placeholder="john@example.com"
                      className="h-10 sm:h-11 pl-10 sm:pl-11 w-full bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="h-10 sm:h-11 pl-10 sm:pl-11 w-full bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method - MCB Juice Transfer */}
            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 text-base sm:text-lg lg:text-xl">
                  <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <span className="truncate">Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5">
                <div className="w-full overflow-hidden">
                  <MCBJuiceManualPayment
                    checkoutData={checkoutData}
                    customerInfo={customerInfo}
                    onSuccess={(orderId) => {
                      // Invalidate event queries to refresh ticket quantities
                      queryClient.invalidateQueries({ queryKey: ['event'] });
                      queryClient.invalidateQueries({ queryKey: ['events'] });
                      navigate(`/confirmation/${orderId}`);
                    }}
                    onError={(error) => {
                      toast({
                        title: "Payment Error",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    disabled={!validateForm()}
                  />
                </div>
                
                {/* Bank Transfer Option */}
                {accountNumber && (
                  <div style={{border: '2px solid red', padding: '10px', margin: '10px'}}>
                    DEBUG: Account number found: {accountNumber}
                  </div>
                )}
                {accountNumber && (
                  <div className="space-y-3 sm:space-y-4 w-full">
                    <div className="relative w-full">
                      <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-black transition-all duration-200 cursor-pointer"
                           onClick={() => setShowBankTransfer(!showBankTransfer)}>
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              showBankTransfer 
                                ? 'bg-black border-black' 
                                : 'border-gray-300 hover:border-black'
                            }`}>
                              {showBankTransfer && (
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-black shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-black text-sm sm:text-base lg:text-lg block truncate">Bank Transfer</span>
                              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-tight">
                                Direct bank account transfer
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`transform transition-transform duration-200 ${showBankTransfer ? 'rotate-180' : ''}`}>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bank Transfer Details */}
                    {showBankTransfer && (
                      <div className="animate-in slide-in-from-top-2 duration-300 w-full">
                        <Card className="border border-gray-200 shadow-sm bg-white w-full">
                          <CardContent className="p-3 sm:p-4 lg:p-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-black text-sm sm:text-base lg:text-lg">Bank Transfer Details</h4>
                              
                              {/* Account Number */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200 gap-2">
                                <span className="text-sm sm:text-base text-blue-700 font-medium">Account Number:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xl sm:text-2xl text-blue-800 break-all">{accountNumber}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(accountNumber, 'Account number')}
                                    className="p-1 h-auto text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Amount */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border-2 border-gray-200 gap-2">
                                <span className="text-sm sm:text-base text-gray-700 font-medium">Amount to transfer:</span>
                                <span className="font-bold text-xl sm:text-2xl text-black break-all">Rs {checkoutData.totalPrice.toFixed(2)}</span>
                              </div>
                              
                              <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Transfer the exact amount to the account number above and contact the organizer for verification.
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2 order-1 lg:order-2 min-w-0">
            <div className="lg:sticky lg:top-24">
              <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-gray-900 text-base sm:text-lg lg:text-xl font-semibold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5">
                  {/* Event Info */}
                  {event && (
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg leading-tight break-words">{event.name}</h3>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                          <span className="text-xs sm:text-sm break-words">{new Date(event.startDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm leading-relaxed break-words">{event.venueName || event.location}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="bg-gray-200" />

                  {/* Tickets */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-medium text-gray-900 text-xs sm:text-sm uppercase tracking-wide">Tickets</h4>
                    {checkoutData.tickets.map((ticket, index) => (
                      <div key={index} className="flex justify-between items-start gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base truncate">{ticket.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Qty: {ticket.quantity}</div>
                          <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">Rs{ticket.price.toFixed(2)} each</div>
                        </div>
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base shrink-0">
                          Rs{(ticket.price * ticket.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-medium">Rs{checkoutData.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="text-gray-900 font-medium">Rs0.00</span>
                    </div>
                    <Separator className="bg-gray-300" />
                    <div className="flex justify-between text-base sm:text-lg lg:text-xl font-bold bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">Rs{totalWithFees.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                      By completing your purchase, you agree to our{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
