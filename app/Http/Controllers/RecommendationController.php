<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecommendationController extends Controller
{
    protected $recommendationService;

    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    /**
     * Get personalized recommendations for authenticated user
     */
    public function getUserRecommendations(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            // Return trending products for guest users
            $recommendations = $this->recommendationService->getTrendingProducts(8);
        } else {
            $recommendations = $this->recommendationService->getPersonalizedRecommendations($user, 8);
        }

        $recommendations->load(['category', 'tags']);

        if ($request->wantsJson()) {
            return response()->json([
                'recommendations' => $recommendations
            ]);
        }

        return Inertia::render('Recommendations/Index', [
            'recommendations' => $recommendations
        ]);
    }

    /**
     * Get recommendations for home page
     */
    public function getHomeRecommendations(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            $recommendations = $this->recommendationService->getTrendingProducts(6);
        } else {
            $recommendations = $this->recommendationService->getPersonalizedRecommendations($user, 6);
        }

        $recommendations->load(['category', 'tags']);

        return response()->json([
            'recommendations' => $recommendations
        ]);
    }

    /**
     * Get related products for a specific product
     */
    public function getRelatedProducts(Request $request, Product $product)
    {
        $relatedProducts = $this->recommendationService->getRelatedProducts($product, 4);
        $relatedProducts->load(['category', 'tags']);

        return response()->json([
            'relatedProducts' => $relatedProducts
        ]);
    }

    /**
     * Track product view for recommendation engine
     */
    public function trackView(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $product = Product::findOrFail($request->product_id);
        $this->recommendationService->trackProductView($user, $product);

        return response()->json(['message' => 'View tracked successfully']);
    }

    /**
     * Get trending products
     */
    public function getTrending(Request $request)
    {
        $limit = $request->get('limit', 6);
        $trending = $this->recommendationService->getTrendingProducts($limit);
        $trending->load(['category', 'tags']);

        return response()->json([
            'trending' => $trending
        ]);
    }

    /**
     * Get ML-only recommendations for testing (Admin only)
     */
    public function getMLOnlyRecommendations(Request $request, Product $product)
    {
        // Only allow admins to access this endpoint
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $mlRecommendations = $this->recommendationService->getMLOnlyRecommendations($product, 4);
        $mlRecommendations->load(['category', 'tags']);

        return response()->json([
            'mlRecommendations' => $mlRecommendations,
            'note' => 'These are pure ML-based recommendations for testing purposes'
        ]);
    }

    /**
     * Get recommendation system statistics (Admin only)
     */
    public function getStats(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = $this->recommendationService->getStats();

        return response()->json([
            'stats' => $stats,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Clear recommendation caches (Admin only)
     */
    public function clearCaches(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->recommendationService->clearAllRecommendationCaches();

        return response()->json([
            'message' => 'All recommendation caches cleared successfully',
            'note' => 'ML embeddings will be regenerated on next request'
        ]);
    }

    /**
     * Admin dashboard for ML recommendations management
     */
    public function adminDashboard(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(403);
        }

        $stats = $this->recommendationService->getStats();

        return Inertia::render('admin/ml-recommendations', [
            'stats' => $stats
        ]);
    }
}
