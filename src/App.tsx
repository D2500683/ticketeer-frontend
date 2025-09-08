import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/utils/authDebug"; // Load auth debugging utilities
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConfirmEmail from "./pages/ConfirmEmail";
import NotFound from "./pages/NotFound";
import LearnHowItWorks from "./pages/LearnHowItWorks";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import TicketPurchase from "./pages/TicketPurchase";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Analytics from "./pages/Analytics";
import Attendees from "./pages/Attendeess";
import LivePlaylistDashboard from "./pages/LivePlaylistDashboard";
import AdminPanel from "./components/AdminPanel";
import Events from "./pages/dashboard/Events";
import EditEvent from "./pages/dashboard/EditEvent";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<Index />} />
            <Route path="/how-it-works" element={<LearnHowItWorks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="attendees" element={<Attendees />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:id/edit" element={<EditEvent />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="adminpanel" element={<AdminPanel />} />
            </Route>
            <Route path="/create-event" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/event/:id/tickets" element={<TicketPurchase />} />
            <Route path="/event/:eventId/playlist" element={
              <ProtectedRoute>
                <LivePlaylistDashboard />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
