import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background-subtle">
      <NavBar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Search className="text-primary-foreground" size={48} />
            </div>
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>What can you do?</CardTitle>
              <CardDescription>Here are some helpful links to get you back on track</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full bg-gradient-primary" size="lg">
                  <Link to="/">
                    <Home size={20} className="mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to="/wallet">
                    <Search size={20} className="mr-2" />
                    Browse Services
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>If you believe this is an error, please contact our support team.</p>
            <p className="mt-2">
              Attempted URL: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
