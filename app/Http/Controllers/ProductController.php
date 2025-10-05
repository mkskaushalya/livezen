<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'tags'])->get();
        return Inertia::render('dashboard/seller-dashboard', [
            'products' => $products,
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

        $validated['seller_id'] = auth()->id();

        $product = Product::create($validated);

        if (!empty($validated['tags'])) {
            $product->tags()->sync($validated['tags']);
        }

        return redirect()->back()->with('success', 'Product added successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted.');
    }
}
