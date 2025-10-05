import Footer from '@/components/footer';
import NavStore from '@/components/nav-store';
import ProductEditButton from '@/components/products/product-edit-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import WishlistButton from '@/components/wishlist-button';
import { useCart } from '@/contexts/cart-context';
import { useRecentlyViewed } from '@/contexts/recently-viewed-context';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';

type RecentProduct = {
    id: string;
    name: string;
    price: number;
    status: 'Active' | 'Low Stock' | 'Out of Stock';
    stock: number;
    category?: {
        id: string;
        name: string;
    };
    viewedAt: number;
};

export default function RecentlyViewedPage() {
    const { recentProducts, clearRecentProducts } = useRecentlyViewed();
    const { addToCart } = useCart();

    const handleAddToCart = (product: RecentProduct) => {
        if (product.status === 'Out of Stock' || product.stock <= 0) {
            toast.error('This product is out of stock');
            return;
        }
        if (product.status === 'Low Stock') {
            toast.warning(
                `${product.name} is low in stock! Only ${product.stock} left.`,
            );
        }
        addToCart(product, 1);
        toast.success(`${product.name} added to cart!`);
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0)
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Low Stock':
                return 'bg-yellow-100 text-yellow-800';
            case 'Out of Stock':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head title="Recently Viewed Products" />
            <div className="min-h-screen bg-gray-50">
                <NavStore />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-3">
                                    <Clock className="h-8 w-8 text-indigo-600" />
                                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                        Recently Viewed Products
                                    </h1>
                                </div>
                                <p className="text-lg text-gray-600">
                                    Products you've viewed recently -{' '}
                                    {recentProducts.length} item
                                    {recentProducts.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {recentProducts.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={clearRecentProducts}
                                    className="flex items-center gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {recentProducts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                    No recently viewed products
                                </h3>
                                <p className="mb-6 text-gray-500">
                                    Start browsing products to see your viewing
                                    history here
                                </p>
                                <Link href="/products">
                                    <Button>
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Browse Products
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {recentProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group transition-shadow duration-200 hover:shadow-lg"
                                >
                                    <CardContent className="p-4">
                                        {/* Product Image Placeholder */}
                                        <div className="relative mb-4">
                                            <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                                                <ShoppingBag className="h-12 w-12 text-gray-400" />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <ProductEditButton
                                                    product={product}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="bg-white/80 shadow-sm hover:bg-white"
                                                />
                                                <WishlistButton
                                                    productId={product.id}
                                                    className="shadow-md"
                                                />
                                            </div>

                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(product.status)}`}
                                                >
                                                    {product.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="space-y-3">
                                            <div>
                                                <Link
                                                    href={`/products/${product.id}`}
                                                >
                                                    <h3 className="line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                                                        {product.name}
                                                    </h3>
                                                </Link>

                                                {product.category && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {product.category.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-lg font-bold text-indigo-600">
                                                        LKR{' '}
                                                        {Number(
                                                            product.price,
                                                        ).toLocaleString()}
                                                    </span>
                                                    <p className="text-xs text-gray-500">
                                                        Stock: {product.stock}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">
                                                        Viewed{' '}
                                                        {formatTime(
                                                            product.viewedAt,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="flex-1"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        View Details
                                                    </Button>
                                                </Link>

                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAddToCart(product)
                                                    }
                                                    disabled={
                                                        product.status ===
                                                            'Out of Stock' ||
                                                        product.stock <= 0
                                                    }
                                                    className="flex-1"
                                                >
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Additional Actions */}
                    {recentProducts.length > 0 && (
                        <div className="mt-12 text-center">
                            <div className="inline-flex gap-4">
                                <Link href="/products">
                                    <Button variant="outline">
                                        Browse More Products
                                    </Button>
                                </Link>

                                <Link href="/wishlist">
                                    <Button variant="outline">
                                        View Wishlist
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </>
    );
}
