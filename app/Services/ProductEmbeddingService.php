<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProductEmbeddingService
{
    private $vocabulary = [];
    private $idfScores = [];
    private $productVectors = [];

    /**
     * Generate embeddings for all products using TF-IDF
     */
    public function generateEmbeddings(): array
    {
        $cacheKey = 'product_embeddings_v2';

        return Cache::remember($cacheKey, 86400, function () { // Cache for 24 hours
            Log::info('Generating product embeddings...');

            $products = Product::with(['category', 'tags'])
                ->where('status', 'Active')
                ->where('stock', '>', 0)
                ->get();

            if ($products->isEmpty()) {
                return ['vectors' => [], 'vocabulary' => [], 'idf' => []];
            }

            // Step 1: Extract text features for each product
            $documents = [];
            $productIds = [];

            foreach ($products as $product) {
                $text = $this->extractProductFeatures($product);
                $documents[] = $text;
                $productIds[] = $product->id;
            }

            // Step 2: Build vocabulary and calculate TF-IDF
            $this->buildVocabulary($documents);
            $this->calculateIDF($documents);

            // Step 3: Generate TF-IDF vectors
            $vectors = [];
            foreach ($documents as $i => $document) {
                $vectors[$productIds[$i]] = $this->calculateTFIDF($document);
            }

            Log::info('Generated embeddings', [
                'products_count' => count($vectors),
                'vocabulary_size' => count($this->vocabulary),
                'vector_dimensions' => count(reset($vectors) ?: [])
            ]);

            return [
                'vectors' => $vectors,
                'vocabulary' => $this->vocabulary,
                'idf' => $this->idfScores
            ];
        });
    }

    /**
     * Extract text features from a product
     */
    private function extractProductFeatures(Product $product): string
    {
        $features = [];

        // Product name (higher weight)
        if ($product->name) {
            $features[] = str_repeat($product->name, 3); // Triple weight for name
        }

        // Product description
        if ($product->description) {
            $features[] = $product->description;
        }

        // Category (higher weight)
        if ($product->category) {
            $features[] = str_repeat($product->category->name, 2); // Double weight for category
        }

        // Tags (higher weight)
        if ($product->tags) {
            foreach ($product->tags as $tag) {
                $features[] = str_repeat($tag->name, 2); // Double weight for tags
            }
        }

        // Price range (categorical feature)
        $priceRange = $this->getPriceCategory($product->price);
        $features[] = str_repeat($priceRange, 1);

        return strtolower(implode(' ', $features));
    }

    /**
     * Categorize price into ranges for similarity
     */
    private function getPriceCategory(float $price): string
    {
        if ($price < 1000) return 'budget_friendly';
        if ($price < 5000) return 'affordable';
        if ($price < 15000) return 'mid_range';
        if ($price < 50000) return 'premium';
        return 'luxury';
    }

    /**
     * Build vocabulary from all documents
     */
    private function buildVocabulary(array $documents): void
    {
        $words = [];

        foreach ($documents as $document) {
            $tokens = $this->tokenize($document);
            foreach ($tokens as $token) {
                $words[$token] = ($words[$token] ?? 0) + 1;
            }
        }

        // Filter out very rare words (appear in less than 2 documents) and very common words
        $totalDocs = count($documents);
        $this->vocabulary = array_keys(array_filter($words, function ($count) use ($totalDocs) {
            return $count >= 2 && $count <= ($totalDocs * 0.8); // Appear in at least 2 docs but not more than 80%
        }));

        // Create word to index mapping
        $this->vocabulary = array_flip($this->vocabulary);
    }

    /**
     * Calculate Inverse Document Frequency for each word
     */
    private function calculateIDF(array $documents): void
    {
        $totalDocs = count($documents);
        $docFreq = [];

        foreach ($documents as $document) {
            $tokens = array_unique($this->tokenize($document));
            foreach ($tokens as $token) {
                if (isset($this->vocabulary[$token])) {
                    $docFreq[$token] = ($docFreq[$token] ?? 0) + 1;
                }
            }
        }

        foreach ($this->vocabulary as $word => $index) {
            $df = $docFreq[$word] ?? 1;
            $this->idfScores[$word] = log($totalDocs / $df);
        }
    }

    /**
     * Calculate TF-IDF vector for a document
     */
    private function calculateTFIDF(string $document): array
    {
        $tokens = $this->tokenize($document);
        $termFreq = array_count_values($tokens);

        $vector = array_fill(0, count($this->vocabulary), 0.0);

        foreach ($termFreq as $term => $tf) {
            if (isset($this->vocabulary[$term])) {
                $index = $this->vocabulary[$term];
                $idf = $this->idfScores[$term] ?? 0;
                $vector[$index] = $tf * $idf;
            }
        }

        // Normalize vector (L2 normalization)
        $magnitude = sqrt(array_sum(array_map(function ($x) {
            return $x * $x;
        }, $vector)));
        if ($magnitude > 0) {
            $vector = array_map(function ($x) use ($magnitude) {
                return $x / $magnitude;
            }, $vector);
        }

        return $vector;
    }

    /**
     * Tokenize text into words
     */
    private function tokenize(string $text): array
    {
        // Remove special characters and split by whitespace
        $text = preg_replace('/[^a-zA-Z0-9\s]/', ' ', $text);
        $tokens = preg_split('/\s+/', trim($text));

        // Filter out short words and common stop words
        $stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'a', 'an'];

        return array_filter($tokens, function ($token) use ($stopWords) {
            return strlen($token) > 2 && !in_array(strtolower($token), $stopWords);
        });
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    public function cosineSimilarity(array $vectorA, array $vectorB): float
    {
        if (count($vectorA) !== count($vectorB)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $magnitudeA = 0.0;
        $magnitudeB = 0.0;

        for ($i = 0; $i < count($vectorA); $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $magnitudeA += $vectorA[$i] * $vectorA[$i];
            $magnitudeB += $vectorB[$i] * $vectorB[$i];
        }

        $magnitude = sqrt($magnitudeA) * sqrt($magnitudeB);

        return $magnitude > 0 ? $dotProduct / $magnitude : 0.0;
    }

    /**
     * Find most similar products using ML embeddings
     */
    public function findSimilarProducts(string $productId, int $limit = 5): array
    {
        $embeddings = $this->generateEmbeddings();
        $vectors = $embeddings['vectors'];

        if (!isset($vectors[$productId])) {
            return [];
        }

        $targetVector = $vectors[$productId];
        $similarities = [];

        foreach ($vectors as $id => $vector) {
            if ($id !== $productId) {
                $similarity = $this->cosineSimilarity($targetVector, $vector);
                if ($similarity > 0.1) { // Minimum similarity threshold
                    $similarities[$id] = $similarity;
                }
            }
        }

        // Sort by similarity descending
        arsort($similarities);

        return array_slice($similarities, 0, $limit, true);
    }

    /**
     * Get embedding for a single product (for new products)
     */
    public function getProductEmbedding(Product $product): array
    {
        $embeddings = $this->generateEmbeddings();
        $this->vocabulary = $embeddings['vocabulary'];
        $this->idfScores = $embeddings['idf'];

        $text = $this->extractProductFeatures($product);
        return $this->calculateTFIDF($text);
    }

    /**
     * Clear embeddings cache (useful for retraining)
     */
    public function clearCache(): void
    {
        Cache::forget('product_embeddings_v2');
        Cache::forget('ml_similar_products_*');
        Log::info('Product embeddings cache cleared');
    }

    /**
     * Get embedding statistics
     */
    public function getStats(): array
    {
        $embeddings = $this->generateEmbeddings();

        return [
            'total_products' => count($embeddings['vectors']),
            'vocabulary_size' => count($embeddings['vocabulary']),
            'vector_dimensions' => count(reset($embeddings['vectors']) ?: []),
            'cache_size' => strlen(serialize($embeddings)),
            'last_updated' => Cache::has('product_embeddings_v2') ? 'Cached' : 'Fresh'
        ];
    }
}
