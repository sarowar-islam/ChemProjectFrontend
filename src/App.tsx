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
import NewsPage from "./pages/NewsPage";
import NoticesPage from "./pages/NoticesPage";
import NotFound from "./pages/NotFound";

// Detail Pages
import NewsDetailPage from "./pages/NewsDetailPage";
import NoticeDetailPage from "./pages/NoticeDetailPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import PublicationDetailPage from "./pages/PublicationDetailPage";

// Auth Pages
import AdminLoginPage from "./pages/AdminLoginPage";
import TeamLoginPage from "./pages/TeamLoginPage";

// Protected Pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminNewsEditPage from "./pages/AdminNewsEditPage";
import AdminProjectEditPage from "./pages/AdminProjectEditPage";
import MemberDashboardPage from "./pages/MemberDashboardPage";

const queryClient = new QueryClient();

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
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsDetailPage />} />
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
