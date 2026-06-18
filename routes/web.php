<?php

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\KinshipController;
use App\Http\Controllers\PendingEditController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TreeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

/* ═══════════════════════════════════════════════
   مسارات القبيلة (tenant)
   ═══════════════════════════════════════════════ */
Route::prefix('tribes/{tribe}')
    ->where(['tribe' => '[a-z0-9-]+'])
    ->middleware('tenant')
    ->group(function () {
        Route::get('/tree', [TreeController::class, 'index'])->name('tree.index');
        Route::get('/tree/full', [TreeController::class, 'full'])->name('tree.full');
        Route::get('/tree/expand/{person}', [TreeController::class, 'expand'])->name('tree.expand');

        Route::get('/persons/{person}', [PersonController::class, 'show'])->name('persons.show');
        Route::post('/persons', [PersonController::class, 'store'])
            ->middleware('auth')
            ->name('persons.store');

        Route::get('/search', [SearchController::class, 'index'])->name('search.index');
        Route::get('/search/suggest', [SearchController::class, 'suggest'])->name('search.suggest');

        Route::get('/kinship', [KinshipController::class, 'find'])->name('kinship.find');

        Route::get('/certificate/{person}', [CertificateController::class, 'show'])->name('certificate.show');
        Route::get('/certificate/{person}/pdf', [CertificateController::class, 'download'])->name('certificate.download');
        Route::get('/certificate/{person}/inline', [CertificateController::class, 'inline'])->name('certificate.inline');

        /* ═════════ نظام الموافقة ═════════ */
        Route::middleware('auth')->group(function () {
            // تقديم طلب — لأي عضو
            Route::post('/pending-edits', [PendingEditController::class, 'store'])
                ->name('pending-edits.store');

            // إدارة الطلبات — للمشرفين (يُحرسها policy داخل الـ controller)
            Route::prefix('admin')->name('admin.')->group(function () {
                Route::get('/pending-edits', [PendingEditController::class, 'index'])
                    ->name('pending-edits.index');
                Route::post('/pending-edits/approve-all', [PendingEditController::class, 'approveAll'])
                    ->name('pending-edits.approve-all');
                Route::get('/pending-edits/{edit}', [PendingEditController::class, 'show'])
                    ->name('pending-edits.show');
                Route::post('/pending-edits/{edit}/approve', [PendingEditController::class, 'approve'])
                    ->name('pending-edits.approve');
                Route::post('/pending-edits/{edit}/reject', [PendingEditController::class, 'reject'])
                    ->name('pending-edits.reject');
            });
        });
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // إرسال اقتراح/بلاغ خلل — لأي مستخدم مسجّل (يصل للمدير العام)
    Route::post('/feedback', [\App\Http\Controllers\FeedbackController::class, 'store'])
        ->name('feedback.store');

    /* ═════════ لوحة الإدارة العامة ═════════ */
    Route::prefix('admin')->name('admin.')->group(function () {
        // إدارة المستخدمين — super_admin و tribe_admin
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])
            ->name('users.index');
        Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])
            ->name('users.store');
        Route::post('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])
            ->name('users.update');
        Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])
            ->name('users.destroy');
        Route::post('/users/{user}/approve-join', [\App\Http\Controllers\Admin\UserController::class, 'approveJoin'])
            ->name('users.approve-join');
        Route::post('/users/{user}/reject-join', [\App\Http\Controllers\Admin\UserController::class, 'rejectJoin'])
            ->name('users.reject-join');

        // إدارة القبائل — super_admin فقط
        Route::get('/tribes', [\App\Http\Controllers\Admin\TribeController::class, 'index'])
            ->name('tribes.index');
        Route::post('/tribes', [\App\Http\Controllers\Admin\TribeController::class, 'store'])
            ->name('tribes.store');
        Route::patch('/tribes/{tribe}', [\App\Http\Controllers\Admin\TribeController::class, 'update'])
            ->name('tribes.update');
        Route::delete('/tribes/{tribe}', [\App\Http\Controllers\Admin\TribeController::class, 'destroy'])
            ->name('tribes.destroy');

        // الباقات والتسعير — super_admin فقط
        Route::get('/packages', [\App\Http\Controllers\Admin\PackageController::class, 'index'])
            ->name('packages.index');
        Route::post('/packages', [\App\Http\Controllers\Admin\PackageController::class, 'store'])
            ->name('packages.store');
        Route::post('/packages/reorder', [\App\Http\Controllers\Admin\PackageController::class, 'reorder'])
            ->name('packages.reorder');
        Route::patch('/packages/{package}', [\App\Http\Controllers\Admin\PackageController::class, 'update'])
            ->name('packages.update');
        Route::delete('/packages/{package}', [\App\Http\Controllers\Admin\PackageController::class, 'destroy'])
            ->name('packages.destroy');

        // الاقتراحات والبلاغات — super_admin فقط
        Route::get('/feedback', [\App\Http\Controllers\Admin\FeedbackController::class, 'index'])
            ->name('feedback.index');
        Route::patch('/feedback/{feedback}', [\App\Http\Controllers\Admin\FeedbackController::class, 'update'])
            ->name('feedback.update');
        Route::delete('/feedback/{feedback}', [\App\Http\Controllers\Admin\FeedbackController::class, 'destroy'])
            ->name('feedback.destroy');

        // إدارة الواجهة الرئيسية — super_admin فقط
        Route::get('/landing', [\App\Http\Controllers\Admin\LandingController::class, 'index'])
            ->name('landing.index');
        Route::post('/landing', [\App\Http\Controllers\Admin\LandingController::class, 'store'])
            ->name('landing.store');
        Route::post('/landing/reorder', [\App\Http\Controllers\Admin\LandingController::class, 'reorder'])
            ->name('landing.reorder');
        Route::patch('/landing/{section}', [\App\Http\Controllers\Admin\LandingController::class, 'update'])
            ->name('landing.update');
        Route::delete('/landing/{section}', [\App\Http\Controllers\Admin\LandingController::class, 'destroy'])
            ->name('landing.destroy');
    });
});

require __DIR__.'/auth.php';
