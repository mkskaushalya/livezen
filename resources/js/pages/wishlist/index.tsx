import Footer from '@/components/footer';
import NavStore from '@/components/nav-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { Head, Link, router } from '@inertiajs/react';
import { Heart, ShoppingBagIcon, Trash2 } from 'lucide-react';
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

interface PageProps {
    wishlistItems: Product[];
    [key: string]: unknown;
}

export default function WishlistIndex({ wishlistItems }: PageProps) {
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

    const handleRemoveFromWishlist = async (productId: string) => {
        try {
            const response = await fetch('/wishlist', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ product_id: productId }),
            });

            if (response.ok) {
                toast.success('Product removed from wishlist');
                router.reload();
            } else {
                toast.error('Failed to remove from wishlist');
            }
        } catch {
            toast.error('Failed to remove from wishlist');
        }
    };

    return (
        <>
            <Head title="My Wishlist" />
            <div className="min-h-screen bg-gray-50">
                <NavStore />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            My Wishlist
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            {wishlistItems.length} items saved for later
                        </p>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="py-16 text-center">
                            <Heart className="mx-auto h-16 w-16 text-gray-300" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Your wishlist is empty
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Start adding products you love to your wishlist.
                            </p>
                            <Link href="/products">
                                <Button className="mt-4">
                                    Browse Products
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {wishlistItems.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
                                >
                                    {/* Remove from wishlist button */}
                                    <button
                                        onClick={() =>
                                            handleRemoveFromWishlist(product.id)
                                        }
                                        className="absolute top-2 right-2 z-10 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-red-50 hover:text-red-600"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                                        <div className="flex h-full items-center justify-center">
                                            <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <Link
                                                href={`/products/${product.id}`}
                                            >
                                                <h3 className="line-clamp-2 text-lg font-medium text-gray-900 hover:text-indigo-600">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                            <Badge
                                                variant={
                                                    product.status === 'Active'
                                                        ? 'secondary'
                                                        : product.status ===
                                                            'Low Stock'
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
                                                onClick={() =>
                                                    handleAddToCart(product)
                                                }
                                                disabled={
                                                    product.status ===
                                                        'Out of Stock' ||
                                                    product.stock <= 0
                                                }
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>

                                        {product.tags &&
                                            product.tags.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {product.tags
                                                        .slice(0, 3)
                                                        .map((tag) => (
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
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}
