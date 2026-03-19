import { Suspense, lazy } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/Common/ProtectedRoute.jsx";
import { useAuth } from "./hooks/useAuth";
import { ROLES } from "./utils/constants";

const DashboardShell = lazy(() => import("./components/Dashboard/DashboardShell.jsx").then((module) => ({ default: module.DashboardShell })));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx").then((module) => ({ default: module.LandingPage })));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx").then((module) => ({ default: module.AboutPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage.jsx").then((module) => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/TermsPage.jsx").then((module) => ({ default: module.TermsPage })));
const ContactSupportPage = lazy(() => import("./pages/ContactSupportPage.jsx").then((module) => ({ default: module.ContactSupportPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx").then((module) => ({ default: module.RegisterPage })));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard.jsx").then((module) => ({ default: module.StudentDashboard })));
const MaintenanceDashboard = lazy(() => import("./pages/MaintenanceDashboard.jsx").then((module) => ({ default: module.MaintenanceDashboard })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx").then((module) => ({ default: module.AdminDashboard })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx").then((module) => ({ default: module.NotFoundPage })));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx").then((module) => ({ default: module.LoginPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx").then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx").then((module) => ({ default: module.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage.jsx").then((module) => ({ default: module.VerifyEmailPage })));
const AcceptStaffInvitePage = lazy(() => import("./pages/AcceptInvitePage.jsx").then((module) => ({ default: module.AcceptInvitePage })));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center px-6 text-center">
    <div className="rounded-2xl border border-gray-200/70 bg-white/85 px-6 py-5 shadow-lg backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/85">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Loading page</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Preparing the next screen.</p>
    </div>
  </div>
);

const withSuspense = (node) => (
  <Suspense fallback={<RouteFallback />}>
    {node}
  </Suspense>
);

const PublicRoute = ({ children }) => {
  const { isAuthenticated, homePath, initializing } = useAuth();
  if (initializing) {
    return <RouteFallback />;
  }
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
            {withSuspense(<LoginPage />)}
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            {withSuspense(<RegisterPage />)}
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            {withSuspense(<ForgotPasswordPage />)}
          </PublicRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <PublicRoute>
            {withSuspense(<VerifyEmailPage />)}
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            {withSuspense(<ResetPasswordPage />)}
          </PublicRoute>
        }
      />
      <Route
        path="/accept-invite"
        element={
          <PublicRoute>
            {withSuspense(<AcceptStaffInvitePage />)}
          </PublicRoute>
        }
      />
      <Route path="/contact-support" element={withSuspense(<ContactSupportPage />)} />
      <Route path="/about-us" element={withSuspense(<AboutPage />)} />
      <Route path="/privacy-policy" element={withSuspense(<PrivacyPage />)} />
      <Route path="/terms-and-conditions" element={withSuspense(<TermsPage />)} />
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            {withSuspense(
              <DashboardShell>
                <StudentDashboard />
              </DashboardShell>
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute roles={[ROLES.MAINTENANCE]}>
            {withSuspense(
              <DashboardShell>
                <MaintenanceDashboard />
              </DashboardShell>
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            {withSuspense(
              <DashboardShell>
                <AdminDashboard />
              </DashboardShell>
            )}
          </ProtectedRoute>
        }
      />
      <Route path="/" element={withSuspense(<LandingPage />)} />
      <Route path="*" element={withSuspense(<NotFoundPage />)} />
    </Routes>
  </Router>
);

export default App;
