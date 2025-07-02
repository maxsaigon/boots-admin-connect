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
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Clock,
  ExternalLink,
  ArrowLeft
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

export default function OrderService() {
  const { serviceId } = useParams();
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: 1000,
    url: '',
    notes: '',
  });

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service details',
        variant: 'destructive',
      });
      navigate('/wallet');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!service) return 0;
    return (orderData.quantity / 1000) * service.price_per_1000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !profile) return;

    const total = calculateTotal();
    
    if (profile.balance < total) {
      toast({
        title: 'Insufficient Balance',
        description: 'Please add funds to your wallet before placing this order.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id,
          service_id: service.id,
          quantity: orderData.quantity,
          url: orderData.url,
          notes: orderData.notes,
          total: total,
          status: 'pending_review',
        });

      if (orderError) throw orderError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: profile.balance - total })
        .eq('id', profile.id);

      if (balanceError) throw balanceError;

      await refreshProfile();
      
      toast({
        title: 'Order Placed Successfully!',
        description: 'Your order has been submitted for review.',
      });
      
      navigate('/wallet');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
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
          <p className="text-muted-foreground">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Service not found</p>
            <Button onClick={() => navigate('/wallet')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="outline" onClick={() => navigate('/wallet')} className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Services
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Place Order</h1>
            <p className="text-muted-foreground">Configure and submit your service order</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{service.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{service.category}</Badge>
                      {service.tag && (
                        <Badge variant="secondary" className="text-xs">{service.tag}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">${service.price_per_1000}/1000</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery</p>
                        <p className="font-semibold">{service.estimated_process_time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Order Configuration
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
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum order: 1 unit
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="url" className="flex items-center gap-1">
                      Target URL <ExternalLink size={14} />
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/your-content"
                      value={orderData.url}
                      onChange={(e) => setOrderData({ ...orderData, url: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The URL where the service will be applied
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      placeholder="Any special instructions or requirements..."
                      value={orderData.notes}
                      onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="p-4 bg-background-subtle rounded-lg border border-border">
                    <h4 className="font-semibold mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span>{service.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{orderData.quantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unit Price:</span>
                        <span>${service.price_per_1000}/1000</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-base">
                          <span>Total:</span>
                          <span className="text-accent">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary" 
                    size="lg"
                    disabled={submitting || !profile || profile.balance < calculateTotal()}
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        Placing Order...
                      </div>
                    ) : (
                      `Place Order - $${calculateTotal().toFixed(2)}`
                    )}
                  </Button>

                  {profile && profile.balance < calculateTotal() && (
                    <p className="text-destructive text-sm text-center">
                      Insufficient balance. Please add funds to your wallet.
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