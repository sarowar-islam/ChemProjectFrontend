import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import PublicationsPage from "./pages/PublicationsPage";
import TeamPage from "./pages/TeamPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import AlumniPage from "./pages/AlumniPage";
import AlumniDetailsPage from "./pages/AlumniDetailsPage";
import NewsPage from "./pages/NewsPage";
import NoticesPage from "./pages/NoticesPage";
import NotFound from "./pages/NotFound";

// Detail Pages
import NewsDetailPage from "./pages/NewsDetailPage";
import NoticeDetailPage from "./pages/NoticeDetailPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import PublicationDetailPage from "./pages/PublicationDetailPage";
import ResearchFocusDetailPage from "./pages/ResearchFocusDetailPage";

// Auth Pages
import AdminLoginPage from "./pages/AdminLoginPage";
import TeamLoginPage from "./pages/TeamLoginPage";

// Protected Pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminNewsEditPage from "./pages/AdminNewsEditPage";
import AdminProjectEditPage from "./pages/AdminProjectEditPage";
import MemberDashboardPage from "./pages/MemberDashboardPage";
import AlumniDashboardPage from "./pages/AlumniDashboardPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                <Route path="/publications" element={<PublicationsPage />} />
                <Route path="/publications/:slug" element={<PublicationDetailPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/team/:username" element={<MemberProfilePage />} />
                <Route path="/alumni" element={<AlumniPage />} />
                <Route path="/alumni/:slug" element={<AlumniDetailsPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsDetailPage />} />
                <Route path="/research-focus/:id" element={<ResearchFocusDetailPage />} />
                <Route path="/notices" element={<NoticesPage />} />
                <Route path="/notices/:slug" element={<NoticeDetailPage />} />
              </Route>

              {/* Hidden Login Routes (no links, direct URL only) */}
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route path="/teamlogin" element={<TeamLoginPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news/new"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminNewsEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news/edit/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminNewsEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/projects/new"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProjectEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/projects/edit/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProjectEditPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Member Routes */}
              <Route
                path="/member/dashboard"
                element={
                  <ProtectedRoute requiredRole="member">
                    <MemberDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Alumni Routes */}
              <Route
                path="/alumni/dashboard"
                element={
                  <ProtectedRoute requiredRole="member">
                    <AlumniDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
