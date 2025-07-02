import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthHandler } from "./components/AuthHandler";
import { NavBar } from "./components/NavBar";
import { AdminSidebar } from "./components/AdminSidebar";

// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Wallet from "./pages/Wallet";
import OrderService from "./pages/OrderService";
import EditOrder from "./pages/EditOrder";
import ControlCenter from "./pages/ControlCenter";
import UserManagement from "./pages/UserManagement";
import ServiceManager from "./pages/ServiceManager";
import OrderManager from "./pages/OrderManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen w-full">
            <Routes>
              {/* Auth route - standalone */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes with NavBar */}
              <Route path="/" element={
                <AuthHandler>
                  <div className="flex flex-col min-h-screen">
                    <NavBar />
                    <div className="flex-grow">
                      <Home />
                    </div>
                  </div>
                </AuthHandler>
              } />
              
              <Route path="/wallet" element={
                <AuthHandler>
                  <div className="flex flex-col min-h-screen">
                    <NavBar />
                    <div className="flex-grow">
                      <Wallet />
                    </div>
                  </div>
                </AuthHandler>
              } />
              
              <Route path="/order/:serviceId" element={
                <AuthHandler>
                  <div className="flex flex-col min-h-screen">
                    <NavBar />
                    <div className="flex-grow">
                      <OrderService />
                    </div>
                  </div>
                </AuthHandler>
              } />
              
              <Route path="/order/edit/:orderId" element={
                <AuthHandler>
                  <div className="flex flex-col min-h-screen">
                    <NavBar />
                    <div className="flex-grow">
                      <EditOrder />
                    </div>
                  </div>
                </AuthHandler>
              } />
              
              {/* Admin routes with AdminSidebar */}
              <Route path="/admin/control-center" element={
                <AuthHandler>
                  <div className="flex min-h-screen w-full">
                    <AdminSidebar />
                    <div className="flex-1">
                      <ControlCenter />
                    </div>
                  </div>
                </AuthHandler>
              } />
              
              <Route path="/admin/user-management" element={
                <AuthHandler>
                  <div className="flex min-h-screen w-full">
                    <AdminSidebar />
                    <div className="flex-1">
                      <UserManagement />
                    </div>
                  </div>
                </AuthHandler>
              } />
              
              <Route path="/admin/service-management" element={
                <AuthHandler>
                  <div className="flex min-h-screen w-full">
                    <AdminSidebar />
                    <div className="flex-1">
                      <ServiceManager />
                    </div>
                  </div>
                </AuthHandler>
              } />
              
              <Route path="/admin/order-management" element={
                <AuthHandler>
                  <div className="flex min-h-screen w-full">
                    <AdminSidebar />
                    <div className="flex-1">
                      <OrderManager />
                    </div>
                  </div>
                </AuthHandler>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
