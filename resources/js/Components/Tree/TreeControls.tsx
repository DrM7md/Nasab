import { useReactFlow } from '@xyflow/react';

interface Props {
    onHome?: () => void;
    onToggleExpandAll?: () => void;
    isFullyExpanded?: boolean;
    expandLoading?: boolean;
}

/**
 * TreeControls — أزرار تحكم الشجرة
 * تصميم glassmorphism فوق React Flow.
 */
export default function TreeControls({
    onHome,
    onToggleExpandAll,
    isFullyExpanded = false,
    expandLoading = false,
}: Props) {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const buttonClass = `
        w-10 h-10 rounded-xl
        bg-white/80 backdrop-blur-md
        border border-gold/20
        text-brown-dark hover:text-gold
        shadow-md hover:shadow-lg
        flex items-center justify-center
        transition-all hover:bg-white
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2" dir="rtl">
            <button
                type="button"
                onClick={() => zoomIn({ duration: 200 })}
                className={buttonClass}
                aria-label="تكبير"
                title="تكبير"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            <button
                type="button"
                onClick={() => zoomOut({ duration: 200 })}
                className={buttonClass}
                aria-label="تصغير"
                title="تصغير"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            </button>

            <button
                type="button"
                onClick={() => fitView({ duration: 400, padding: 0.2 })}
                className={buttonClass}
                aria-label="ملء الشاشة"
                title="ملء الشاشة"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>

            {onHome && (
                <button
                    type="button"
                    onClick={onHome}
                    className={buttonClass}
                    aria-label="العودة للجذر"
                    title="العودة للجذر"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </button>
            )}

            {onToggleExpandAll && (
                <button
                    type="button"
                    onClick={onToggleExpandAll}
                    disabled={expandLoading}
                    className={`${buttonClass} ${isFullyExpanded ? '!bg-gold !text-white !border-gold' : ''}`}
                    aria-label={isFullyExpanded ? 'طي الشجرة' : 'فتح الشجرة كاملة'}
                    title={isFullyExpanded ? 'طي الشجرة' : 'فتح الشجرة كاملة'}
                >
                    {expandLoading ? (
                        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : isFullyExpanded ? (
                        // أيقونة طي (تجمّع)
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9V4.5M15 9H19.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15v4.5M15 15H19.5M15 15l5.25 5.25" />
                        </svg>
                    ) : (
                        // أيقونة فتح (توسّع)
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
}
