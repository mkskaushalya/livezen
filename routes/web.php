<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

// Public product routes
Route::get('/products', [App\Http\Controllers\PublicProductController::class, 'index'])->name('public.products.index');
Route::get('/products/{product}', [App\Http\Controllers\PublicProductController::class, 'show'])->name('public.products.show');

// About page
Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

// Recently viewed page
Route::get('/recently-viewed', function () {
    return Inertia::render('recently-viewed');
})->name('recently-viewed');

// Recommendation routes
Route::get('/api/recommendations', [App\Http\Controllers\RecommendationController::class, 'getUserRecommendations'])->name('recommendations.user');
Route::get('/api/recommendations/home', [App\Http\Controllers\RecommendationController::class, 'getHomeRecommendations'])->name('recommendations.home');
Route::get('/api/recommendations/trending', [App\Http\Controllers\RecommendationController::class, 'getTrending'])->name('recommendations.trending');
Route::get('/api/products/{product}/related', [App\Http\Controllers\RecommendationController::class, 'getRelatedProducts'])->name('recommendations.related');
Route::post('/api/recommendations/track-view', [App\Http\Controllers\RecommendationController::class, 'trackView'])->name('recommendations.track');

// ML Recommendation management routes (Admin only)
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/ml-recommendations', [App\Http\Controllers\RecommendationController::class, 'adminDashboard'])->name('admin.ml-recommendations');
    Route::get('/api/admin/recommendations/stats', [App\Http\Controllers\RecommendationController::class, 'getStats'])->name('admin.recommendations.stats');
    Route::post('/api/admin/recommendations/clear-cache', [App\Http\Controllers\RecommendationController::class, 'clearCaches'])->name('admin.recommendations.clear-cache');
    Route::get('/api/products/{product}/ml-recommendations', [App\Http\Controllers\RecommendationController::class, 'getMLOnlyRecommendations'])->name('admin.recommendations.ml-only');
});

// Newsletter subscription
Route::post('/newsletter/subscribe', [App\Http\Controllers\NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');

Route::middleware(['auth', 'verified'])->group(function () {
    // Main dashboard route
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Dashboard sub-routes
    Route::get('/dashboard/orders', [App\Http\Controllers\DashboardController::class, 'orders'])->name('dashboard.orders');
    Route::get('/dashboard/profile', [App\Http\Controllers\DashboardController::class, 'profile'])->name('dashboard.profile');
    Route::put('/dashboard/profile', [App\Http\Controllers\DashboardController::class, 'updateProfile'])->name('dashboard.profile.update');

    // Role-specific dashboards
    Route::get('/dashboard/user', function () {
        return Inertia::render('dashboard/user-dashboard');
    })->name('user.dashboard')->middleware('role:user');

    Route::get('/dashboard/seller', [ProductController::class, 'index'])->name('seller.dashboard')->middleware('role:seller');

    Route::get('/dashboard/admin', [ProductController::class, 'index'])->name('admin.dashboard')->middleware('role:admin');

    // Wishlist routes
    Route::get('/wishlist', [App\Http\Controllers\WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist', [App\Http\Controllers\WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist', [App\Http\Controllers\WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::post('/wishlist/check', [App\Http\Controllers\WishlistController::class, 'check'])->name('wishlist.check');
});

Route::middleware(['auth', 'role:seller,admin'])->group(function () {
    Route::get('/seller/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/seller/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/seller/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/seller/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::post('/admin/users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::put('/admin/users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::delete('/admin/users/{user}', [App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');
});

Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/tags', [TagController::class, 'index'])->name('tags.index');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
