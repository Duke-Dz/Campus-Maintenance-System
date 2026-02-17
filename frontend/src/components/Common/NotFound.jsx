import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full blur-[120px] opacity-20 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-300'}`}></div>
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Animated Icon */}
        <div className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-8 border backdrop-blur-xl shadow-2xl animate-float ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-white/60'}`}>
          <SearchX size={48} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
        </div>

        <h1 className="text-8xl font-extrabold tracking-tighter mb-4 opacity-20 select-none">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className={`text-lg mb-10 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Oops! The page you are looking for has vanished into the digital void. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-700'}`}
          >
            <ArrowLeft size={18} /> Go Back
          </button>

          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} /> Return Home
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={`absolute bottom-8 text-xs font-medium uppercase tracking-widest opacity-40`}>
        Error Code: 404 • Resource Missing
      </div>
    </div>
  );
};

export default NotFound;