import Footer from '@/components/footer';
import NavStore from '@/components/nav-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Package,
    ShoppingBag,
    Truck,
    XCircle,
} from 'lucide-react';

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

interface PageProps {
    orders: Order[];
    [key: string]: unknown;
}

export default function Orders() {
    const { props } = usePage<PageProps>();
    const { orders } = props;

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

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'processing':
                return <Package className="h-4 w-4" />;
            case 'shipped':
                return <Truck className="h-4 w-4" />;
            case 'delivered':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    return (
        <>
            <Head title="Order History" />
            <div className="min-h-screen bg-gray-50">
                <NavStore />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Order History
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            View and track all your orders
                        </p>
                    </div>

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                    No orders yet
                                </h3>
                                <p className="mb-6 text-gray-500">
                                    Start shopping to see your orders here
                                </p>
                                <Link href="/products">
                                    <Button>
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Start Shopping
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <Card key={order.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    Order #{order.order_number}
                                                </CardTitle>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Placed on{' '}
                                                    {new Date(
                                                        order.created_at,
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}
                                                >
                                                    {getStatusIcon(
                                                        order.status,
                                                    )}
                                                    {order.status}
                                                </div>
                                                <p className="mt-2 text-lg font-semibold">
                                                    LKR{' '}
                                                    {Number(
                                                        order.total_amount,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-900">
                                                Order Items
                                            </h4>
                                            <div className="space-y-3">
                                                {order.order_items.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-gray-200 to-gray-300">
                                                                    <ShoppingBag className="h-6 w-6 text-gray-500" />
                                                                </div>
                                                                <div>
                                                                    <Link
                                                                        href={`/products/${item.product.id}`}
                                                                    >
                                                                        <h5 className="font-medium hover:text-indigo-600">
                                                                            {
                                                                                item
                                                                                    .product
                                                                                    .name
                                                                            }
                                                                        </h5>
                                                                    </Link>
                                                                    <p className="text-sm text-gray-500">
                                                                        Quantity:{' '}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </p>
                                                                    {item
                                                                        .product
                                                                        .category && (
                                                                        <p className="text-xs text-gray-400">
                                                                            {
                                                                                item
                                                                                    .product
                                                                                    .category
                                                                                    .name
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold">
                                                                    LKR{' '}
                                                                    {Number(
                                                                        item.price,
                                                                    ).toLocaleString()}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    per item
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            {/* Order Summary */}
                                            <div className="border-t pt-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        Total Items:{' '}
                                                        {order.order_items.reduce(
                                                            (sum, item) =>
                                                                sum +
                                                                item.quantity,
                                                            0,
                                                        )}
                                                    </span>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold">
                                                            Total: LKR{' '}
                                                            {Number(
                                                                order.total_amount,
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    View Details
                                                </Button>
                                                {order.status.toLowerCase() ===
                                                    'delivered' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Reorder
                                                    </Button>
                                                )}
                                                {(order.status.toLowerCase() ===
                                                    'pending' ||
                                                    order.status.toLowerCase() ===
                                                        'processing') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Track Order
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}
