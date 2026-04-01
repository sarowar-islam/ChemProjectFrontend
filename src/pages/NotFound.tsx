import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-accent/15">
          <span className="text-5xl font-bold text-accent">404</span>
        </div>
        <h1 className="mb-4 text-2xl font-bold text-foreground">Page Not Found</h1>
        <p className="mb-6 text-lg text-muted-foreground">Oops! The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-accent/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
