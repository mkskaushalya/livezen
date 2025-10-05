import Footer from '@/components/footer';
import NavStore from '@/components/nav-store';
import RecentlyViewed from '@/components/recently-viewed';
import RecommendedProducts from '@/components/recommended-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Clock,
    CreditCard,
    Heart,
    Package,
    ShoppingBag,
    TrendingUp,
    User,
} from 'lucide-react';
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

type OrderItem = {
    id: string;
    quantity: number;
    price: number;
    product: Product;
};

type Order = {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    order_items: OrderItem[];
};

type Stats = {
    total_orders: number;
    pending_orders: number;
    wishlist_count: number;
    total_spent: number;
};

interface PageProps {
    orders: Order[];
    wishlistItems: Product[];
    recommendedProducts: Product[];
    stats: Stats;
    [key: string]: unknown;
}

export default function UserDashboard() {
    const { props } = usePage<PageProps>();
    const { orders, wishlistItems, recommendedProducts, stats } = props;
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gray-50">
                <NavStore />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Dashboard
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Welcome back! Here's what's happening with your
                            account.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Orders
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_orders}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Orders
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.pending_orders}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Wishlist Items
                                </CardTitle>
                                <Heart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.wishlist_count}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Spent
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    LKR{' '}
                                    {Number(stats.total_spent).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                        <Link href="/products">
                                            <Button
                                                variant="outline"
                                                className="flex h-auto w-full flex-col py-4"
                                            >
                                                <ShoppingBag className="mb-2 h-6 w-6" />
                                                <span className="text-sm">
                                                    Browse Products
                                                </span>
                                            </Button>
                                        </Link>

                                        <Link href="/wishlist">
                                            <Button
                                                variant="outline"
                                                className="flex h-auto w-full flex-col py-4"
                                            >
                                                <Heart className="mb-2 h-6 w-6" />
                                                <span className="text-sm">
                                                    My Wishlist
                                                </span>
                                            </Button>
                                        </Link>

                                        <Link href="/dashboard/orders">
                                            <Button
                                                variant="outline"
                                                className="flex h-auto w-full flex-col py-4"
                                            >
                                                <Package className="mb-2 h-6 w-6" />
                                                <span className="text-sm">
                                                    Order History
                                                </span>
                                            </Button>
                                        </Link>

                                        <Link href="/dashboard/profile">
                                            <Button
                                                variant="outline"
                                                className="flex h-auto w-full flex-col py-4"
                                            >
                                                <User className="mb-2 h-6 w-6" />
                                                <span className="text-sm">
                                                    Profile
                                                </span>
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Orders */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Recent Orders</CardTitle>
                                    <Link href="/dashboard/orders">
                                        <Button variant="ghost" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    {orders.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500">
                                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                            <p>No orders yet</p>
                                            <Link href="/products">
                                                <Button
                                                    size="sm"
                                                    className="mt-2"
                                                >
                                                    Start Shopping
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="flex items-center justify-between rounded-lg border p-4"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-medium">
                                                                    #
                                                                    {
                                                                        order.order_number
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(
                                                                        order.created_at,
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs ${getStatusColor(order.status)}`}
                                                            >
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            {
                                                                order
                                                                    .order_items
                                                                    .length
                                                            }{' '}
                                                            item(s)
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">
                                                            LKR{' '}
                                                            {Number(
                                                                order.total_amount,
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Wishlist Preview */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>My Wishlist</CardTitle>
                                    <Link href="/wishlist">
                                        <Button variant="ghost" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    {wishlistItems.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500">
                                            <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                            <p>Your wishlist is empty</p>
                                            <Link href="/products">
                                                <Button
                                                    size="sm"
                                                    className="mt-2"
                                                >
                                                    Browse Products
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {wishlistItems
                                                .slice(0, 4)
                                                .map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="flex items-center gap-3 rounded-lg border p-3"
                                                    >
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-gray-100 to-gray-200">
                                                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <Link
                                                                href={`/products/${product.id}`}
                                                            >
                                                                <h4 className="truncate text-sm font-medium hover:text-indigo-600">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </h4>
                                                            </Link>
                                                            <p className="text-sm font-semibold text-indigo-600">
                                                                LKR{' '}
                                                                {Number(
                                                                    product.price,
                                                                ).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleAddToCart(
                                                                    product,
                                                                )
                                                            }
                                                            disabled={
                                                                product.status ===
                                                                    'Out of Stock' ||
                                                                product.stock <=
                                                                    0
                                                            }
                                                        >
                                                            Add to Cart
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Recently Viewed */}
                            <RecentlyViewed showClearButton={false} />

                            {/* Account Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Account Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Member since
                                        </span>
                                        <span className="text-sm font-medium">
                                            {new Date().getFullYear()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Total orders
                                        </span>
                                        <span className="text-sm font-medium">
                                            {stats.total_orders}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Amount saved
                                        </span>
                                        <span className="text-sm font-medium text-green-600">
                                            LKR{' '}
                                            {Number(
                                                stats.wishlist_count * 500,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recommended Products Section */}
                    {recommendedProducts && recommendedProducts.length > 0 && (
                        <div className="mt-12">
                            <RecommendedProducts
                                products={recommendedProducts}
                                title="Recommended Just for You"
                                subtitle="Discover products based on your shopping preferences and history"
                                className="bg-white"
                            />
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}
