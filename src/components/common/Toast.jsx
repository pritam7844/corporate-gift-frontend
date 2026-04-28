'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';

const toastTypes = {
  success: {
    icon: <CheckCircle2 size={20} className="text-emerald-500" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-900',
    progress: 'bg-emerald-500'
  },
  error: {
    icon: <AlertCircle size={20} className="text-red-500" />,
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-900',
    progress: 'bg-red-500'
  },
  info: {
    icon: <Info size={20} className="text-blue-500" />,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-900',
    progress: 'bg-blue-500'
  },
  warning: {
    icon: <Bell size={20} className="text-amber-500" />,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-900',
    progress: 'bg-amber-500'
  }
};

export default function Toast({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 4000 
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const timer = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - (100 / (duration / 10))));
      }, 10);

      const closeTimer = setTimeout(() => {
        onClose();
        clearInterval(timer);
      }, duration);

      return () => {
        clearInterval(timer);
        clearTimeout(closeTimer);
      };
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const style = toastTypes[type] || toastTypes.success;

  return (
    <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`relative flex items-center p-4 min-w-[320px] max-w-md ${style.bg} border ${style.border} rounded-2xl shadow-2xl overflow-hidden`}>
        <div className="flex-shrink-0 mr-3">
          {style.icon}
        </div>
        <div className={`flex-1 font-bold text-sm ${style.text}`}>
          {message}
        </div>
        <button 
          onClick={onClose}
          className="ml-4 p-1 rounded-full hover:bg-black/5 transition-colors text-gray-400 hover:text-gray-900"
        >
          <X size={16} />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-black/5 w-full">
          <div 
            className={`h-full ${style.progress} transition-all duration-10 linear`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
