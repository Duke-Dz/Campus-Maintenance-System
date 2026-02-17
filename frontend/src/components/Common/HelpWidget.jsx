import { useState } from "react";
import { HelpCircle, X, MessageCircle, FileText, Mail } from "lucide-react";

const HelpWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      
      {/* Popover Content */}
      <div 
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 w-64 transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
      >
        <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">Need Assistance?</h3>
        <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors text-left group">
                <MessageCircle size={16} className="text-blue-500 group-hover:scale-110 transition-transform" /> Live Chat (Offline)
            </button>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors text-left group">
                <FileText size={16} className="text-purple-500 group-hover:scale-110 transition-transform" /> View FAQ
            </button>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors text-left group">
                <Mail size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" /> support@campusfix.com
            </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Get Help"
      >
        {isOpen ? <X size={20} /> : <HelpCircle size={24} />}
      </button>
    </div>
  );
};

export default HelpWidget;