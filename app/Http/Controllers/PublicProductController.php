<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Tag;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicProductController extends Controller
{
    protected $recommendationService;

    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'tags']);

        // Filter by category if provided
        if ($request->has('category') && $request->category) {
            $query->where('category_id', $request->category);
        }

        // Filter by tag if provided
        if ($request->has('tag') && $request->tag) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tags.id', $request->tag);
            });
        }

        // Search by name or description
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Sort products
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');

        $allowedSortFields = ['name', 'price', 'created_at', 'stock'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $products = $query->paginate(12);

        // Get all categories and tags for filters
        $categories = Category::withCount('products')->get();
        $tags = Tag::withCount('products')->get();

        // Get personalized recommendations for the products page
        $user = $request->user();
        if ($user) {
            $recommendedProducts = $this->recommendationService->getPersonalizedRecommendations($user, 4);
        } else {
            $recommendedProducts = $this->recommendationService->getTrendingProducts(4);
        }
        $recommendedProducts->load(['category', 'tags']);

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'tags' => $tags,
            'recommendedProducts' => $recommendedProducts,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'tag' => $request->tag,
                'sort' => $sortBy,
                'order' => $sortOrder,
            ]
        ]);
    }

    public function show(Request $request, $id)
    {
        $product = Product::with(['category', 'tags'])
            ->findOrFail($id);

        // Track product view for authenticated users
        if ($request->user()) {
            $this->recommendationService->trackProductView($request->user(), $product);
        }

        // Get intelligent related products using recommendation service
        $relatedProducts = $this->recommendationService->getRelatedProducts($product, 4);
        $relatedProducts->load(['category', 'tags']);

        return Inertia::render('products/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
