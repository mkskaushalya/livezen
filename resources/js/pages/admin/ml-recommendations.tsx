import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Brain,
    CheckCircle,
    Database,
    RefreshCw,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MLStats {
    total_products: number;
    vocabulary_size: number;
    vector_dimensions: number;
    cache_size: number;
    last_updated: string;
}

interface CacheInfo {
    trending_cached: boolean;
    embeddings_cached: boolean;
}

interface SystemInfo {
    php_version: string;
    laravel_version: string;
    cache_driver: string;
}

interface Stats {
    ml_stats: MLStats;
    cache_info: CacheInfo;
    system_info: SystemInfo;
}

interface PageProps {
    stats: Stats;
    [key: string]: unknown;
}

export default function MLRecommendationsDashboard() {
    const { props } = usePage<PageProps>();
    const { stats } = props;
    const [isClearing, setIsClearing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleClearCache = async () => {
        if (
            !confirm(
                'Are you sure you want to clear all recommendation caches? This will temporarily slow down recommendations until they are rebuilt.',
            )
        ) {
            return;
        }

        setIsClearing(true);
        try {
            const response = await fetch(
                '/api/admin/recommendations/clear-cache',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                toast.success(
                    'Caches cleared successfully! ML embeddings will be regenerated on next request.',
                );
                // Refresh the page to show updated stats
                setTimeout(() => {
                    router.reload();
                }, 1000);
            } else {
                toast.error('Failed to clear caches');
            }
        } catch (error) {
            toast.error('Error clearing caches');
            console.error('Error:', error);
        } finally {
            setIsClearing(false);
        }
    };

    const handleRefreshStats = () => {
        setIsRefreshing(true);
        router.reload({ only: ['stats'] });
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const formatCacheSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="ML Recommendations Dashboard" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
                                <Brain className="h-8 w-8 text-indigo-600" />
                                ML Recommendations Dashboard
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Monitor and manage your AI-powered
                                recommendation system
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleRefreshStats}
                                disabled={isRefreshing}
                            >
                                <RefreshCw
                                    className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                Refresh Stats
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleClearCache}
                                disabled={isClearing}
                            >
                                {isClearing ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Database className="mr-2 h-4 w-4" />
                                )}
                                Clear All Caches
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Products */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Products Analyzed
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.ml_stats.total_products.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vocabulary Size */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Database className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Vocabulary Size
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.ml_stats.vocabulary_size.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vector Dimensions */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Zap className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Vector Dimensions
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.ml_stats.vector_dimensions}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cache Size */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Database className="h-8 w-8 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Cache Size
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCacheSize(
                                            stats.ml_stats.cache_size,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* ML System Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                ML System Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Embeddings Cache
                                </span>
                                <Badge
                                    variant={
                                        stats.cache_info.embeddings_cached
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {stats.cache_info.embeddings_cached ? (
                                        <>
                                            <CheckCircle className="mr-1 h-3 w-3" />{' '}
                                            Cached
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="mr-1 h-3 w-3" />{' '}
                                            Not Cached
                                        </>
                                    )}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Trending Cache
                                </span>
                                <Badge
                                    variant={
                                        stats.cache_info.trending_cached
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {stats.cache_info.trending_cached ? (
                                        <>
                                            <CheckCircle className="mr-1 h-3 w-3" />{' '}
                                            Cached
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="mr-1 h-3 w-3" />{' '}
                                            Not Cached
                                        </>
                                    )}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Last Updated
                                </span>
                                <span className="text-sm text-gray-600">
                                    {stats.ml_stats.last_updated}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    PHP Version
                                </span>
                                <Badge variant="outline">
                                    {stats.system_info.php_version}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Laravel Version
                                </span>
                                <Badge variant="outline">
                                    {stats.system_info.laravel_version}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Cache Driver
                                </span>
                                <Badge variant="outline">
                                    {stats.system_info.cache_driver}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* How It Works Section */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            How the ML Recommendations Work
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none">
                            <h4 className="mb-3 text-lg font-semibold">
                                Hybrid Approach: Rule-Based + Machine Learning
                            </h4>

                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <h5 className="mb-2 font-semibold text-blue-900">
                                        🎯 Rule-Based (70%)
                                    </h5>
                                    <ul className="space-y-1 text-sm text-blue-800">
                                        <li>• Same category products</li>
                                        <li>• Similar price range (±30%)</li>
                                        <li>• Shared tags/keywords</li>
                                        <li>• User's browsing history</li>
                                    </ul>
                                </div>

                                <div className="rounded-lg bg-purple-50 p-4">
                                    <h5 className="mb-2 font-semibold text-purple-900">
                                        🤖 Machine Learning (30%)
                                    </h5>
                                    <ul className="space-y-1 text-sm text-purple-800">
                                        <li>• TF-IDF vectorization</li>
                                        <li>• Cosine similarity matching</li>
                                        <li>• Text feature extraction</li>
                                        <li>• Vector space modeling</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <h5 className="mb-2 font-semibold">
                                    📊 Feature Extraction Process:
                                </h5>
                                <p className="mb-2 text-sm text-gray-700">
                                    The ML system analyzes product features to
                                    create numerical representations:
                                </p>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li>
                                        • <strong>Name</strong> (3x weight) -
                                        Product title analysis
                                    </li>
                                    <li>
                                        • <strong>Description</strong> - Content
                                        similarity
                                    </li>
                                    <li>
                                        • <strong>Category</strong> (2x weight)
                                        - Categorical matching
                                    </li>
                                    <li>
                                        • <strong>Tags</strong> (2x weight) -
                                        Keyword analysis
                                    </li>
                                    <li>
                                        • <strong>Price Range</strong> -
                                        Categorical pricing tiers
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
