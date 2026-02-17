import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../../utils/authStorage";
import MainLayout from "./MainLayout";
import AdminDashboard from "../AdminDashboard/AdminDashboard";
import MaintenanceDashboard from "../MaintenanceDashboard/MaintenanceDashboard";
import StudentDashboard from "../StudentPortal/StudentDashboard";

function ProtectedRoute() {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const renderDashboard = () => {
    if (role === "ADMIN") return <AdminDashboard />;
    if (role === "MAINTENANCE") return <MaintenanceDashboard />;
    if (role === "STUDENT") return <StudentDashboard />;
    return null;
  };

  return <MainLayout>{renderDashboard()}</MainLayout>;
}

export default ProtectedRoute;
