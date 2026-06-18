import '../css/app.css';

import ErrorBoundary from '@/Components/UI/ErrorBoundary';
import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'شجرة النسب';

// جميع صفحات Inertia — يُحوّلها Vite إلى chunks منفصلة lazy
const pages = import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const loader = pages[`./Pages/${name}.tsx`];
        if (!loader) {
            throw new Error(`[Inertia] صفحة غير موجودة: ${name}`);
        }
        const module = await loader();
        return module.default;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>,
        );
    },
    progress: {
        color: '#C9A84C',
    },
});
