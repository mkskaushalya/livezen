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

class ProductTest extends TestCase
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

    public function test_regular_user_cannot_access_product_management()
    {
        $user = User::factory()->create(['role' => 'user']);
        
        $response = $this->actingAs($user)->get(route('products.index'));
        $response->assertStatus(403);
    }

    public function test_seller_can_access_product_management()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        
        $response = $this->actingAs($seller)->get(route('products.index'));
        $response->assertStatus(200);
    }

    public function test_admin_can_access_product_management()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $response = $this->actingAs($admin)->get(route('products.index'));
        $response->assertStatus(200);
    }

    public function test_seller_can_create_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        $tag = Tag::factory()->create();

        $productData = [
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'price' => 99.99,
            'stock' => 10,
            'status' => 'In Stock',
            'category_id' => $category->id,
            'tags' => [$tag->id],
            'images' => [
                UploadedFile::fake()->image('product1.jpg'),
                UploadedFile::fake()->image('product2.jpg'),
            ],
        ];

        $response = $this->actingAs($seller)->post(route('products.store'), $productData);

        $response->assertStatus(302);
        
        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'price' => 99.99,
            'stock' => 10,
            'status' => 'Active', // Changed to match enum value
            'category_id' => $category->id,
            'seller_id' => $seller->id, // Changed to seller_id
        ]);

        $product = Product::where('name', 'Test Product')->first();
        $this->assertTrue($product->tags->contains($tag));
        
        // Check images were uploaded
        $this->assertCount(2, json_decode($product->images, true));
    }

    public function test_seller_cannot_create_product_with_invalid_data()
    {
        $seller = User::factory()->create(['role' => 'seller']);

        $response = $this->actingAs($seller)->post(route('products.store'), [
            'name' => '', // Missing required field
            'price' => -10, // Invalid price
            'stock' => -5, // Invalid stock
        ]);

        $response->assertSessionHasErrors(['name', 'price', 'stock']);
    }

    public function test_seller_can_update_own_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        $updateData = [
            'name' => 'Updated Product Name',
            'description' => 'Updated description',
            'price' => 149.99,
            'stock' => 20,
            'status' => 'Low Stock',
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
            'status' => 'Low Stock',
        ]);
    }

    public function test_seller_cannot_update_other_sellers_product()
    {
        $seller1 = User::factory()->create(['role' => 'seller']);
        $seller2 = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        
        $product = Product::factory()->create([
            'user_id' => $seller1->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($seller2)->put(route('products.update', $product), [
            'name' => 'Unauthorized Update',
            'category_id' => $category->id,
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_any_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        
        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        $updateData = [
            'name' => 'Admin Updated Product',
            'description' => 'Updated by admin',
            'price' => 199.99,
            'stock' => 5,
            'status' => 'In Stock',
            'category_id' => $category->id,
            'tags' => [],
        ];

        $response = $this->actingAs($admin)->put(route('products.update', $product), $updateData);

        $response->assertStatus(302);
        
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Admin Updated Product',
            'price' => 199.99,
        ]);
    }

    public function test_seller_can_delete_own_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($seller)->delete(route('products.destroy', $product));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_seller_cannot_delete_other_sellers_product()
    {
        $seller1 = User::factory()->create(['role' => 'seller']);
        $seller2 = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        
        $product = Product::factory()->create([
            'user_id' => $seller1->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($seller2)->delete(route('products.destroy', $product));

        $response->assertStatus(403);
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_admin_can_delete_any_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();
        
        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('products.destroy', $product));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_product_images_are_stored_correctly()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();

        $image1 = UploadedFile::fake()->image('test1.jpg', 800, 600);
        $image2 = UploadedFile::fake()->image('test2.png', 1024, 768);

        $response = $this->actingAs($seller)->post(route('products.store'), [
            'name' => 'Image Test Product',
            'description' => 'Testing image upload',
            'price' => 50.00,
            'stock' => 5,
            'status' => 'In Stock',
            'category_id' => $category->id,
            'tags' => [],
            'images' => [$image1, $image2],
        ]);

        $response->assertStatus(302);

        $product = Product::where('name', 'Image Test Product')->first();
        $images = json_decode($product->images, true);

        $this->assertCount(2, $images);
        
        foreach ($images as $imagePath) {
            Storage::disk('public')->exists($imagePath);
        }
    }

    public function test_product_stock_validation()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();

        // Test negative stock
        $response = $this->actingAs($seller)->post(route('products.store'), [
            'name' => 'Test Product',
            'description' => 'Test',
            'price' => 10.00,
            'stock' => -1,
            'status' => 'In Stock',
            'category_id' => $category->id,
            'tags' => [],
        ]);

        $response->assertSessionHasErrors('stock');
    }

    public function test_product_price_validation()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();

        // Test negative price
        $response = $this->actingAs($seller)->post(route('products.store'), [
            'name' => 'Test Product',
            'description' => 'Test',
            'price' => -10.00,
            'stock' => 5,
            'status' => 'In Stock',
            'category_id' => $category->id,
            'tags' => [],
        ]);

        $response->assertSessionHasErrors('price');
        
        // Test zero price
        $response = $this->actingAs($seller)->post(route('products.store'), [
            'name' => 'Test Product',
            'description' => 'Test',
            'price' => 0,
            'stock' => 5,
            'status' => 'In Stock',
            'category_id' => $category->id,
            'tags' => [],
        ]);

        $response->assertSessionHasErrors('price');
    }
}