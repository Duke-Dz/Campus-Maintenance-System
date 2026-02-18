import { useState } from "react";
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2, Send, Moon, Sun, KeyRound, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { authService } from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("request");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await authService.requestPasswordReset(email);
      setStep("verify");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await authService.resetPassword({ email, code, newPassword });
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col items-center justify-center p-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/30 filter blur-[120px] animate-aurora-2"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/30 filter blur-[120px] animate-aurora-1"></div>
      </div>

      <button onClick={toggleTheme} className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md border shadow-lg transition-all z-50 ${isDarkMode ? 'bg-white/10 border-white/20 text-yellow-400' : 'bg-white/60 border-white/50 text-slate-600'}`}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="relative z-10 w-full max-w-md mt-auto">
        <div className={`backdrop-blur-xl border shadow-2xl rounded-[2.5rem] p-10 transition-colors duration-500 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/60'}`}>
          {step === "request" && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 border border-blue-100 shadow-sm"><ShieldCheck size={32} /></div>
                <h1 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recovery</h1>
                <p className={`mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter your email to receive a reset code</p>
              </div>
              <form onSubmit={handleResetRequest} className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border focus:ring-[3px] focus:ring-blue-500/30 focus:border-blue-600 transition-all font-medium outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-slate-900 placeholder-slate-400'}`} />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button disabled={loading} type="submit" className="group w-full py-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold text-base shadow-lg disabled:opacity-70">
                  <span className="relative flex items-center justify-center gap-2">{loading ? "Sending..." : "Send Reset Code"} <Send size={18} /></span>
                </button>
              </form>
            </>
          )}

          {step === "verify" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Verify Code</h2>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter the 6-digit code sent to <span className="text-blue-600">{email}</span>.</p>
              <div className="relative"><KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={code} onChange={(e)=>setCode(e.target.value)} required maxLength={6} placeholder="6-digit code" className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`} /></div>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required placeholder="New password" className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'}`} /></div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button disabled={loading} type="submit" className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold disabled:opacity-70">{loading ? "Resetting..." : "Reset Password"}</button>
            </form>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-100"><CheckCircle2 size={48} /></div>
              <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Password Updated</h2>
              <p className={`mb-8 leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>You can now sign in with your new password.</p>
            </div>
          )}

          <div className={`text-center mt-8 pt-6 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"><ArrowLeft size={16} /> Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
