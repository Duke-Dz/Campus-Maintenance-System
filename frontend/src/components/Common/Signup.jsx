import { useState } from "react";
import { authService } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Building2, ArrowRight, AlertCircle, ShieldCheck, Sun, Moon } from "lucide-react";
import GlassModal from "./GlassModal";
import HelpWidget from "./HelpWidget";
import { useTheme } from "../../context/ThemeContext"; // Import Context

const Signup = () => {
  const navigate = useNavigate();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme(); // Use Shared Theme

  const [formData, setFormData] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "", role: "STUDENT", acceptTerms: false });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(""); setPasswordError(""); setGeneralError("");
    if (!validateEmail(formData.email)) return setEmailError("Invalid email address");
    if (formData.password !== formData.confirmPassword) return setPasswordError("Passwords do not match");
    if (!formData.acceptTerms) return alert("Please accept Terms");

    try {
      setLoading(true);
      await authService.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate("/dashboard");
    } catch (err) {
      setGeneralError(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `w-full pl-12 pr-4 py-3.5 rounded-2xl border focus:ring-[3px] focus:ring-blue-500/30 focus:border-blue-600 transition-all font-medium outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-slate-900 placeholder-slate-400'}`;

  return (
    <div className={`min-h-screen relative flex flex-col items-center justify-center p-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Background Engine */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/30 filter blur-[120px] animate-aurora-1"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 filter blur-[120px] animate-aurora-2"></div>
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
          </>
        )}
      </div>

      <button onClick={toggleTheme} className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md border shadow-lg transition-all z-50 ${isDarkMode ? 'bg-white/10 border-white/20 text-yellow-400' : 'bg-white/60 border-white/50 text-slate-600'}`}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="relative z-10 w-full max-w-md mt-auto">
        <div className={`backdrop-blur-xl border shadow-2xl rounded-[2.5rem] p-8 sm:p-10 transition-colors duration-500 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/60'}`}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create Account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {emailError && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2"><AlertCircle size={14} />{emailError}</div>}
            {passwordError && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2"><AlertCircle size={14} />{passwordError}</div>}
            {generalError && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2"><AlertCircle size={14} />{generalError}</div>}

            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Full Name" required className={inputClasses} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Username" required className={inputClasses} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Email Address" required className={inputClasses} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="relative group">
              <select
                value={formData.role}
                className={`w-full pl-4 pr-4 py-3.5 rounded-2xl border focus:ring-[3px] focus:ring-blue-500/30 focus:border-blue-600 transition-all font-medium outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option className="text-slate-900" value="STUDENT">Student</option>
                <option className="text-slate-900" value="MAINTENANCE">Maintenance Crew</option>
              </select>
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" placeholder="Password" required className={inputClasses} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" placeholder="Confirm Password" required className={inputClasses} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>

            <div className="flex items-start gap-3 px-1">
              <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600" onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})} />
              <label className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                I agree to the <button type="button" onClick={() => setIsTermsOpen(true)} className="text-blue-600 font-bold hover:underline">Terms of Service</button>
              </label>
            </div>

            <button disabled={loading} type="submit" className="group w-full py-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-base shadow-lg transition-all duration-300 relative overflow-hidden disabled:opacity-70">
              <span className="relative flex items-center justify-center gap-2">{loading ? "Creating..." : "Create Account"} <ArrowRight size={18} /></span>
            </button>
          </form>

          <p className={`text-center mt-8 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-auto py-8">
        <div className={`backdrop-blur-md border shadow-sm rounded-full px-5 py-2 transition-transform hover:scale-105 cursor-default mx-auto w-max ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/50'}`}>
            <p className={`text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>© {new Date().getFullYear()}</span><span className="opacity-50">•</span><span className="text-blue-600">CAMPUSFIX SYSTEMS</span>
            </p>
        </div>
      </div>

      <GlassModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Terms of Service">
        <div className="space-y-4 text-sm text-slate-300">
           <p>1. Acceptance...</p>
        </div>
      </GlassModal>

      <HelpWidget />
    </div>
  );
};
export default Signup;