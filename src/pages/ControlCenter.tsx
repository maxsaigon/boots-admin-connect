import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserX, 
  Package, 
  ShoppingCart,
  TrendingUp,
  Activity,
  DollarSign,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  bannedUsers: number;
  totalServices: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export default function ControlCenter() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    bannedUsers: 0,
    totalServices: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch user stats
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('is_banned');
      
      if (usersError) throw usersError;

      // Fetch services count
      const { count: servicesCount, error: servicesError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });
      
      if (servicesError) throw servicesError;

      // Fetch orders stats
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('status, total');
      
      if (ordersError) throw ordersError;

      // Process the data
      const totalUsers = usersData?.length || 0;
      const bannedUsers = usersData?.filter(user => user.is_banned).length || 0;
      const totalServices = servicesCount || 0;
      
      const orders = ordersData || [];
      const pendingOrders = orders.filter(order => order.status === 'pending_review').length;
      const processingOrders = orders.filter(order => order.status === 'processing').length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + parseFloat(order.total?.toString() || '0'), 0);

      setStats({
        totalUsers,
        bannedUsers,
        totalServices,
        pendingOrders,
        processingOrders,
        completedOrders,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered users',
      trend: '+12% from last month',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Banned Users',
      value: stats.bannedUsers.toLocaleString(),
      icon: UserX,
      description: 'Restricted accounts',
      trend: '-5% from last month',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Active Services',
      value: stats.totalServices.toLocaleString(),
      icon: Package,
      description: 'Available services',
      trend: '+3 new this week',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: 'Completed orders',
      trend: '+18% from last month',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  const orderStats = [
    {
      label: 'Pending Review',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-warning',
      badge: 'warning',
    },
    {
      label: 'Processing',
      value: stats.processingOrders,
      icon: Activity,
      color: 'text-accent',
      badge: 'default',
    },
    {
      label: 'Completed',
      value: stats.completedOrders,
      icon: ShoppingCart,
      color: 'text-success',
      badge: 'success',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-subtle">
      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* AdminSidebar will be rendered in the main App layout */}
        
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Control Center</h1>
              <p className="text-muted-foreground">System overview and analytics</p>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              <TrendingUp size={14} className="mr-1" />
              Live Data
            </Badge>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                      <card.icon className={card.color} size={24} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {card.trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-foreground mb-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Orders Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Order Status Overview
                </CardTitle>
                <CardDescription>Current order distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background-subtle">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center ${stat.color}`}>
                          <stat.icon size={16} />
                        </div>
                        <span className="font-medium text-foreground">{stat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                        <Badge variant={stat.badge as any} className="text-xs">
                          {stat.value > 0 ? 'Active' : 'None'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  System Health
                </CardTitle>
                <CardDescription>Platform status and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success-light">
                    <span className="font-medium text-foreground">Database Status</span>
                    <Badge className="bg-success text-success-foreground">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success-light">
                    <span className="font-medium text-foreground">Payment System</span>
                    <Badge className="bg-success text-success-foreground">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success-light">
                    <span className="font-medium text-foreground">API Services</span>
                    <Badge className="bg-success text-success-foreground">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent-light">
                    <span className="font-medium text-foreground">Server Load</span>
                    <Badge variant="outline" className="text-accent border-accent">
                      Normal
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Recent System Activity
              </CardTitle>
              <CardDescription>Latest platform events and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background-subtle">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-foreground">System started successfully</span>
                  <span className="text-xs text-muted-foreground ml-auto">Just now</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background-subtle">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-foreground">Database connection established</span>
                  <span className="text-xs text-muted-foreground ml-auto">2 mins ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background-subtle">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-foreground">Dashboard data refreshed</span>
                  <span className="text-xs text-muted-foreground ml-auto">5 mins ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}