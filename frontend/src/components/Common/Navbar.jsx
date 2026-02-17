import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { getRole } from "../../utils/authStorage";
import { LogOut, UserCircle } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const role = getRole();

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  // Helper to make roles look pretty
  const formatRole = (r) => {
    if (!r) return "";
    return r.charAt(0) + r.slice(1).toLowerCase();
  };

  return (
    <nav className="flex items-center gap-4">
      {/* Role Badge */}
      {role && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 border border-white/50 shadow-inner">
          <UserCircle size={16} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
            {formatRole(role)}
          </span>
        </div>
      )}

      {/* Glass Logout Button */}
      <button 
        type="button" 
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
      >
        <span className="hidden sm:inline">Logout</span>
        <LogOut size={18} />
      </button>
    </nav>
  );
}

export default Navbar;