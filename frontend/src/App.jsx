import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/Common/ProtectedRoute.jsx";
import { DashboardShell } from "./components/Dashboard/DashboardShell.jsx";
import { useAuth } from "./hooks/useAuth";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from "./pages/LoginPage";
import { MaintenanceDashboard } from "./pages/MaintenanceDashboard";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ContactSupportPage } from "./pages/ContactSupportPage";
import { RegisterPage } from "./pages/RegisterPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { ROLES } from "./utils/constants";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, homePath } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={homePath} replace />;
  }
  return children;
};

const App = () => (
  <Router>
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route path="/contact-support" element={<ContactSupportPage />} />
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <DashboardShell>
              <StudentDashboard />
            </DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute roles={[ROLES.MAINTENANCE]}>
            <DashboardShell>
              <MaintenanceDashboard />
            </DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell>
              <AdminDashboard />
            </DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Router>
);

export default App;
