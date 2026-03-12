import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

// =============================================
// CONFIRM DIALOG - reusable delete confirmation
// =============================================
export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = "حذف", danger = true }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className={`flex flex-col items-center px-6 pt-8 pb-6 gap-4`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle size={28} className={danger ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 ${
                danger ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// FORM MODAL - reusable modal shell
// =============================================
export function FormModal({ isOpen, title, icon, onClose, onSave, saveLabel = "حفظ", children, saving = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="font-bold text-gray-800 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl font-bold text-sm bg-violet-600 hover:bg-violet-700 text-white transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? '...جاري الحفظ' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// FIELD - reusable labeled input
// =============================================
export function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-violet-400 focus:bg-white placeholder-gray-400";
export const selectCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-violet-400 focus:bg-white";
