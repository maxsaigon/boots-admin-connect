import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export const AdminSidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const adminLinks = [
    { 
      path: '/admin/control-center', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'System overview and statistics'
    },
    { 
      path: '/admin/user-management', 
      label: 'Users', 
      icon: Users,
      description: 'Manage user accounts'
    },
    { 
      path: '/admin/service-management', 
      label: 'Services', 
      icon: Package,
      description: 'Manage available services'
    },
    { 
      path: '/admin/order-management', 
      label: 'Orders', 
      icon: ShoppingCart,
      description: 'Monitor and manage orders'
    },
  ];

  const sidebarContent = (
    <div className="space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">System Management</p>
      </div>
      
      {adminLinks.map(({ path, label, icon: Icon, description }) => (
        <Link
          key={path}
          to={path}
          className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 group ${
            isActive(path)
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          onClick={() => setIsMobileOpen(false)}
        >
          <Icon size={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">{label}</div>
            <div className={`text-xs mt-0.5 ${
              isActive(path) 
                ? 'text-primary-foreground/80' 
                : 'text-muted-foreground group-hover:text-foreground/80'
            }`}>
              {description}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden bg-card border-b border-border p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full justify-start"
        >
          {isMobileOpen ? <X size={16} /> : <Menu size={16} />}
          <span className="ml-2">Admin Menu</span>
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 bg-card border-r border-border p-6 overflow-y-auto">
        {sidebarContent}
      </div>
    </>
  );
};