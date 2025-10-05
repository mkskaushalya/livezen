<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard/user', function () {
        return Inertia::render('dashboard/user-dashboard');
    })->name('user.dashboard')->middleware('role:user');

    Route::get('/dashboard/seller', [ProductController::class, 'index'])->name('seller.dashboard')->middleware('role:seller');

    Route::get('/dashboard/admin', [ProductController::class, 'index'])->name('admin.dashboard')->middleware('role:admin');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
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
