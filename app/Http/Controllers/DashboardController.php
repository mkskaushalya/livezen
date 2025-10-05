<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $recommendationService;

    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    public function index()
    {
        $user = Auth::user();

        // Get user's orders with order items and products
        $orders = Order::with(['orderItems.product'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get user's wishlist items
        $wishlistItems = $user->wishlistProducts()
            ->with(['category', 'tags'])
            ->limit(6)
            ->get();

        // Get personalized recommendations
        $recommendedProducts = $this->recommendationService->getPersonalizedRecommendations($user, 6);
        $recommendedProducts->load(['category', 'tags']);

        // Calculate dashboard stats
        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'pending_orders' => Order::where('user_id', $user->id)->where('status', 'pending')->count(),
            'wishlist_count' => $user->wishlists()->count(),
            'total_spent' => Order::where('user_id', $user->id)
                ->whereIn('status', ['delivered', 'shipped'])
                ->sum('total_amount'),
        ];

        return Inertia::render('dashboard/user-dashboard', [
            'orders' => $orders,
            'wishlistItems' => $wishlistItems,
            'recommendedProducts' => $recommendedProducts,
            'stats' => $stats,
        ]);
    }

    public function orders()
    {
        $user = Auth::user();

        $orders = Order::with(['orderItems.product'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('dashboard/orders', [
            'orders' => $orders,
        ]);
    }

    public function profile()
    {
        return Inertia::render('dashboard/profile');
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->back()->with('success', 'Profile updated successfully');
    }
}
