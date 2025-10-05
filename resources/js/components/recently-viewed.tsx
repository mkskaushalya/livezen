import { useRecentlyViewed } from '@/contexts/recently-viewed-context';
import { Link } from '@inertiajs/react';
import { Clock, X } from 'lucide-react';

interface RecentlyViewedProps {
    className?: string;
    showClearButton?: boolean;
}

export default function RecentlyViewed({
    className = '',
    showClearButton = true,
}: RecentlyViewedProps) {
    const { recentProducts, clearRecentProducts } = useRecentlyViewed();

    if (recentProducts.length === 0) {
        return null;
    }

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <div
            className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Recently Viewed
                    </h3>
                </div>
                {showClearButton && (
                    <button
                        onClick={clearRecentProducts}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                        title="Clear recent products"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {recentProducts.slice(0, 5).map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-50"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-xs font-medium text-gray-500">
                                {product.name.substring(0, 2).toUpperCase()}
                            </span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium text-gray-900">
                                {product.name}
                            </h4>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-indigo-600">
                                    LKR {Number(product.price).toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatTime(product.viewedAt)}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {recentProducts.length > 5 && (
                <div className="mt-3 border-t pt-3">
                    <Link
                        href="/recently-viewed"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        View all recently viewed →
                    </Link>
                </div>
            )}
        </div>
    );
}
