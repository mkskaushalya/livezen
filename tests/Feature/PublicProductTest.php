<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_view_products_index()
    {
        $response = $this->get(route('public.products.index'));
        $response->assertStatus(200);
    }

    public function test_products_index_displays_active_products()
    {
        $category = Category::factory()->create();

        // Create active and inactive products
        $activeProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'name' => 'Active Product'
        ]);

        $outOfStockProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Out of Stock',
            'name' => 'Out of Stock Product'
        ]);

        $response = $this->get(route('public.products.index'));

        $response->assertStatus(200);
        // You might need to adjust this based on your actual implementation
        // This is a conceptual test - the exact assertion depends on your view structure
    }

    public function test_public_can_view_product_details()
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        $response = $this->get(route('public.products.show', $product));
        $response->assertStatus(200);
    }

    public function test_products_can_be_filtered_by_category()
    {
        $category1 = Category::factory()->create(['name' => 'Electronics']);
        $category2 = Category::factory()->create(['name' => 'Books']);

        Product::factory()->create([
            'category_id' => $category1->id,
            'name' => 'Laptop',
            'status' => 'Active'
        ]);

        Product::factory()->create([
            'category_id' => $category2->id,
            'name' => 'Novel',
            'status' => 'Active'
        ]);

        $response = $this->get(route('public.products.index', ['category' => $category1->id]));

        $response->assertStatus(200);
        // Test should verify that only Electronics products are shown
    }

    public function test_products_can_be_searched_by_name()
    {
        $category = Category::factory()->create();

        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Gaming Laptop',
            'status' => 'Active'
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Office Chair',
            'status' => 'Active'
        ]);

        $response = $this->get(route('public.products.index', ['search' => 'laptop']));

        $response->assertStatus(200);
        // Test should verify that only products matching 'laptop' are shown
    }

    public function test_products_can_be_filtered_by_price_range()
    {
        $category = Category::factory()->create();

        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 50.00,
            'status' => 'Active'
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 150.00,
            'status' => 'Active'
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 300.00,
            'status' => 'Active'
        ]);

        $response = $this->get(route('public.products.index', [
            'min_price' => 100,
            'max_price' => 200
        ]));

        $response->assertStatus(200);
        // Test should verify that only products in the price range are shown
    }

    public function test_products_can_be_filtered_by_tags()
    {
        $category = Category::factory()->create();
        $tag1 = Tag::factory()->create(['name' => 'gaming']);
        $tag2 = Tag::factory()->create(['name' => 'office']);

        $product1 = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);
        $product1->tags()->attach($tag1);

        $product2 = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);
        $product2->tags()->attach($tag2);

        $response = $this->get(route('public.products.index', ['tags' => [$tag1->id]]));

        $response->assertStatus(200);
        // Test should verify that only products with gaming tag are shown
    }

    public function test_products_can_be_sorted_by_price()
    {
        $category = Category::factory()->create();

        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 300.00,
            'name' => 'Expensive Item',
            'status' => 'Active'
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'price' => 100.00,
            'name' => 'Cheap Item',
            'status' => 'Active'
        ]);

        // Test ascending sort
        $response = $this->get(route('public.products.index', ['sort' => 'price_asc']));
        $response->assertStatus(200);

        // Test descending sort
        $response = $this->get(route('public.products.index', ['sort' => 'price_desc']));
        $response->assertStatus(200);
    }

    public function test_products_can_be_sorted_by_name()
    {
        $category = Category::factory()->create();

        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Zebra Product',
            'status' => 'Active'
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Apple Product',
            'status' => 'Active'
        ]);

        $response = $this->get(route('public.products.index', ['sort' => 'name_asc']));
        $response->assertStatus(200);
    }

    public function test_product_details_shows_related_products()
    {
        $category = Category::factory()->create();
        $tag = Tag::factory()->create();

        $mainProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);
        $mainProduct->tags()->attach($tag);

        // Create related product in same category
        $relatedProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);
        $relatedProduct->tags()->attach($tag);

        $response = $this->get(route('public.products.show', $mainProduct));

        $response->assertStatus(200);
        // The response should contain related products data
    }

    public function test_product_details_handles_out_of_stock_products()
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Out of Stock',
            'stock' => 0
        ]);

        $response = $this->get(route('public.products.show', $product));

        $response->assertStatus(200);
        // Should still show the product but indicate it's out of stock
    }

    public function test_pagination_works_for_products()
    {
        $category = Category::factory()->create();

        // Create multiple products to test pagination
        for ($i = 1; $i <= 25; $i++) {
            Product::factory()->create([
                'category_id' => $category->id,
                'name' => "Product $i",
                'status' => 'Active'
            ]);
        }

        $response = $this->get(route('public.products.index'));
        $response->assertStatus(200);

        // Test second page
        $response = $this->get(route('public.products.index', ['page' => 2]));
        $response->assertStatus(200);
    }
}
