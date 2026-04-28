'use client';

import { X, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

const icons = {
    danger: <AlertTriangle className="text-red-500" size={24} />,
    success: <CheckCircle style={{ color: 'var(--color-success)' }} size={24} />,
    info: <Info size={24} style={{ color: 'var(--color-text)' }} />,
    warning: <HelpCircle size={24} style={{ color: 'var(--color-accent)' }} />,
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

    const getConfirmStyle = () => {
        if (type === 'danger') return { backgroundColor: '#DC2626', color: '#ffffff' };
        if (type === 'success') return { backgroundColor: 'var(--color-success)', color: '#ffffff' };
        // warning and info → yellow accent
        return { backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' };
    };

    const getIconBg = () => {
        if (type === 'danger') return { backgroundColor: '#fee2e2', border: '1px solid #fecaca' };
        if (type === 'success') return { backgroundColor: '#d1fae5', border: '1px solid #a7f3d0' };
        return { backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' };
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="relative rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
                <div className="p-8">
                    <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl" style={getIconBg()}>
                            {icons[type] || icons.warning}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>{title}</h3>
                        <p className="mt-3 font-medium leading-relaxed text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {message}
                        </p>
                    </div>

                    <div className="mt-8 flex items-center space-x-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 font-bold rounded-2xl transition-all active:scale-95 text-sm border"
                            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 px-6 py-3 font-black rounded-2xl transition-all active:scale-95 text-sm"
                            style={getConfirmStyle()}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
