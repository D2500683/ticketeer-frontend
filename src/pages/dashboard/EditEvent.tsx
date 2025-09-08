import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  MapPin, 
  DollarSign,
  Users,
  Settings,
  CreditCard,
  Phone,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/config/api";

// API functions
const fetchEvent = async (id: string) => {
  const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(id));
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
};

const updateEvent = async (id: string, eventData: any) => {
  const response = await fetch(API_CONFIG.ENDPOINTS.EVENTS.UPDATE(id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(eventData)
  });
  if (!response.ok) {
    throw new Error('Failed to update event');
  }
  return response.json();
};

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    shortSummary: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    venueName: '',
    status: 'draft',
    showOnExplore: true,
    passwordProtected: false,
    eventPassword: '',
    mcbJuiceNumber: '',
    organizerWhatsApp: '',
    accountNumber: '',
    ticketTypes: [{
      name: 'Default Ticket',
      price: 10,
      quantity: 100,
      description: ''
    }]
  });

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateEvent(id!, data),
    onSuccess: () => {
      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update event. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        shortSummary: event.shortSummary || '',
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        location: event.location || '',
        venueName: event.venueName || '',
        status: event.status || 'draft',
        showOnExplore: event.showOnExplore ?? true,
        passwordProtected: event.passwordProtected || false,
        eventPassword: event.eventPassword || '',
        mcbJuiceNumber: event.mcbJuiceNumber || '',
        organizerWhatsApp: event.organizerWhatsApp || '',
        accountNumber: event.accountNumber || '',
        ticketTypes: event.ticketTypes || [{
          name: 'Default Ticket',
          price: 10,
          quantity: 100,
          description: ''
        }]
      });
    }
  }, [event]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTicketChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Event not found or you don't have permission to edit it.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/events')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(formData.status)}>
              {formData.status}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Last updated: {new Date(event.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortSummary">Short Summary</Label>
              <Input
                id="shortSummary"
                value={formData.shortSummary}
                onChange={(e) => handleInputChange('shortSummary', e.target.value)}
                placeholder="Brief description for event cards"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                placeholder="Detailed event description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name</Label>
                <Input
                  id="venueName"
                  value={formData.venueName}
                  onChange={(e) => handleInputChange('venueName', e.target.value)}
                  placeholder="Specific venue or address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ticket Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.ticketTypes.map((ticket, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Ticket Name</Label>
                    <Input
                      value={ticket.name}
                      onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (RS)</Label>
                    <Input
                      type="number"
                      value={ticket.price}
                      onChange={(e) => handleTicketChange(index, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={ticket.quantity}
                      onChange={(e) => handleTicketChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={ticket.description}
                    onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                    placeholder="Optional ticket description"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>
              Configure payment methods for your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mcbJuiceNumber" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  MCB Juice Number *
                </Label>
                <Input
                  id="mcbJuiceNumber"
                  value={formData.mcbJuiceNumber}
                  onChange={(e) => handleInputChange('mcbJuiceNumber', e.target.value)}
                  placeholder="+230 5XXX XXXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerWhatsApp" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp Number
                </Label>
                <Input
                  id="organizerWhatsApp"
                  value={formData.organizerWhatsApp}
                  onChange={(e) => handleInputChange('organizerWhatsApp', e.target.value)}
                  placeholder="+230 5XXX XXXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Bank Account Number
              </Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="1234567890123456"
              />
              <p className="text-sm text-muted-foreground">
                Bank account number for direct transfers (10-20 digits)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Event Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Event Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show on Explore Page</Label>
                <p className="text-sm text-muted-foreground">
                  Allow this event to be discovered by other users
                </p>
              </div>
              <Switch
                checked={formData.showOnExplore}
                onCheckedChange={(checked) => handleInputChange('showOnExplore', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Protected</Label>
                <p className="text-sm text-muted-foreground">
                  Require a password to view event details
                </p>
              </div>
              <Switch
                checked={formData.passwordProtected}
                onCheckedChange={(checked) => handleInputChange('passwordProtected', checked)}
              />
            </div>

            {formData.passwordProtected && (
              <div className="space-y-2">
                <Label htmlFor="eventPassword">Event Password</Label>
                <Input
                  id="eventPassword"
                  type="password"
                  value={formData.eventPassword}
                  onChange={(e) => handleInputChange('eventPassword', e.target.value)}
                  placeholder="Enter event password"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/dashboard/events')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
