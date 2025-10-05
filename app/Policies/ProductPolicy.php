<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Sellers and admins can view products
        return in_array($user->role, ['seller', 'admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Product $product): bool
    {
        // Everyone can view individual products
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Sellers and admins can create products
        return in_array($user->role, ['seller', 'admin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Product $product): bool
    {
        // Admin can update any product, seller can only update their own products
        return $user->role === 'admin' ||
            ($user->role === 'seller' && $product->seller_id === $user->id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Product $product): bool
    {
        // Admin can delete any product, seller can only delete their own products
        return $user->role === 'admin' ||
            ($user->role === 'seller' && $product->seller_id === $user->id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Product $product): bool
    {
        // Admin can restore any product, seller can only restore their own products
        return $user->role === 'admin' ||
            ($user->role === 'seller' && $product->seller_id === $user->id);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        // Only admin can force delete products
        return $user->role === 'admin';
    }
}
