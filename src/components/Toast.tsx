import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      id="app-toast"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] px-5 py-2.5 rounded-xl bg-black/85 backdrop-blur-md text-white text-sm font-medium shadow-2xl border border-white/10 pointer-events-none transition-all animate-fade-in"
    >
      {message}
    </div>
  );
};
