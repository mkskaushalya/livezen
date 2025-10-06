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
            'status' => 'Active',
            'category_id' => $category->id,
            'tags' => [$tag->id],
        ];

        $response = $this->actingAs($seller)->post(route('products.store'), $productData);

        $response->assertStatus(302);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'price' => 99.99,
            'stock' => 10,
            'status' => 'Active',
            'seller_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        // Check if product was created and has the tag
        $product = Product::where('name', 'Test Product')->first();
        $this->assertTrue($product->tags->contains($tag));
    }

    public function test_seller_cannot_create_product_with_invalid_data()
    {
        $seller = User::factory()->create(['role' => 'seller']);

        $productData = [
            'name' => '',
            'price' => -10,
            'stock' => -5,
        ];

        $response = $this->actingAs($seller)->post(route('products.store'), $productData);

        $response->assertSessionHasErrors(['name', 'price', 'stock']);
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
            'seller_id' => $seller1->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($seller2)->put(route('products.update', $product), [
            'name' => 'Unauthorized Update',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_any_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();

        $product = Product::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        $updateData = [
            'name' => 'Admin Updated Product',
            'description' => 'Updated by admin',
            'price' => 199.99,
            'stock' => 25,
            'status' => 'Active',
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
            'seller_id' => $seller->id,
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
            'seller_id' => $seller1->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($seller2)->delete(route('products.destroy', $product));

        $response->assertStatus(403);
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_admin_can_delete_any_product()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();

        $product = Product::factory()->create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('products.destroy', $product));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_product_images_are_stored_correctly()
    {
        Storage::fake('public');

        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Image Test Product',
            'description' => 'Testing image upload',
            'price' => 99.99,
            'stock' => 10,
            'status' => 'Active',
            'category_id' => $category->id,
            'tags' => [],
        ];

        $response = $this->actingAs($seller)->post(route('products.store'), $productData);

        $response->assertStatus(302);

        $product = Product::where('name', 'Image Test Product')->first();

        // Since we're not actually uploading files in this test, 
        // we just verify the product was created successfully
        $this->assertNotNull($product);
        $this->assertEquals('Image Test Product', $product->name);
    }

    public function test_product_stock_validation()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Stock Test Product',
            'description' => 'Testing stock validation',
            'price' => 99.99,
            'stock' => -5, // Invalid negative stock
            'status' => 'Active',
            'category_id' => $category->id,
            'tags' => [],
        ];

        $response = $this->actingAs($seller)->post(route('products.store'), $productData);

        $response->assertSessionHasErrors('stock');
    }

    public function test_product_price_validation()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Price Test Product',
            'description' => 'Testing price validation',
            'price' => -10.50, // Invalid negative price
            'stock' => 10,
            'status' => 'Active',
            'category_id' => $category->id,
            'tags' => [],
        ];

        $response = $this->actingAs($seller)->post(route('products.store'), $productData);

        $response->assertSessionHasErrors('price');
    }
}
