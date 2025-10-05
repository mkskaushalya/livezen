import Footer from '@/components/footer';
import NavStore from '@/components/nav-store';
import WishlistButton from '@/components/wishlist-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import { useRecentlyViewed } from '@/contexts/recently-viewed-context';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, ShoppingBagIcon } from 'lucide-react';
import * as React from 'react';
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
    product: Product;
    relatedProducts: Product[];
    [key: string]: unknown;
}

export default function ProductShow() {
    const { props } = usePage<PageProps>();
    const { product, relatedProducts } = props;
    const { addToCart } = useCart();
    const { addRecentProduct } = useRecentlyViewed();

    const [quantity, setQuantity] = React.useState(1);

    // Track product view
    React.useEffect(() => {
        addRecentProduct({
            id: product.id,
            name: product.name,
            price: product.price,
            status: product.status,
        });
    }, [product.id, product.name, product.price, product.status, addRecentProduct]);

    const handleAddToCart = () => {
        if (product.status === 'Out of Stock' || product.stock <= 0) {
            toast.error('This product is out of stock');
            return;
        }
        if (quantity > product.stock) {
            toast.error(`Only ${product.stock} items available in stock`);
            return;
        }
        if (product.status === 'Low Stock') {
            toast.warning(
                `${product.name} is low in stock! Only ${product.stock} left.`,
            );
        }
        addToCart(product, quantity);
        toast.success(`${quantity} x ${product.name} added to cart!`);
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavStore />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to Products
                    </Link>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                    {/* Product Image */}
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="flex h-full items-center justify-center">
                            <ShoppingBagIcon className="h-32 w-32 text-gray-400" />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                        <div className="flex items-start justify-between">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                {product.name}
                            </h1>
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
                            <p className="mt-2 text-lg text-gray-600">
                                {product.category.name}
                            </p>
                        )}

                        <div className="mt-3">
                            <p className="text-3xl font-bold tracking-tight text-indigo-600">
                                LKR {Number(product.price).toLocaleString()}
                            </p>
                        </div>

                        {/* Stock Info */}
                        <div className="mt-6">
                            <div className="flex items-center">
                                <span className="text-sm text-gray-600">
                                    {product.stock > 0 ? (
                                        <>
                                            <span className="font-medium text-green-600">
                                                In stock
                                            </span>{' '}
                                            ({product.stock} available)
                                        </>
                                    ) : (
                                        <span className="font-medium text-red-600">
                                            Out of stock
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900">
                                    Description
                                </h3>
                                <div className="mt-2 space-y-6">
                                    <p className="text-base text-gray-900">
                                        {product.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900">
                                    Tags
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {product.tags.map((tag) => (
                                        <Badge key={tag.id} variant="outline">
                                            #{tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator className="my-8" />

                        {/* Add to Cart */}
                        <div className="mt-10">
                            <div className="flex items-center space-x-4">
                                {/* Quantity Selector */}
                                <div className="flex items-center">
                                    <label
                                        htmlFor="quantity"
                                        className="sr-only"
                                    >
                                        Quantity
                                    </label>
                                    <div className="flex items-center rounded-md border border-gray-300">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleQuantityChange(
                                                    quantity - 1,
                                                )
                                            }
                                            disabled={quantity <= 1}
                                            className="px-3 py-1"
                                        >
                                            -
                                        </Button>
                                        <span className="min-w-[3rem] px-3 py-1 text-center text-sm font-medium">
                                            {quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleQuantityChange(
                                                    quantity + 1,
                                                )
                                            }
                                            disabled={quantity >= product.stock}
                                            className="px-3 py-1"
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={
                                            product.status === 'Out of Stock' ||
                                            product.stock <= 0
                                        }
                                        className="flex-1"
                                        size="lg"
                                    >
                                        Add to Cart
                                    </Button>
                                    
                                    <WishlistButton 
                                        productId={product.id} 
                                        className="shadow-md"
                                    />
                                </div>
                            </div>

                            {product.stock > 0 && product.stock <= 5 && (
                                <p className="mt-4 text-sm text-amber-600">
                                    Only {product.stock} left in stock - order
                                    soon!
                                </p>
                            )}
                        </div>

                        {/* Product Features */}
                        <div className="mt-10">
                            <div className="border-t border-gray-200 pt-10">
                                <h3 className="text-sm font-medium text-gray-900">
                                    Highlights
                                </h3>
                                <div className="mt-4">
                                    <ul className="list-inside list-disc space-y-2 text-sm text-gray-600">
                                        <li>Fast and secure delivery</li>
                                        <li>30-day return policy</li>
                                        <li>Secure payment processing</li>
                                        <li>Customer support available</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Related Products
                        </h2>
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct) => (
                                <div
                                    key={relatedProduct.id}
                                    className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
                                >
                                    <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                                        <div className="flex h-full items-center justify-center">
                                            <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <Link
                                            href={`/products/${relatedProduct.id}`}
                                        >
                                            <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-indigo-600">
                                                {relatedProduct.name}
                                            </h3>
                                        </Link>
                                        <p className="mt-1 text-lg font-medium text-indigo-600">
                                            LKR{' '}
                                            {Number(
                                                relatedProduct.price,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
