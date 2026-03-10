'use client';

import { X, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

const icons = {
    danger: <AlertTriangle className="text-red-500" size={24} />,
    success: <CheckCircle className="text-green-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />,
    warning: <HelpCircle className="text-yellow-500" size={24} />,
};

const variants = {
    danger: {
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'text-red-900',
        button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    success: {
        bg: 'bg-green-50',
        border: 'border-green-100',
        text: 'text-green-900',
        button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-900',
        button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-100',
        text: 'text-yellow-900',
        button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    },
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
}) {
    if (!isOpen) return null;

    const variant = variants[type] || variants.warning;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-2xl ${variant.bg} ${variant.border} border`}>
                            {icons[type] || icons.warning}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-6">
                        <h3 className={`text-xl font-black ${variant.text}`}>{title}</h3>
                        <p className="mt-3 text-gray-500 font-medium leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="mt-8 flex items-center space-x-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-6 py-3 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${variant.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
