<?php

namespace App\Console\Commands;

use App\Services\ProductEmbeddingService;
use App\Services\RecommendationService;
use Illuminate\Console\Command;

class GenerateEmbeddings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recommendations:generate-embeddings 
                            {--clear : Clear existing embeddings cache}
                            {--stats : Show embedding statistics}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate or refresh ML embeddings for product recommendations';

    protected $embeddingService;
    protected $recommendationService;

    public function __construct(ProductEmbeddingService $embeddingService, RecommendationService $recommendationService)
    {
        parent::__construct();
        $this->embeddingService = $embeddingService;
        $this->recommendationService = $recommendationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('stats')) {
            $this->showStats();
            return;
        }

        if ($this->option('clear')) {
            $this->info('Clearing embedding caches...');
            $this->embeddingService->clearCache();
            $this->info('✅ Caches cleared successfully');
        }

        $this->info('Starting ML embedding generation...');
        $this->info('This may take a few minutes depending on the number of products.');

        $startTime = microtime(true);

        try {
            // Generate embeddings
            $embeddings = $this->embeddingService->generateEmbeddings();

            $endTime = microtime(true);
            $duration = round($endTime - $startTime, 2);

            $this->info("✅ Embeddings generated successfully in {$duration} seconds");

            // Show statistics
            $this->newLine();
            $this->info('📊 Embedding Statistics:');
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Products Processed', number_format(count($embeddings['vectors']))],
                    ['Vocabulary Size', number_format(count($embeddings['vocabulary']))],
                    ['Vector Dimensions', count(reset($embeddings['vectors']) ?: [])],
                    ['Cache Size', $this->formatBytes(strlen(serialize($embeddings)))],
                    ['Generation Time', "{$duration}s"],
                ]
            );

            // Test similarity for a random product
            if (!empty($embeddings['vectors'])) {
                $this->newLine();
                $this->info('🧪 Testing similarity matching...');

                $productIds = array_keys($embeddings['vectors']);
                $testProductId = $productIds[array_rand($productIds)];

                $similarities = $this->embeddingService->findSimilarProducts($testProductId, 3);

                if (!empty($similarities)) {
                    $this->info("✅ Found " . count($similarities) . " similar products for product ID: {$testProductId}");

                    $this->table(
                        ['Product ID', 'Similarity Score'],
                        array_map(function ($id, $score) {
                            return [$id, round($score, 4)];
                        }, array_keys($similarities), $similarities)
                    );
                } else {
                    $this->warn('⚠️ No similar products found (this is normal for unique products)');
                }
            }
        } catch (\Exception $e) {
            $this->error('❌ Failed to generate embeddings: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }

        $this->newLine();
        $this->info('🎉 ML recommendation system is ready!');
        $this->info('💡 You can now test recommendations through the admin dashboard at /admin/ml-recommendations');

        return 0;
    }

    private function showStats()
    {
        $this->info('📊 ML Recommendation System Statistics');
        $this->newLine();

        try {
            $stats = $this->recommendationService->getStats();

            $this->table(
                ['Component', 'Status', 'Details'],
                [
                    [
                        'Embeddings Cache',
                        $stats['cache_info']['embeddings_cached'] ? '✅ Cached' : '❌ Not Cached',
                        $stats['ml_stats']['total_products'] . ' products analyzed'
                    ],
                    [
                        'Vocabulary',
                        '📚 Ready',
                        number_format($stats['ml_stats']['vocabulary_size']) . ' unique terms'
                    ],
                    [
                        'Vector Space',
                        '🎯 Active',
                        $stats['ml_stats']['vector_dimensions'] . ' dimensions'
                    ],
                    [
                        'Memory Usage',
                        '💾 Cached',
                        $this->formatBytes($stats['ml_stats']['cache_size'])
                    ],
                    [
                        'System',
                        '⚡ Running',
                        'PHP ' . $stats['system_info']['php_version'] . ' | Cache: ' . $stats['system_info']['cache_driver']
                    ]
                ]
            );
        } catch (\Exception $e) {
            $this->error('❌ Could not retrieve statistics: ' . $e->getMessage());
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;

        while ($bytes >= 1024 && $unitIndex < count($units) - 1) {
            $bytes /= 1024;
            $unitIndex++;
        }

        return round($bytes, 2) . ' ' . $units[$unitIndex];
    }
}
