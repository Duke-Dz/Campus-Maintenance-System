import { Modal } from "./Modal";

export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmText = "Confirm" }) => (
  <Modal open={open} title={title} onClose={onCancel} width="max-w-md">
    <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-xl bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
      >
        {confirmText}
      </button>
    </div>
  </Modal>
);
