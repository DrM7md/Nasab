import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary
 *
 * يمنع انهيار كامل التطبيق عند خطأ في أي شجرة React.
 * يعرض شاشة fallback مع تفاصيل الخطأ + زر إعادة تحميل.
 */
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
        globalThis.location.reload();
    };

    render(): ReactNode {
        if (!this.state.hasError) {
            return this.props.children;
        }

        if (this.props.fallback) {
            return this.props.fallback;
        }

        return (
            <div
                className="welcome-bg min-h-screen flex items-center justify-center p-6"
                dir="rtl"
            >
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-gold-light/20 rounded-3xl shadow-2xl p-8 text-beige text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gold-soft mb-3">
                        حدث خطأ غير متوقع
                    </h1>
                    <p className="text-beige/80 text-sm mb-6 leading-relaxed">
                        نأسف على الإزعاج. حدث خطأ أثناء عرض هذه الصفحة.
                    </p>
                    {this.state.error && (
                        <details className="bg-black/20 rounded-xl p-3 mb-6 text-right text-xs font-mono text-beige-dark/80 border border-gold-light/10">
                            <summary className="cursor-pointer font-bold mb-2">
                                تفاصيل تقنية
                            </summary>
                            <code className="block whitespace-pre-wrap break-words">
                                {this.state.error.message}
                            </code>
                        </details>
                    )}
                    <button
                        type="button"
                        onClick={this.handleReset}
                        className="px-6 py-3 bg-gradient-to-r from-gold to-gold-light text-brown-dark rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        إعادة تحميل الصفحة
                    </button>
                </div>
            </div>
        );
    }
}
