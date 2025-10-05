import { useRecentlyViewed } from '@/contexts/recently-viewed-context';
import { Link } from '@inertiajs/react';
import { Clock, X } from 'lucide-react';

interface RecentlyViewedProps {
    className?: string;
    showClearButton?: boolean;
}

export default function RecentlyViewed({ 
    className = '', 
    showClearButton = true 
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
        <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Recently Viewed
                    </h3>
                </div>
                {showClearButton && (
                    <button
                        onClick={clearRecentProducts}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
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
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-500 font-medium">
                                {product.name.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
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
                <div className="mt-3 pt-3 border-t">
                    <Link
                        href="/products"
                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        View all products →
                    </Link>
                </div>
            )}
        </div>
    );
}