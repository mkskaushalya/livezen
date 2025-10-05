<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'tags'])->get();
        $users = \App\Models\User::all();
        
        // Check if it's an admin accessing the dashboard
        $dashboardView = Auth::user()->role === 'admin' ? 'dashboard/admin-dashboard' : 'dashboard/seller-dashboard';
        
        return Inertia::render($dashboardView, [
            'products' => $products,
            'categories' => \App\Models\Category::all(),
            'tags' => \App\Models\Tag::all(),
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'tags' => 'array',
            'description' => 'nullable|string',
            'stock' => 'integer|min:0',
            'image' => 'nullable|string',
        ]);

        $validated['seller_id'] = Auth::id();

        $product = Product::create($validated);

        if (!empty($validated['tags'])) {
            $product->tags()->sync($validated['tags']);
        }

        return redirect()->back()->with('success', 'Product added successfully.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'tags' => 'array',
            'description' => 'nullable|string',
            'stock' => 'integer|min:0',
            'image' => 'nullable|string',
        ]);

        $product->update($validated);

        if (isset($validated['tags'])) {
            $product->tags()->sync($validated['tags']);
        }

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted.');
    }
}
