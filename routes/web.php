<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard/user', function () {
        return Inertia::render('dashboard/user-dashboard');
    })->name('user.dashboard')->middleware('role:user');

    Route::get('/dashboard/seller', function () {
        return Inertia::render('dashboard/seller-dashboard');
    })->name('seller.dashboard')->middleware('role:seller');

    Route::get('/dashboard/admin', function () {
        return Inertia::render('dashboard/admin-dashboard');
    })->name('admin.dashboard')->middleware('role:admin');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

});

Route::middleware(['auth', 'role:seller'])->group(function () {
    Route::get('/seller/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/seller/products', [ProductController::class, 'store'])->name('products.store');
    Route::delete('/seller/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
});

Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/tags', [TagController::class, 'index'])->name('tags.index');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
