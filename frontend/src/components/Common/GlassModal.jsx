import { X } from "lucide-react";

const GlassModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Overlay with Blur matches Aurora background */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />

      {/* --- SCROLLABLE GLASS CARD --- */}
      <div className="relative w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] animate-fade-in-up">
        
        {/* Header (Fixed) */}
        <div className="flex items-center justify-between p-8 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.1); 
          border-radius: 10px; 
        }
      `}</style>
    </div>
  );
};

export default GlassModal;