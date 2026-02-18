import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Navbar } from "./components/Common/Navbar.jsx";
import { ProtectedRoute } from "./components/Common/ProtectedRoute.jsx";
import { useAuth } from "./hooks/useAuth";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LoginPage } from "./pages/LoginPage";
import { MaintenanceDashboard } from "./pages/MaintenanceDashboard";
import { NotFoundPage } from "./pages/NotFoundPage";
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

const HomeRedirect = () => {
  const { isAuthenticated, homePath } = useAuth();
  return <Navigate to={isAuthenticated ? homePath : "/login"} replace />;
};

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-sand dark:bg-slate-950">
    <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
  </div>
);

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
        path="/student"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute roles={[ROLES.MAINTENANCE]}>
            <DashboardLayout>
              <MaintenanceDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Router>
);

export default App;
