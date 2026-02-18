import { X } from "lucide-react";

export const Modal = ({ open, title, onClose, children, width = "max-w-3xl" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8">
      <div className={`w-full ${width} animate-soft-rise rounded-3xl bg-white p-6 shadow-panel dark:bg-slate-900`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink dark:text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
