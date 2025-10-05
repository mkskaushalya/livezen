<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'tags'])
            ->where('status', 'Active');

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

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'tag' => $request->tag,
                'sort' => $sortBy,
                'order' => $sortOrder,
            ]
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'tags'])
            ->where('status', 'Active')
            ->findOrFail($id);

        // Get related products from the same category
        $relatedProducts = Product::with(['category', 'tags'])
            ->where('status', 'Active')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get();

        return Inertia::render('products/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
