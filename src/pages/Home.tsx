import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Star,
  ArrowRight,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

export default function Home() {
  const { profile } = useAuth();

  const features = [
    {
      icon: TrendingUp,
      title: 'Social Media Growth',
      description: 'Boost your social media presence with our premium services',
      color: 'text-success'
    },
    {
      icon: Users,
      title: 'Real Engagement',
      description: 'Get authentic followers and engagement from real users',
      color: 'text-accent'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Quick delivery times to see results within hours',
      color: 'text-warning'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All services are compliant and account-safe',
      color: 'text-primary'
    }
  ];

  const quickStats = [
    { label: 'Services Available', value: '250+', icon: ShoppingCart },
    { label: 'Orders Completed', value: '50K+', icon: Star },
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Avg. Delivery', value: '2 Hours', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              Welcome back, {profile?.email?.split('@')[0]}!
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Social Media
              <span className="block bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent">
                Success Starts Here
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/80 max-w-2xl mx-auto">
              Boost your social media presence with our premium services. 
              Fast, reliable, and results-driven solutions for all platforms.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
              >
                <Link to="/wallet">
                  View Services
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/wallet">
                  Manage Wallet
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {quickStats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center">
                    <stat.icon className="text-accent" size={24} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Account Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
                  <Users className="text-success" size={18} />
                </div>
                Account Status
              </CardTitle>
              <CardDescription>Your account information and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Type</span>
                  <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                    {profile?.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-success border-success">
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="font-semibold text-accent text-lg">
                    ${profile?.balance?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-accent" size={18} />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/wallet">
                    <TrendingUp size={16} className="mr-2" />
                    Browse Services
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/wallet">
                    <Users size={16} className="mr-2" />
                    Manage Wallet
                  </Link>
                </Button>
                {profile?.role === 'admin' && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/control-center">
                      <Star size={16} className="mr-2" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Social Boots?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the most reliable and effective social media growth solutions 
              to help you achieve your goals faster.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-200 group">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 bg-background-subtle rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <feature.icon className={`${feature.color}`} size={28} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-primary text-primary-foreground text-center shadow-lg">
          <CardContent className="py-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
              Explore our services and start growing your social media presence today.
            </p>
            <Button 
              asChild 
              variant="secondary" 
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/wallet">
                Browse Services
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}