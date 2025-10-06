<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_guest_cannot_access_product_management()
    {
        $response = $this->get(route('products.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_seller_can_access_product_management()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        
        $response = $this->actingAs($seller)->get(route('products.index'));
        $response->assertStatus(200);
    }

    public function test_seller_can_create_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'price' => 99.99,
            'stock' => 10,
            'status' => 'Active',
            'category_id' => $category->id,
            'tags' => [],
        ];

        $response = $this->actingAs($seller)->post(route('products.store'), $productData);

        $response->assertStatus(302);
        
        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'price' => 99.99,
            'stock' => 10,
            'status' => 'Active',
            'category_id' => $category->id,
            'seller_id' => $seller->id,
        ]);
    }

    public function test_seller_can_update_own_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        $updateData = [
            'name' => 'Updated Product Name',
            'description' => 'Updated description',
            'price' => 149.99,
            'stock' => 20,
            'status' => 'Out of Stock',
            'category_id' => $category->id,
            'tags' => [],
        ];

        $response = $this->actingAs($seller)->put(route('products.update', $product), $updateData);

        $response->assertStatus(302);
        
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product Name',
            'price' => 149.99,
            'stock' => 20,
            'status' => 'Out of Stock',
        ]);
    }

    public function test_seller_can_delete_own_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($seller)->delete(route('products.destroy', $product));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_product_validation_fails_with_invalid_data()
    {
        $seller = User::factory()->create(['role' => 'seller']);

        $response = $this->actingAs($seller)->post(route('products.store'), [
            'name' => '', // Missing required field
            'price' => -10, // Invalid price
            'stock' => -5, // Invalid stock
        ]);

        $response->assertSessionHasErrors(['name', 'price', 'stock', 'category_id']);
    }
}