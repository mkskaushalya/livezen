<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RecommendationSystemTest extends TestCase
{
    use RefreshDatabase;

    private RecommendationService $recommendationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->recommendationService = app(RecommendationService::class);
    }

    public function test_get_related_products_returns_collection()
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        $relatedProducts = $this->recommendationService->getRelatedProducts($product, 4);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $relatedProducts);
        $this->assertLessThanOrEqual(4, $relatedProducts->count());
    }

    public function test_get_related_products_finds_same_category_products()
    {
        $category = Category::factory()->create();

        $mainProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 10,
            'name' => 'Main Product'
        ]);

        // Create enough related products in same category to fill the rule-based portion (70%)
        $relatedProducts = [];
        for ($i = 1; $i <= 6; $i++) {
            $relatedProducts[] = Product::factory()->create([
                'category_id' => $category->id,
                'status' => 'Active',
                'stock' => 5 + $i,
                'name' => "Related Product {$i}"
            ]);
        }

        // Create product in different category
        $differentCategory = Category::factory()->create();
        Product::factory()->create([
            'category_id' => $differentCategory->id,
            'status' => 'Active',
            'stock' => 3,
            'name' => 'Different Category Product'
        ]);

        $recommendedProducts = $this->recommendationService->getRelatedProducts($mainProduct, 4);

        // Should find products
        $this->assertGreaterThan(0, $recommendedProducts->count());
        $this->assertLessThanOrEqual(4, $recommendedProducts->count());

        // Main product should not be included
        $recommendedProductIds = $recommendedProducts->pluck('id')->toArray();
        $this->assertNotContains($mainProduct->id, $recommendedProductIds);

        // At least some products should be from same category (due to rule-based recommendations)
        $sameCategoryCount = $recommendedProducts->where('category_id', $category->id)->count();
        $this->assertGreaterThan(0, $sameCategoryCount, 'Should have at least some products from the same category');

        // All recommended products should be active and in stock
        foreach ($recommendedProducts as $product) {
            $this->assertEquals('Active', $product->status);
            $this->assertGreaterThan(0, $product->stock);
        }
    }

    public function test_get_related_products_excludes_out_of_stock()
    {
        $category = Category::factory()->create();

        $mainProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 10
        ]);

        // Create in-stock related product
        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        // Create out-of-stock products (should be excluded)
        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 0
        ]);

        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Out of Stock',
            'stock' => 5
        ]);

        $relatedProducts = $this->recommendationService->getRelatedProducts($mainProduct, 4);

        // All related products should have stock > 0 and be Active
        foreach ($relatedProducts as $product) {
            $this->assertGreaterThan(0, $product->stock);
            $this->assertEquals('Active', $product->status);
        }
    }

    public function test_get_related_products_finds_similar_price_range()
    {
        $category = Category::factory()->create();

        $mainProduct = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 100.00,
            'status' => 'Active'
        ]);

        // Create products in similar price range (±30%)
        $similarPriceProduct = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 120.00, // Within 30% range
            'status' => 'Active'
        ]);

        // Create product with very different price
        $expensiveProduct = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 500.00, // Outside 30% range
            'status' => 'Active'
        ]);

        $relatedProducts = $this->recommendationService->getRelatedProducts($mainProduct, 4);

        // Should prefer products in similar price range
        $this->assertGreaterThan(0, $relatedProducts->count());

        // Check if similar price product is preferred over expensive one
        $productIds = $relatedProducts->pluck('id')->toArray();
        $this->assertContains($similarPriceProduct->id, $productIds);
    }

    public function test_get_related_products_uses_shared_tags()
    {
        $category = Category::factory()->create();
        $tag1 = Tag::factory()->create(['name' => 'gaming']);
        $tag2 = Tag::factory()->create(['name' => 'professional']);

        $mainProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);
        $mainProduct->tags()->attach($tag1);

        // Product with shared tag
        $taggedProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);
        $taggedProduct->tags()->attach($tag1);

        // Product with different tag
        $differentTagProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);
        $differentTagProduct->tags()->attach($tag2);

        $relatedProducts = $this->recommendationService->getRelatedProducts($mainProduct, 4);

        // Should include product with shared tags
        $productIds = $relatedProducts->pluck('id')->toArray();
        $this->assertContains($taggedProduct->id, $productIds);
    }

    public function test_get_personalized_recommendations_for_new_user()
    {
        $user = User::factory()->create();

        // Create some popular products
        $category = Category::factory()->create();
        Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        $recommendations = $this->recommendationService->getPersonalizedRecommendations($user, 4);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $recommendations);
        $this->assertLessThanOrEqual(4, $recommendations->count());
    }

    public function test_get_personalized_recommendations_with_view_history()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        // Create products user has viewed
        $viewedProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        // Track product view
        $this->recommendationService->trackProductView($user, $viewedProduct);

        // Create products in same category (should be recommended)
        Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        $recommendations = $this->recommendationService->getPersonalizedRecommendations($user, 4);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $recommendations);

        // Should not include the viewed product itself
        $recommendedIds = $recommendations->pluck('id')->toArray();
        $this->assertNotContains($viewedProduct->id, $recommendedIds);
    }

    public function test_track_product_view_stores_in_cache()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        $this->recommendationService->trackProductView($user, $product);

        $cacheKey = "user_views_{$user->id}";
        $views = Cache::get($cacheKey, []);

        $this->assertContains($product->id, $views);
        $this->assertEquals($product->id, $views[0]); // Most recent first
    }

    public function test_get_popular_products_returns_active_products()
    {
        $category = Category::factory()->create();

        // Create active products
        Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 10
        ]);

        // Create inactive product (should be excluded)
        Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Out of Stock',
            'stock' => 0
        ]);

        $popularProducts = $this->recommendationService->getPopularProducts(5);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $popularProducts);
        $this->assertLessThanOrEqual(5, $popularProducts->count());

        // All products should be active and in stock
        foreach ($popularProducts as $product) {
            $this->assertEquals('Active', $product->status);
            $this->assertGreaterThan(0, $product->stock);
        }
    }

    public function test_get_trending_products_returns_recent_products()
    {
        $category = Category::factory()->create();

        // Create products
        Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 10
        ]);

        $trendingProducts = $this->recommendationService->getTrendingProducts(3);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $trendingProducts);
        $this->assertLessThanOrEqual(3, $trendingProducts->count());

        // All products should be active and in stock
        foreach ($trendingProducts as $product) {
            $this->assertEquals('Active', $product->status);
            $this->assertGreaterThan(0, $product->stock);
        }
    }

    public function test_clear_user_recommendations_clears_cache()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        // Track view to create cache entries
        $this->recommendationService->trackProductView($user, $product);

        // Verify cache exists
        $cacheKey = "user_views_{$user->id}";
        $this->assertNotNull(Cache::get($cacheKey));

        // Clear recommendations
        $this->recommendationService->clearUserRecommendations($user);

        // Cache should be cleared
        $this->assertNull(Cache::get($cacheKey));
    }

    public function test_get_stats_returns_system_information()
    {
        $stats = $this->recommendationService->getStats();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('ml_stats', $stats);
        $this->assertArrayHasKey('cache_info', $stats);
        $this->assertArrayHasKey('system_info', $stats);

        // System info should contain expected keys
        $this->assertArrayHasKey('php_version', $stats['system_info']);
        $this->assertArrayHasKey('laravel_version', $stats['system_info']);
        $this->assertArrayHasKey('cache_driver', $stats['system_info']);
    }

    public function test_get_ml_only_recommendations_handles_no_similarities()
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        // This should not fail even if ML service returns no similarities
        $recommendations = $this->recommendationService->getMLOnlyRecommendations($product, 4);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $recommendations);
    }

    public function test_recommendations_respect_limit_parameter()
    {
        $category = Category::factory()->create();

        $mainProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        // Create many related products
        Product::factory()->count(10)->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        $relatedProducts = $this->recommendationService->getRelatedProducts($mainProduct, 3);

        $this->assertLessThanOrEqual(3, $relatedProducts->count());
    }

    public function test_recommendations_cache_functionality()
    {
        Cache::flush(); // Clear cache

        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        // Create related products
        Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'status' => 'Active'
        ]);

        // First call should populate cache
        $cacheKey = "hybrid_related_products_{$product->id}_4";
        $this->assertNull(Cache::get($cacheKey));

        $recommendations1 = $this->recommendationService->getRelatedProducts($product, 4);

        // Cache should now be populated
        $this->assertNotNull(Cache::get($cacheKey));

        // Second call should use cache (results should be identical)
        $recommendations2 = $this->recommendationService->getRelatedProducts($product, 4);

        $this->assertEquals($recommendations1->pluck('id'), $recommendations2->pluck('id'));
    }
}
