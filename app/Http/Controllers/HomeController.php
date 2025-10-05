<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    protected $recommendationService;

    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    public function index(Request $request)
    {
        // Get featured products (latest 8 products)
        $featuredProducts = Product::with(['category', 'tags'])
            ->where('status', 'Active')
            ->where('stock', '>', 0)
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

        // Get personalized recommendations
        $user = $request->user();
        if ($user) {
            $recommendedProducts = $this->recommendationService->getPersonalizedRecommendations($user, 6);
        } else {
            $recommendedProducts = $this->recommendationService->getTrendingProducts(6);
        }
        $recommendedProducts->load(['category', 'tags']);

        return Inertia::render('home', [
            'featuredProducts' => $featuredProducts,
            'categories' => $categories,
            'topCategories' => $topCategories,
            'recommendedProducts' => $recommendedProducts,
        ]);
    }
}
