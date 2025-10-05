import ProductEditButton from '@/components/products/product-edit-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WishlistButton from '@/components/wishlist-button';
import { useCart } from '@/contexts/cart-context';
import { Link } from '@inertiajs/react';
import { ShoppingBagIcon, Sparkles, TrendingUpIcon } from 'lucide-react';
import { toast } from 'sonner';

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

type Product = {
    id: string;
    name: string;
    category?: Category;
    price: number;
    stock: number;
    description?: string;
    tags?: Tag[];
    status: 'Active' | 'Low Stock' | 'Out of Stock';
};

interface RecommendedProductsProps {
    products: Product[];
    title?: string;
    subtitle?: string;
    showViewAll?: boolean;
    viewAllLink?: string;
    className?: string;
}

export default function RecommendedProducts({
    products,
    title = 'Recommended for You',
    subtitle = 'Products picked just for you based on your interests',
    showViewAll = false,
    viewAllLink = '/products',
    className = '',
}: RecommendedProductsProps) {
    const { addToCart } = useCart();

    const handleAddToCart = (product: Product) => {
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

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className={`py-16 sm:py-24 ${className}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-4 flex items-center justify-center gap-2">
                        <TrendingUpIcon className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {title}
                        </h2>
                        <div title="AI-powered recommendations">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                        </div>
                    </div>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                        {subtitle}
                    </p>
                </div>

                {/* Products Grid */}
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
                        >
                            {/* Action buttons */}
                            <div className="absolute top-2 right-2 z-10 flex gap-2">
                                <ProductEditButton
                                    product={product}
                                    size="icon"
                                    variant="ghost"
                                    className="bg-white/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-white"
                                />
                                <WishlistButton productId={product.id} />
                            </div>

                            {/* Product Image */}
                            <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                                <div className="flex h-full items-center justify-center">
                                    <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <Link href={`/products/${product.id}`}>
                                        <h3 className="line-clamp-2 text-lg font-medium text-gray-900 hover:text-indigo-600">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <Badge
                                        variant={
                                            product.status === 'Active'
                                                ? 'secondary'
                                                : product.status === 'Low Stock'
                                                  ? 'default'
                                                  : 'destructive'
                                        }
                                    >
                                        {product.status}
                                    </Badge>
                                </div>

                                {product.category && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {product.category.name}
                                    </p>
                                )}

                                {product.description && (
                                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                        {product.description}
                                    </p>
                                )}

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-indigo-600">
                                            LKR{' '}
                                            {Number(
                                                product.price,
                                            ).toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {product.stock} in stock
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={
                                            product.status === 'Out of Stock' ||
                                            product.stock <= 0
                                        }
                                    >
                                        Add to Cart
                                    </Button>
                                </div>

                                {product.tags && product.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {product.tags.slice(0, 2).map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                #{tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                {showViewAll && (
                    <div className="mt-12 text-center">
                        <Link href={viewAllLink}>
                            <Button size="lg" variant="outline">
                                View All Products
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
