<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RecommendationService
{
    protected $embeddingService;

    public function __construct(ProductEmbeddingService $embeddingService)
    {
        $this->embeddingService = $embeddingService;
    }

    /**
     * Get recommended products for a specific product (Hybrid: Rule-based + ML)
     */
    public function getRelatedProducts(Product $product, int $limit = 4): Collection
    {
        $cacheKey = "hybrid_related_products_{$product->id}_{$limit}";

        return Cache::remember($cacheKey, 3600, function () use ($product, $limit) {
            Log::info("Generating hybrid recommendations for product: {$product->id}");

            // Get rule-based recommendations (70% of results)
            $ruleBasedLimit = max(1, ceil($limit * 0.7));
            $ruleBasedProducts = $this->getRuleBasedRelatedProducts($product, $ruleBasedLimit);

            // Get ML-based recommendations (30% of results)  
            $mlLimit = $limit - $ruleBasedProducts->count();
            $excludeIds = array_merge([$product->id], $ruleBasedProducts->pluck('id')->toArray());
            $mlProducts = $this->getMLBasedRelatedProducts($product, $mlLimit, $excludeIds);

            // Combine results with rule-based having higher priority
            $hybridRecommendations = $ruleBasedProducts->merge($mlProducts);

            Log::info("Hybrid recommendations generated", [
                'rule_based_count' => $ruleBasedProducts->count(),
                'ml_based_count' => $mlProducts->count(),
                'total_count' => $hybridRecommendations->count()
            ]);

            // Ensure we return an Eloquent Collection
            $limitedResults = $hybridRecommendations->take($limit);
            return new Collection($limitedResults->values()->all());
        });
    }

    /**
     * Get rule-based related products (original algorithm)
     */
    private function getRuleBasedRelatedProducts(Product $product, int $limit): Collection
    {
        $recommendations = collect();

        // 1. Products in same category (highest priority)
        if ($product->category_id) {
            $categoryProducts = Product::where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->inRandomOrder()
                ->limit($limit)
                ->get();

            $recommendations = $recommendations->merge($categoryProducts);
        }

        // 2. Products with similar price range (±30%)
        if ($recommendations->count() < $limit) {
            $priceMin = $product->price * 0.7;
            $priceMax = $product->price * 1.3;

            $priceProducts = Product::whereBetween('price', [$priceMin, $priceMax])
                ->where('id', '!=', $product->id)
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->whereNotIn('id', $recommendations->pluck('id'))
                ->inRandomOrder()
                ->limit($limit - $recommendations->count())
                ->get();

            $recommendations = $recommendations->merge($priceProducts);
        }

        // 3. Products with shared tags
        if ($recommendations->count() < $limit && $product->tags->count() > 0) {
            $tagIds = $product->tags->pluck('id');

            $tagProducts = Product::whereHas('tags', function ($query) use ($tagIds) {
                $query->whereIn('tags.id', $tagIds);
            })
                ->where('id', '!=', $product->id)
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->whereNotIn('id', $recommendations->pluck('id'))
                ->inRandomOrder()
                ->limit($limit - $recommendations->count())
                ->get();

            $recommendations = $recommendations->merge($tagProducts);
        }

        // Convert to Eloquent Collection and take the required limit
        $limitedRecommendations = $recommendations->take($limit);

        // Ensure we return an Eloquent Collection
        return new Collection($limitedRecommendations->values()->all());
    }

    /**
     * Get ML-based related products using embeddings
     */
    private function getMLBasedRelatedProducts(Product $product, int $limit, array $excludeIds = []): Collection
    {
        if ($limit <= 0) {
            return new Collection();
        }

        try {
            // Get similar products using ML embeddings
            $similarities = $this->embeddingService->findSimilarProducts($product->id, $limit * 2); // Get more candidates

            if (empty($similarities)) {
                Log::info("No ML similarities found for product: {$product->id}");
                return new Collection();
            }

            // Filter out excluded products and get product models
            $candidateIds = array_keys($similarities);
            $filteredIds = array_diff($candidateIds, $excludeIds);
            $limitedIds = array_slice($filteredIds, 0, $limit);

            $mlProducts = Product::whereIn('id', $limitedIds)
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->get();

            // Sort by similarity score
            $mlProducts = $mlProducts->sortByDesc(function ($product) use ($similarities) {
                return $similarities[$product->id] ?? 0;
            });

            Log::info("ML recommendations found", [
                'similarities_count' => count($similarities),
                'after_filtering' => count($limitedIds),
                'final_products' => $mlProducts->count()
            ]);

            return $mlProducts->values();
        } catch (\Exception $e) {
            Log::warning("ML recommendations failed, falling back to rule-based", [
                'error' => $e->getMessage(),
                'product_id' => $product->id
            ]);

            // Fallback to rule-based if ML fails
            return $this->getPopularProducts($limit, array_merge($excludeIds, [$product->id]));
        }
    }

    /**
     * Get personalized recommendations for a user (Hybrid: Rule-based + ML)
     */
    public function getPersonalizedRecommendations(User $user, int $limit = 8): Collection
    {
        $cacheKey = "hybrid_user_recommendations_{$user->id}_{$limit}";

        return Cache::remember($cacheKey, 1800, function () use ($user, $limit) {
            $viewedProductIds = $this->getUserViewHistory($user);

            if (empty($viewedProductIds)) {
                // Return popular products for new users
                return $this->getPopularProducts($limit);
            }

            Log::info("Generating hybrid personalized recommendations", [
                'user_id' => $user->id,
                'viewed_products' => count($viewedProductIds),
                'limit' => $limit
            ]);

            // Get rule-based recommendations (60% of results)
            $ruleBasedLimit = max(1, ceil($limit * 0.6));
            $ruleBasedProducts = $this->getRuleBasedPersonalizedProducts($user, $viewedProductIds, $ruleBasedLimit);

            // Get ML-based recommendations (40% of results)
            $mlLimit = $limit - $ruleBasedProducts->count();
            $mlProducts = $this->getMLBasedPersonalizedProducts($user, $viewedProductIds, $mlLimit, $ruleBasedProducts->pluck('id')->toArray());

            // Combine results
            $hybridRecommendations = $ruleBasedProducts->merge($mlProducts);

            Log::info("Hybrid personalized recommendations generated", [
                'rule_based_count' => $ruleBasedProducts->count(),
                'ml_based_count' => $mlProducts->count(),
                'total_count' => $hybridRecommendations->count()
            ]);

            // Ensure we return an Eloquent Collection
            $limitedResults = $hybridRecommendations->take($limit);
            return new Collection($limitedResults->values()->all());
        });
    }

    /**
     * Get rule-based personalized products
     */
    private function getRuleBasedPersonalizedProducts(User $user, array $viewedProductIds, int $limit): Collection
    {
        $recommendations = collect();
        $viewedProducts = Product::whereIn('id', $viewedProductIds)->get();

        // Analyze user's preferences
        $preferredCategories = $viewedProducts->pluck('category_id')->filter()->unique();
        $averagePrice = $viewedProducts->avg('price');
        $preferredTags = $viewedProducts->load('tags')->pluck('tags')->flatten()->pluck('id')->unique();

        // 1. Products in preferred categories
        if ($preferredCategories->count() > 0) {
            $categoryRecommendations = Product::whereIn('category_id', $preferredCategories)
                ->whereNotIn('id', $viewedProductIds)
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->inRandomOrder()
                ->limit(ceil($limit * 0.5))
                ->get();

            $recommendations = $recommendations->merge($categoryRecommendations);
        }

        // 2. Products in similar price range
        if ($averagePrice && $recommendations->count() < $limit) {
            $priceMin = $averagePrice * 0.6;
            $priceMax = $averagePrice * 1.4;

            $priceRecommendations = Product::whereBetween('price', [$priceMin, $priceMax])
                ->whereNotIn('id', $viewedProductIds)
                ->whereNotIn('id', $recommendations->pluck('id'))
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->inRandomOrder()
                ->limit(ceil($limit * 0.3))
                ->get();

            $recommendations = $recommendations->merge($priceRecommendations);
        }

        // 3. Products with preferred tags
        if ($preferredTags->count() > 0 && $recommendations->count() < $limit) {
            $tagRecommendations = Product::whereHas('tags', function ($query) use ($preferredTags) {
                $query->whereIn('tags.id', $preferredTags);
            })
                ->whereNotIn('id', $viewedProductIds)
                ->whereNotIn('id', $recommendations->pluck('id'))
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->inRandomOrder()
                ->limit($limit - $recommendations->count())
                ->get();

            $recommendations = $recommendations->merge($tagRecommendations);
        }

        // Ensure we return an Eloquent Collection
        $limitedResults = $recommendations->take($limit);
        return new Collection($limitedResults->values()->all());
    }

    /**
     * Get ML-based personalized products
     */
    private function getMLBasedPersonalizedProducts(User $user, array $viewedProductIds, int $limit, array $excludeIds = []): Collection
    {
        if ($limit <= 0) {
            return new Collection();
        }

        try {
            $mlRecommendations = collect();

            // Get ML-based similarities for each recently viewed product (focus on last 5)
            $recentProductIds = array_slice($viewedProductIds, 0, 5);
            $allSimilarities = [];

            foreach ($recentProductIds as $productId) {
                $similarities = $this->embeddingService->findSimilarProducts($productId, $limit);

                // Weight similarities by recency (more recent views have higher weight)
                $position = array_search($productId, $recentProductIds);
                $weight = 1 - ($position * 0.1); // Decrease weight by 10% for each position

                foreach ($similarities as $similarProductId => $similarity) {
                    $weightedSimilarity = $similarity * $weight;
                    $allSimilarities[$similarProductId] = max(
                        $allSimilarities[$similarProductId] ?? 0,
                        $weightedSimilarity
                    );
                }
            }

            // Filter out viewed and excluded products
            $allExcludeIds = array_merge($viewedProductIds, $excludeIds);
            $filteredSimilarities = array_diff_key($allSimilarities, array_flip($allExcludeIds));

            // Sort by similarity score and get top candidates
            arsort($filteredSimilarities);
            $topCandidates = array_slice($filteredSimilarities, 0, $limit, true);

            if (!empty($topCandidates)) {
                $candidateIds = array_keys($topCandidates);
                $mlRecommendations = Product::whereIn('id', $candidateIds)
                    ->where('status', 'Active')
                    ->where('stock', '>', 0)
                    ->get();

                // Sort by similarity score
                $mlRecommendations = $mlRecommendations->sortByDesc(function ($product) use ($topCandidates) {
                    return $topCandidates[$product->id] ?? 0;
                })->values();
            }

            // Ensure we return an Eloquent Collection
            $limitedResults = $mlRecommendations->take($limit);
            return new Collection($limitedResults->values()->all());
        } catch (\Exception $e) {
            Log::warning("ML personalized recommendations failed", [
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);

            // Fallback to popular products
            return $this->getPopularProducts($limit, array_merge($viewedProductIds, $excludeIds));
        }
    }

    /**
     * Get popular products
     */
    public function getPopularProducts(int $limit = 8, array $excludeIds = []): Collection
    {
        return Product::where('status', 'Active')
            ->where('stock', '>', 0)
            ->whereNotIn('id', $excludeIds)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Track product view for recommendation engine
     */
    public function trackProductView(User $user, Product $product): void
    {
        $cacheKey = "user_views_{$user->id}";
        $views = Cache::get($cacheKey, []);

        // Add product to beginning of array (most recent first)
        array_unshift($views, $product->id);

        // Keep only last 50 views and remove duplicates
        $views = array_unique($views);
        $views = array_slice($views, 0, 50);

        // Cache for 30 days
        Cache::put($cacheKey, $views, 60 * 24 * 30);

        // Clear user recommendations cache to refresh
        Cache::forget("user_recommendations_{$user->id}_8");
        Cache::forget("user_recommendations_{$user->id}_4");
    }

    /**
     * Get user's view history
     */
    private function getUserViewHistory(User $user): array
    {
        $cacheKey = "user_views_{$user->id}";
        return Cache::get($cacheKey, []);
    }

    /**
     * Get trending products based on recent activity
     */
    public function getTrendingProducts(int $limit = 6): Collection
    {
        $cacheKey = "trending_products_{$limit}";

        return Cache::remember($cacheKey, 3600, function () use ($limit) {
            // For now, return recent products. In a real app, you'd track views/purchases
            return Product::where('status', 'Active')
                ->where('stock', '>', 0)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Clear user's recommendation cache
     */
    public function clearUserRecommendations(User $user): void
    {
        Cache::forget("user_recommendations_{$user->id}_8");
        Cache::forget("user_recommendations_{$user->id}_4");
        Cache::forget("hybrid_user_recommendations_{$user->id}_8");
        Cache::forget("hybrid_user_recommendations_{$user->id}_4");
        Cache::forget("user_views_{$user->id}");
    }

    /**
     * Clear all recommendation caches
     */
    public function clearAllRecommendationCaches(): void
    {
        // Clear product embedding cache
        $this->embeddingService->clearCache();

        // Clear recommendation caches (this is a simplified approach)
        // In production, you might want to use cache tags for better management
        Cache::flush(); // WARNING: This clears ALL cache - use carefully in production

        Log::info('All recommendation caches cleared');
    }

    /**
     * Get recommendation system statistics
     */
    public function getStats(): array
    {
        $embeddingStats = $this->embeddingService->getStats();

        return [
            'ml_stats' => $embeddingStats,
            'cache_info' => [
                'trending_cached' => Cache::has('trending_products_6'),
                'embeddings_cached' => Cache::has('product_embeddings_v2'),
            ],
            'system_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'cache_driver' => config('cache.default'),
            ]
        ];
    }

    /**
     * Get pure ML-based recommendations (for testing/comparison)
     */
    public function getMLOnlyRecommendations(Product $product, int $limit = 4): Collection
    {
        try {
            $similarities = $this->embeddingService->findSimilarProducts($product->id, $limit * 2);
            $candidateIds = array_keys($similarities);
            $limitedIds = array_slice($candidateIds, 0, $limit);

            $mlProducts = Product::whereIn('id', $limitedIds)
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->get();

            return $mlProducts->sortByDesc(function ($p) use ($similarities) {
                return $similarities[$p->id] ?? 0;
            })->values();
        } catch (\Exception $e) {
            Log::error("ML-only recommendations failed", ['error' => $e->getMessage()]);
            return new Collection();
        }
    }
}
