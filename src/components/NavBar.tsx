import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Wallet, 
  Settings, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export const NavBar = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
  ];

  if (profile?.role === 'admin') {
    navLinks.push({ 
      path: '/admin/control-center', 
      label: 'Admin Panel', 
      icon: Settings 
    });
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SB</span>
            </div>
            <span className="font-bold text-xl text-foreground">Social Boots</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-4 pl-4 border-l border-border">
              {profile && (
                <div className="text-sm text-muted-foreground">
                  Balance: <span className="font-semibold text-accent">${profile.balance.toFixed(2)}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              
              <div className="px-3 py-3 border-t border-border mt-2 pt-4">
                {profile && (
                  <div className="text-sm text-muted-foreground mb-3">
                    Balance: <span className="font-semibold text-accent">${profile.balance.toFixed(2)}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};