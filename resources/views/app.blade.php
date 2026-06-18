<!DOCTYPE html>
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'شجرة النسب') }}</title>

        {{-- Dark mode init قبل React لتفادي FOUC --}}
        <script>
            (function () {
                try {
                    var stored = localStorage.getItem('nasab-theme');
                    var isDark = stored === 'dark' ||
                        (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    if (isDark) document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
                } catch (e) {}
            })();
        </script>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=tajawal:300,400,500,700,800|cairo:400,500,600,700|amiri:400,700&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="antialiased">
        @inertia
    </body>
</html>
