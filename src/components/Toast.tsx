import React from 'react';

export interface ToastData {
  title: string;
  message: string;
  icon?: string;
  visible: boolean;
}

interface ToastProps {
  toast: ToastData;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  return (
    <div
      className={`fixed top-20 inset-x-4 max-w-sm mx-auto z-50 transform transition-all duration-300 flex items-center gap-3 p-3.5 rounded-2xl bg-[#372b46] text-[#f8edff] shadow-2xl border border-[#7b2cbf]/30 ${
        toast.visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-12 opacity-0 pointer-events-none'
      }`}
    >
      <span className="material-symbols-outlined text-[24px] text-[#f1dbff] shrink-0">
        {toast.icon || 'check_circle'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-white truncate">{toast.title}</p>
        <p className="text-[12px] text-[#f8edff]/80 truncate leading-snug">
          {toast.message}
        </p>
      </div>
    </div>
  );
};
