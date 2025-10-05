<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Get featured products (latest 8 products)
        $featuredProducts = Product::with(['category', 'tags'])
            ->latest()
            ->limit(8)
            ->get();

        // Get all categories for navigation
        $categories = Category::all();

        // Get top categories (you can customize this logic)
        $topCategories = Category::withCount('products')
            ->orderBy('products_count', 'desc')
            ->limit(6)
            ->get();

        return Inertia::render('home', [
            'featuredProducts' => $featuredProducts,
            'categories' => $categories,
            'topCategories' => $topCategories,
        ]);
    }
}
