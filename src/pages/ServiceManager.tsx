import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Tag
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  price_per_1000: number;
  tag: string;
  category: string;
  description: string;
  estimated_process_time: string;
  created_at: string;
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price_per_1000: 0,
    tag: '',
    category: '',
    description: '',
    estimated_process_time: '',
  });
  const { toast } = useToast();

  const servicesPerPage = 10;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

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

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('services')
        .insert([formData]);

      if (error) throw error;

      await fetchServices();
      resetForm();
      toast({
        title: 'Success',
        description: 'Service created successfully',
      });
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to create service',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const { error } = await supabase
        .from('services')
        .update(formData)
        .eq('id', editingService.id);

      if (error) throw error;

      await fetchServices();
      resetForm();
      toast({
        title: 'Success',
        description: 'Service updated successfully',
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      await fetchServices();
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price_per_1000: service.price_per_1000,
      tag: service.tag,
      category: service.category,
      description: service.description,
      estimated_process_time: service.estimated_process_time,
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price_per_1000: 0,
      tag: '',
      category: '',
      description: '',
      estimated_process_time: '',
    });
    setEditingService(null);
    setShowCreateForm(false);
  };

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * servicesPerPage,
    currentPage * servicesPerPage
  );

  const serviceStats = [
    { 
      label: 'Total Services', 
      value: services.length, 
      icon: Package,
      color: 'text-primary'
    },
    { 
      label: 'Categories', 
      value: categories.length - 1, // Subtract 'All'
      icon: Tag,
      color: 'text-accent'
    },
    { 
      label: 'Avg. Price', 
      value: `$${(services.reduce((sum, s) => sum + s.price_per_1000, 0) / services.length || 0).toFixed(2)}`, 
      icon: DollarSign,
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
      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Service Management</h1>
              <p className="text-muted-foreground">Manage available services and pricing</p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-gradient-primary">
              <Plus size={16} className="mr-2" />
              Add Service
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {serviceStats.map((stat, index) => (
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

          {/* Create/Edit Service Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingService ? 'Edit Service' : 'Create New Service'}
                </CardTitle>
                <CardDescription>
                  {editingService ? 'Update service details' : 'Add a new service to the platform'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Service Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price per 1000</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price_per_1000}
                        onChange={(e) => setFormData({ ...formData, price_per_1000: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tag">Tag (Optional)</Label>
                      <Input
                        id="tag"
                        value={formData.tag}
                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="process_time">Estimated Process Time</Label>
                      <Input
                        id="process_time"
                        value={formData.estimated_process_time}
                        onChange={(e) => setFormData({ ...formData, estimated_process_time: e.target.value })}
                        placeholder="e.g., 24-48 hours"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-gradient-primary">
                      {editingService ? 'Update Service' : 'Create Service'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Services List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Services List
              </CardTitle>
              <CardDescription>Manage and monitor available services</CardDescription>
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
              <div className="space-y-4">
                {paginatedServices.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{service.name}</h3>
                            <Badge variant="outline">{service.category}</Badge>
                            {service.tag && (
                              <Badge variant="secondary" className="text-xs">{service.tag}</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{service.description}</p>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              ${service.price_per_1000}/1000
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {service.estimated_process_time}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(service)}
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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