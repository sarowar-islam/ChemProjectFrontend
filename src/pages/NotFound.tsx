import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBF8]">
      <div className="text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#DBEAFE]">
          <span className="text-5xl font-bold text-[#3B82F6]">404</span>
        </div>
        <h1 className="mb-4 text-2xl font-bold text-[#1E40AF]">Page Not Found</h1>
        <p className="mb-6 text-lg text-[#475569]">Oops! The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 font-medium text-white transition-colors hover:bg-[#2563EB]">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
