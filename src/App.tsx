
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DonationProvider } from "./context/DonationContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext";
import Layout from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import DonateForm from "./pages/DonateForm";
import MyDonations from "./pages/MyDonations";
import BrowseDonations from "./pages/BrowseDonations";
import AcceptedDonations from "./pages/AcceptedDonations";
import DonationDetails from "./pages/DonationDetails";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DonationProvider>
        <NotificationProvider>
          <ChatProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/donate" element={<DonateForm />} />
                    <Route path="/my-donations" element={<MyDonations />} />
                    <Route path="/browse" element={<BrowseDonations />} />
                    <Route path="/accepted" element={<AcceptedDonations />} />
                    <Route path="/donation/:id" element={<DonationDetails />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/chat" element={<ChatPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </TooltipProvider>
          </ChatProvider>
        </NotificationProvider>
      </DonationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
