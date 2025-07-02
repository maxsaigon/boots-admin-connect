import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, 
  Search, 
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  User,
  Package,
  DollarSign
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  service_id: number;
  quantity: number;
  url: string;
  notes: string;
  total: number;
  status: 'pending_review' | 'processing' | 'completed';
  created_at: string;
  users: {
    email: string;
  };
  services: {
    name: string;
    category: string;
  };
}

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (email),
          services (name, category)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      toast({
        title: 'Success',
        description: 'Order deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return { variant: 'outline' as const, icon: Clock, color: 'text-warning' };
      case 'processing':
        return { variant: 'default' as const, icon: AlertCircle, color: 'text-accent' };
      case 'completed':
        return { variant: 'outline' as const, icon: CheckCircle, color: 'text-success' };
      default:
        return { variant: 'outline' as const, icon: Clock, color: 'text-muted-foreground' };
    }
  };

  const statusOptions = ['All', 'pending_review', 'processing', 'completed'];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.services?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const orderStats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: ShoppingCart,
      color: 'text-primary'
    },
    { 
      label: 'Pending Review', 
      value: orders.filter(o => o.status === 'pending_review').length, 
      icon: Clock,
      color: 'text-warning'
    },
    { 
      label: 'Processing', 
      value: orders.filter(o => o.status === 'processing').length, 
      icon: AlertCircle,
      color: 'text-accent'
    },
    { 
      label: 'Completed', 
      value: orders.filter(o => o.status === 'completed').length, 
      icon: CheckCircle,
      color: 'text-success'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-subtle">
      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
            <p className="text-muted-foreground">Monitor and manage customer orders</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {orderStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <stat.icon className={`${stat.color} opacity-80`} size={24} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={20} />
                Orders List
              </CardTitle>
              <CardDescription>Manage and monitor customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map(status => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status === 'All' ? 'All' : status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Orders Grid */}
              <div className="space-y-4">
                {paginatedOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No orders found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  paginatedOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <Card key={order.id} className="hover:shadow-md transition-all duration-200">
                        <CardContent className="pt-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                                  <StatusIcon size={12} />
                                  {order.status.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <User size={14} className="text-muted-foreground" />
                                    <span className="font-medium">{order.users?.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Package size={14} className="text-muted-foreground" />
                                    <span>{order.services?.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {order.services?.category}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <DollarSign size={14} className="text-muted-foreground" />
                                    <span className="font-semibold">${order.total}</span>
                                    <span className="text-muted-foreground">({order.quantity} qty)</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <ExternalLink size={14} className="text-muted-foreground" />
                                    <a 
                                      href={order.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-accent hover:underline truncate"
                                    >
                                      {order.url}
                                    </a>
                                  </div>
                                  {order.notes && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Notes: </span>
                                      <span>{order.notes}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <div className="flex gap-2">
                                {order.status === 'pending_review' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order.id, 'processing')}
                                    className="flex-1"
                                  >
                                    Start Processing
                                  </Button>
                                )}
                                {order.status === 'processing' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                                    className="flex-1 bg-success hover:bg-success/90"
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                                {order.status === 'completed' && (
                                  <Button size="sm" variant="outline" className="flex-1" disabled>
                                    Completed
                                  </Button>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                {order.status !== 'completed' && (
                                  <>
                                    {order.status === 'processing' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(order.id, 'pending_review')}
                                        className="flex-1"
                                      >
                                        Back to Review
                                      </Button>
                                    )}
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteOrder(order.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}