import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: Size;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const sizeClasses: Record<Size, string> = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
};

export default function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
    footer,
}: Props) {
    const backdropRef = useRef<HTMLDivElement>(null);

    // ESC للإغلاق + قفل scroll
    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brown-dark/50 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => {
                if (e.target === backdropRef.current) onClose();
            }}
            role="presentation"
        >
            <div
                className={`
                    relative w-full ${sizeClasses[size]} bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl
                    max-h-[90vh] flex flex-col overflow-hidden
                    animate-slideUp
                `}
                dir="rtl"
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20 bg-gradient-to-l from-gold-soft/30 to-transparent">
                        <h2 id="modal-title" className="text-lg font-bold text-brown-dark">
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-brown-dark/5 hover:bg-brown-dark/10 text-brown-mid flex items-center justify-center transition-colors"
                            aria-label="إغلاق"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6">{children}</div>

                {footer && (
                    <div className="px-6 py-4 border-t border-gold/20 bg-beige/50 flex flex-wrap gap-3 justify-end">
                        {footer}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0 }
                    to { opacity: 1 }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0 }
                    to { transform: translateY(0); opacity: 1 }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out }
                .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) }
            `}</style>
        </div>,
        document.body,
    );
}
