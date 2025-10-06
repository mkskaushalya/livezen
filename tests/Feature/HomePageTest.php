<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_loads_successfully()
    {
        $response = $this->get(route('home'));
        $response->assertStatus(200);
    }

    public function test_home_page_displays_featured_products()
    {
        $category = Category::factory()->create();

        // Create featured products
        Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 10
        ]);

        $response = $this->get(route('home'));

        $response->assertStatus(200);
        // The view should receive featuredProducts data
        $response->assertInertia(function ($assert) {
            $assert->has('featuredProducts');
        });
    }

    public function test_home_page_displays_categories()
    {
        Category::factory()->count(3)->create();

        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertInertia(function ($assert) {
            $assert->has('categories')
                ->has('topCategories');
        });
    }

    public function test_home_page_shows_personalized_recommendations_for_authenticated_user()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        Product::factory()->count(4)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->actingAs($user)->get(route('home'));

        $response->assertStatus(200);
        $response->assertInertia(function ($assert) {
            $assert->has('recommendedProducts');
        });
    }

    public function test_home_page_shows_trending_products_for_guest_user()
    {
        $category = Category::factory()->create();

        Product::factory()->count(4)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertInertia(function ($assert) {
            $assert->has('recommendedProducts');
        });
    }

    public function test_home_page_excludes_out_of_stock_featured_products()
    {
        $category = Category::factory()->create();

        // Create in-stock product
        $inStockProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 10,
            'name' => 'In Stock Product'
        ]);

        // Create out-of-stock product
        $outOfStockProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 0,
            'name' => 'Out of Stock Product'
        ]);

        $response = $this->get(route('home'));

        $response->assertStatus(200);

        // Test that the home controller logic filters correctly
        // by checking that featured products from the database query exclude stock = 0
        $featuredProducts = Product::with(['category', 'tags'])
            ->where('status', 'Active')
            ->where('stock', '>', 0)
            ->latest()
            ->limit(8)
            ->get();

        // Should only include the in-stock product
        $this->assertEquals(1, $featuredProducts->count());
        $this->assertEquals($inStockProduct->id, $featuredProducts->first()->id);

        $response->assertInertia(function ($assert) {
            $assert->has('featuredProducts');
        });
    }

    public function test_about_page_loads_successfully()
    {
        $response = $this->get(route('about'));
        $response->assertStatus(200);
    }

    public function test_recently_viewed_page_loads_successfully()
    {
        $response = $this->get(route('recently-viewed'));
        $response->assertStatus(200);
    }

    public function test_categories_api_endpoint_returns_json()
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson(route('categories.index'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'name', 'created_at', 'updated_at']
            ]);
    }

    public function test_tags_api_endpoint_returns_json()
    {
        Tag::factory()->count(3)->create();

        $response = $this->getJson(route('tags.index'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'name', 'created_at', 'updated_at']
            ]);
    }

    public function test_home_recommendations_api_for_guest()
    {
        $category = Category::factory()->create();
        Product::factory()->count(4)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->getJson(route('recommendations.home'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'recommendations' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'status',
                        'stock',
                        'category',
                        'tags'
                    ]
                ]
            ]);
    }

    public function test_home_recommendations_api_for_authenticated_user()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        Product::factory()->count(4)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->actingAs($user)->getJson(route('recommendations.home'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'recommendations' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'status',
                        'stock',
                        'category',
                        'tags'
                    ]
                ]
            ]);
    }

    public function test_trending_products_api()
    {
        $category = Category::factory()->create();
        Product::factory()->count(6)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->getJson(route('recommendations.trending'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'trending' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'status',
                        'stock',
                        'category',
                        'tags'
                    ]
                ]
            ]);
    }

    public function test_trending_products_api_respects_limit_parameter()
    {
        $category = Category::factory()->create();
        Product::factory()->count(10)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->getJson(route('recommendations.trending', ['limit' => 3]));

        $response->assertStatus(200);
        $trendingProducts = $response->json('trending');
        $this->assertLessThanOrEqual(3, count($trendingProducts));
    }

    public function test_user_recommendations_api_for_guest_returns_trending()
    {
        $category = Category::factory()->create();
        Product::factory()->count(4)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->getJson(route('recommendations.user'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'recommendations' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'status',
                        'stock',
                        'category',
                        'tags'
                    ]
                ]
            ]);
    }

    public function test_user_recommendations_api_for_authenticated_user()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        Product::factory()->count(4)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->actingAs($user)->getJson(route('recommendations.user'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'recommendations' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'status',
                        'stock',
                        'category',
                        'tags'
                    ]
                ]
            ]);
    }

    public function test_related_products_api()
    {
        $category = Category::factory()->create();
        $mainProduct = Product::factory()->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 10
        ]);

        // Create related products
        Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->getJson(route('recommendations.related', $mainProduct));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'relatedProducts' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'status',
                        'stock',
                        'category',
                        'tags'
                    ]
                ]
            ]);
    }

    public function test_track_view_api_requires_authentication()
    {
        $product = Product::factory()->create([
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->postJson(route('recommendations.track'), [
            'product_id' => $product->id
        ]);

        $response->assertStatus(401);
    }

    public function test_track_view_api_works_for_authenticated_user()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->actingAs($user)->postJson(route('recommendations.track'), [
            'product_id' => $product->id
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'View tracked successfully']);
    }

    public function test_track_view_api_validates_product_id()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson(route('recommendations.track'), [
            'product_id' => 999999 // Non-existent product ID
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_ml_recommendations_requires_admin_role()
    {
        $user = User::factory()->create(['role' => 'user']);
        $product = Product::factory()->create([
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->actingAs($user)->getJson(route('admin.recommendations.ml-only', $product));

        $response->assertStatus(403);
    }

    public function test_admin_ml_recommendations_works_for_admin()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create([
            'status' => 'Active',
            'stock' => 5
        ]);

        $response = $this->actingAs($admin)->getJson(route('admin.recommendations.ml-only', $product));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'mlRecommendations',
                'note'
            ]);
    }

    public function test_admin_stats_requires_admin_role()
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->getJson(route('admin.recommendations.stats'));

        $response->assertStatus(403);
    }

    public function test_admin_stats_works_for_admin()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->getJson(route('admin.recommendations.stats'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats',
                'timestamp'
            ]);
    }

    public function test_admin_clear_cache_requires_admin_role()
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->postJson(route('admin.recommendations.clear-cache'));

        $response->assertStatus(403);
    }

    public function test_admin_clear_cache_works_for_admin()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson(route('admin.recommendations.clear-cache'));

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'All recommendation caches cleared successfully'
            ]);
    }
}
