import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Wallet as WalletIcon, 
  Plus, 
  History, 
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Package,
  Search
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  price_per_1000: number;
  tag: string;
  category: string;
  description: string;
  estimated_process_time: string;
}

export default function Wallet() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const walletStats = [
    { 
      label: 'Current Balance', 
      value: `$${profile?.balance?.toFixed(2) || '0.00'}`, 
      icon: WalletIcon,
      color: 'text-accent'
    },
    { 
      label: 'Available Services', 
      value: services.length.toString(), 
      icon: Package,
      color: 'text-primary'
    },
    { 
      label: 'Categories', 
      value: categories.length - 1, // Subtract 'All'
      icon: TrendingUp,
      color: 'text-success'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Wallet & Services</h1>
          <p className="text-muted-foreground">Manage your balance and browse available services</p>
        </div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {walletStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-background-subtle flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wallet Management */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Add Funds
              </CardTitle>
              <CardDescription>Top up your wallet balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                  />
                </div>
                <Button className="w-full bg-gradient-primary">
                  <Plus size={16} className="mr-2" />
                  Add Funds
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Secure payment processing
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History size={20} />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center text-muted-foreground py-8">
                  <History size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No recent transactions</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} />
              Available Services
            </CardTitle>
            <CardDescription>Browse and order our premium social media services</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No services found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{service.name}</h3>
                            <Badge variant="outline">{service.category}</Badge>
                            {service.tag && (
                              <Badge variant="secondary" className="text-xs">{service.tag}</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{service.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>💰 ${service.price_per_1000}/1000</span>
                            <span>⏱️ {service.estimated_process_time}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm" className="bg-gradient-primary">
                            Order Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}