import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Copy, CheckCircle, AlertCircle, MessageCircle, ExternalLink } from "lucide-react";

interface MCBJuiceManualPaymentProps {
  checkoutData: {
    eventId: string;
    tickets: Array<{
      ticketTypeId: string;
      quantity: number;
      price: number;
      name: string;
    }>;
    totalPrice: number;
    totalTickets: number;
  };
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const MCBJuiceManualPayment = ({ 
  checkoutData, 
  customerInfo, 
  onSuccess, 
  onError, 
  disabled = false 
}: MCBJuiceManualPaymentProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string>("");
  const [whatsappMessageSent, setWhatsappMessageSent] = useState(false);

  const serviceFee = 0;
  const totalWithFees = checkoutData.totalPrice;

  // MCB Juice and WhatsApp numbers from event data
  const [mcbJuiceNumber, setMcbJuiceNumber] = useState<string>("");
  const [organizerWhatsApp, setOrganizerWhatsApp] = useState<string>("");
  const [isLoadingEventData, setIsLoadingEventData] = useState(false);

  // Fetch event data to get MCB Juice number
  useEffect(() => {
    const fetchEventData = async () => {
      if (!checkoutData?.eventId) {
        console.log('No eventId found in checkoutData:', checkoutData);
        return;
      }
      
      console.log('Fetching event data for eventId:', checkoutData.eventId);
      
      setIsLoadingEventData(true);
      try {
        const eventId = String(checkoutData.eventId);
        console.log('Making API call with eventId:', eventId);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}`);
        if (response.ok) {
          const eventData = await response.json();
          console.log('Event data received:', eventData);
          console.log('MCB Juice number from event:', eventData.mcbJuiceNumber);
          console.log('Account number from event:', eventData.accountNumber);
          
          const mcbNumber = eventData.mcbJuiceNumber || import.meta.env.VITE_MCB_JUICE_NUMBER || "+230 5XXX XXXX";
          const whatsappNumber = eventData.organizerWhatsApp || "+230 5XXX XXXX";
          
          console.log('Setting MCB Juice number to:', mcbNumber);
          setMcbJuiceNumber(mcbNumber);
          setOrganizerWhatsApp(whatsappNumber);
        } else {
          console.error('Failed to fetch event data, using fallback');
          // Fallback to environment variable
          setMcbJuiceNumber(import.meta.env.VITE_MCB_JUICE_NUMBER || "+230 5XXX XXXX");
          setOrganizerWhatsApp("+230 5XXX XXXX");
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        // Fallback to environment variable
        setMcbJuiceNumber(import.meta.env.VITE_MCB_JUICE_NUMBER || "+230 5XXX XXXX");
        setOrganizerWhatsApp("+230 5XXX XXXX");
      } finally {
        setIsLoadingEventData(false);
      }
    };

    fetchEventData();
  }, [checkoutData.eventId]);

  // Generate unique reference code
  const generateReferenceCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `TCK${timestamp}${random}`;
  };

  const handleShowPaymentDetails = (checked: boolean) => {
    if (checked && !showPaymentDetails) {
      const newReferenceCode = generateReferenceCode();
      setReferenceCode(newReferenceCode);
    }
    setShowPaymentDetails(checked);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    });
  };

  const openWhatsApp = () => {
    const message = `Hi! I've made a payment for event tickets.\n\nPayment Details:\n💰 Amount: Rs ${totalWithFees.toFixed(2)}\n🔖 Reference: ${referenceCode}\n📧 Email: ${customerInfo.email}\n\nPlease verify my payment. Thank you!`;
    const whatsappUrl = `https://wa.me/${organizerWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setWhatsappMessageSent(true);
  };

  const handleSubmit = async () => {
    if (!paymentConfirmed) {
      toast({
        title: "Payment Confirmation Required",
        description: "Please confirm that you have completed the MCB Juice transfer",
        variant: "destructive",
      });
      return;
    }

    if (!whatsappMessageSent) {
      toast({
        title: "WhatsApp Message Required",
        description: "Please send your payment details via WhatsApp first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order data for WhatsApp-based verification
      const orderData = {
        eventId: checkoutData.eventId,
        tickets: checkoutData.tickets,
        customerInfo: customerInfo,
        paymentReference: referenceCode,
        totalAmount: totalWithFees,
        organizerWhatsApp: organizerWhatsApp
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/mcb-juice-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      
      toast({
        title: "Order Created Successfully!",
        description: "Your order is pending WhatsApp verification. You will receive tickets via email and WhatsApp once the organizer verifies your payment.",
      });

      // Clear session storage
      sessionStorage.removeItem('ticketSelection');
      
      onSuccess(result.orderId || result._id);

    } catch (error) {
      console.error('Order creation failed:', error);
      onError(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      {/* Payment Method Selection - Mobile Optimized */}
      <div className="relative w-full">
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-black transition-all duration-200 cursor-pointer"
             onClick={() => handleShowPaymentDetails(!showPaymentDetails)}>
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                showPaymentDetails 
                  ? 'bg-black border-black' 
                  : 'border-gray-300 hover:border-black'
              }`}>
                {showPaymentDetails && (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-black shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-black text-sm sm:text-base lg:text-lg block truncate">MCB Juice Transfer</span>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-tight">
                  Instant mobile payment • No fees
                </p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className={`transform transition-transform duration-200 ${showPaymentDetails ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details - Mobile Optimized */}
      {showPaymentDetails && (
        <div className="animate-in slide-in-from-top-2 duration-300 w-full">
          <Card className="border border-gray-200 shadow-sm bg-white w-full">
            <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8">
              {/* Progress Steps */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Complete Your Payment</h3>
                  <span className="text-xs sm:text-sm text-gray-500">3 simple steps</span>
                </div>
                
                {/* Step 1: Transfer Money */}
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-6 p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base lg:text-lg">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-black mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg">Transfer via MCB Juice</h4>
                      <div className="space-y-3 sm:space-y-4">
                        {/* MCB Juice Number */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-green-50 rounded-lg border-2 border-green-200 gap-2">
                          <span className="text-sm sm:text-base text-green-700 font-medium">Transfer to MCB Juice number:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xl sm:text-2xl text-green-800 break-all">{mcbJuiceNumber}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(mcbJuiceNumber, 'MCB Juice number')}
                              className="p-1 h-auto text-green-600 hover:text-green-800 hover:bg-green-100"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Amount */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border-2 border-gray-200 gap-2">
                          <span className="text-sm sm:text-base text-gray-700 font-medium">Amount to transfer:</span>
                          <span className="font-bold text-xl sm:text-2xl text-black break-all">Rs {totalWithFees.toFixed(2)}</span>
                        </div>
                        
                        <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          Open your MCB Juice app and transfer the exact amount to the number above
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Send WhatsApp Message */}
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-6 p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base lg:text-lg">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-black mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg break-words">Send Payment Confirmation</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          Click the button below to send payment details via WhatsApp
                        </p>
                        
                        <Button
                          onClick={openWhatsApp}
                          disabled={disabled || isProcessing}
                          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg flex items-center justify-center space-x-2 sm:space-x-3 transition-colors duration-200 text-sm sm:text-base min-h-[44px]"
                        >
                          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 shrink-0" />
                          <span className="truncate">Send via WhatsApp</span>
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
                        </Button>
                        
                        {whatsappMessageSent && (
                          <div className="flex items-center space-x-2 sm:space-x-3 text-black bg-gray-100 p-2 sm:p-3 rounded-lg">
                            <CheckCircle className="h-4 h-4 sm:h-5 sm:w-5 shrink-0" />
                            <span className="text-sm sm:text-base font-medium">Message sent successfully!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Confirmation */}
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-6 p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base lg:text-lg">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-black mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg">Confirm Payment</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <Checkbox
                            id="payment-confirmation"
                            checked={paymentConfirmed}
                            onCheckedChange={(checked) => setPaymentConfirmed(checked === true)}
                            disabled={disabled || isProcessing}
                            className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                          />
                          <Label htmlFor="payment-confirmation" className="text-sm sm:text-base text-gray-700 leading-relaxed cursor-pointer">
                            I confirm that I have completed the MCB Juice transfer and sent the payment details via WhatsApp
                          </Label>
                        </div>
                        
                        <Button
                          onClick={handleSubmit}
                          disabled={!paymentConfirmed || disabled || isProcessing}
                          className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base min-h-[44px]"
                        >
                          {isProcessing ? (
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <Loading size="sm" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            'Complete Order'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Enhanced Success Message */}
      {isProcessing && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Payment Submitted!</h3>
                <p className="text-gray-700 mb-4">Your payment is being processed automatically</p>
                
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700 font-medium">Analyzing your receipt...</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-black mb-3">Verification Timeline</h4>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                      <span className="text-gray-700"><strong>WhatsApp sent:</strong> Organizer notified of payment</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-700"><strong>Verification:</strong> Usually within 1-2 hours</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      <span className="text-gray-700"><strong>Tickets delivered:</strong> Via email and WhatsApp</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-800">
                    💡 <strong>Pro tip:</strong> Keep your WhatsApp and email notifications on to receive your tickets quickly!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Footer Summary */}
      <div className="text-center py-3 sm:py-4 border-t border-gray-200 w-full">
        <div className="space-y-1">
          <p className="text-sm font-medium text-black break-all">
            Total: Rs {totalWithFees.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            No processing fees
          </p>
          {referenceCode && (
            <p className="text-xs text-gray-500 font-mono break-all">
              Ref: {referenceCode}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCBJuiceManualPayment;
