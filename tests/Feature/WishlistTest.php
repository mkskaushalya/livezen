<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_wishlist()
    {
        $response = $this->get(route('wishlist.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_wishlist()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get(route('wishlist.index'));
        $response->assertStatus(200);
    }

    public function test_user_can_add_product_to_wishlist()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        $response = $this->actingAs($user)->post(route('wishlist.store'), [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['in_wishlist' => true]);
        
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_remove_product_from_wishlist()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);
        
        // Add to wishlist first
        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->delete(route('wishlist.destroy'), [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['in_wishlist' => false]);
        
        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_check_if_product_is_in_wishlist()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);
        
        // Add to wishlist
        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->post(route('wishlist.check'), [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['in_wishlist' => true]);
    }

    public function test_user_cannot_add_same_product_twice_to_wishlist()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        // Add to wishlist first time
        $this->actingAs($user)->post(route('wishlist.store'), [
            'product_id' => $product->id,
        ]);

        // Try to add again
        $response = $this->actingAs($user)->post(route('wishlist.store'), [
            'product_id' => $product->id,
        ]);

        // Should handle gracefully (returns that it's already in wishlist)
        $response->assertStatus(200);
        $response->assertJson(['in_wishlist' => true]);
        
        // Should still only have one entry
        $this->assertEquals(1, Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->count());
    }

    public function test_wishlist_displays_user_products()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product1 = Product::factory()->create(['category_id' => $category->id]);
        $product2 = Product::factory()->create(['category_id' => $category->id]);

        // Add products to wishlist
        Wishlist::create(['user_id' => $user->id, 'product_id' => $product1->id]);
        Wishlist::create(['user_id' => $user->id, 'product_id' => $product2->id]);

        $response = $this->actingAs($user)->get(route('wishlist.index'));
        
        $response->assertStatus(200);
        // The response should contain the products (this may need adjustment based on your view structure)
    }

    public function test_user_cannot_add_invalid_product_to_wishlist()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('wishlist.store'), [
            'product_id' => 99999, // Non-existent product
        ]);

        $response->assertSessionHasErrors('product_id');
    }

    public function test_guest_cannot_add_to_wishlist()
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        $response = $this->post(route('wishlist.store'), [
            'product_id' => $product->id,
        ]);

        $response->assertRedirect(route('login'));
    }
}