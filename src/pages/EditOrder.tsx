import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Edit, 
  Package, 
  DollarSign, 
  Clock,
  ExternalLink,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  quantity: number;
  url: string;
  notes: string;
  total: number;
  status: string;
  services: {
    name: string;
    category: string;
    price_per_1000: number;
    estimated_process_time: string;
  };
}

export default function EditOrder() {
  const { orderId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: 0,
    url: '',
    notes: '',
  });

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (name, category, price_per_1000, estimated_process_time)
        `)
        .eq('id', orderId)
        .eq('user_id', profile?.id) // Ensure user can only edit their own orders
        .single();

      if (error) throw error;
      
      setOrder(data);
      setOrderData({
        quantity: data.quantity,
        url: data.url,
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
      navigate('/wallet');
    } finally {
      setLoading(false);
    }
  };

  const calculateNewTotal = () => {
    if (!order) return 0;
    return (orderData.quantity / 1000) * order.services.price_per_1000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !profile) return;

    // Check if order can be edited
    if (order.status !== 'pending_review') {
      toast({
        title: 'Cannot Edit Order',
        description: 'Only orders with pending review status can be edited.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const newTotal = calculateNewTotal();
      const balanceChange = newTotal - order.total;
      
      // Check if user has sufficient balance for increased total
      if (balanceChange > 0 && profile.balance < balanceChange) {
        toast({
          title: 'Insufficient Balance',
          description: 'Please add funds to your wallet for the increased order amount.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Update order
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          quantity: orderData.quantity,
          url: orderData.url,
          notes: orderData.notes,
          total: newTotal,
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Update user balance if there's a change
      if (balanceChange !== 0) {
        const { error: balanceError } = await supabase
          .from('users')
          .update({ balance: profile.balance - balanceChange })
          .eq('id', profile.id);

        if (balanceError) throw balanceError;
      }

      toast({
        title: 'Order Updated Successfully!',
        description: 'Your order changes have been saved.',
      });
      
      navigate('/wallet');
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Order not found</p>
            <Button onClick={() => navigate('/wallet')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = order.status === 'pending_review';
  const balanceChange = calculateNewTotal() - order.total;

  return (
    <div className="min-h-screen bg-background-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="outline" onClick={() => navigate('/wallet')} className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Wallet
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Edit Order</h1>
            <p className="text-muted-foreground">Modify your existing order details</p>
          </div>

          {!canEdit && (
            <Card className="mb-6 border-warning bg-warning-light">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle size={20} />
                  <p className="font-medium">
                    This order cannot be edited because it's currently {order.status.replace('_', ' ')}.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{order.services.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{order.services.category}</Badge>
                      <Badge variant={
                        order.status === 'pending_review' ? 'outline' :
                        order.status === 'processing' ? 'default' : 'secondary'
                      }>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">${order.services.price_per_1000}/1000</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery</p>
                        <p className="font-semibold">{order.services.estimated_process_time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2">Original Order</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Quantity:</span> {order.quantity.toLocaleString()}</p>
                      <p><span className="text-muted-foreground">Total:</span> ${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit size={20} />
                  {canEdit ? 'Edit Order' : 'Order Details'}
                </CardTitle>
                <CardDescription>
                  Current Balance: <span className="font-semibold text-accent">${profile?.balance?.toFixed(2)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={orderData.quantity}
                      onChange={(e) => setOrderData({ ...orderData, quantity: parseInt(e.target.value) || 1 })}
                      disabled={!canEdit}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="url" className="flex items-center gap-1">
                      Target URL <ExternalLink size={14} />
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      value={orderData.url}
                      onChange={(e) => setOrderData({ ...orderData, url: e.target.value })}
                      disabled={!canEdit}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      value={orderData.notes}
                      onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="p-4 bg-background-subtle rounded-lg border border-border">
                    <h4 className="font-semibold mb-3">Updated Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span>{order.services.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Quantity:</span>
                        <span>{orderData.quantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Total:</span>
                        <span className="text-accent font-semibold">${calculateNewTotal().toFixed(2)}</span>
                      </div>
                      {balanceChange !== 0 && (
                        <div className="flex justify-between border-t border-border pt-2">
                          <span>Balance Change:</span>
                          <span className={balanceChange > 0 ? 'text-destructive' : 'text-success'}>
                            {balanceChange > 0 ? '-' : '+'}${Math.abs(balanceChange).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {canEdit && (
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary" 
                      size="lg"
                      disabled={submitting || (balanceChange > 0 && (!profile || profile.balance < balanceChange))}
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          Updating Order...
                        </div>
                      ) : (
                        'Update Order'
                      )}
                    </Button>
                  )}

                  {canEdit && balanceChange > 0 && (!profile || profile.balance < balanceChange) && (
                    <p className="text-destructive text-sm text-center">
                      Insufficient balance for increased order amount.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}