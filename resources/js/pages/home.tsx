import NavStore from '@/components/nav-store';
import ProductEditButton from '@/components/products/product-edit-button';
import ProductStatusButton from '@/components/products/product-status-button';
import RecentlyViewed from '@/components/recently-viewed';
import RecommendedProducts from '@/components/recommended-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import admin from '@/routes/admin';
import seller from '@/routes/seller';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    RefreshCcwIcon,
    Settings,
    ShieldCheckIcon,
    ShoppingBagIcon,
    StarIcon,
    Store,
    TrendingUp,
    TruckIcon,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

type Category = { id: string; name: string; products_count?: number };
type Tag = { id: string; name: string };

type Product = {
    id: string;
    name: string;
    category?: { id: string; name: string };
    price: number;
    stock: number;
    description?: string;
    tags?: Tag[];
    status: 'Active' | 'Inactive' | 'Low Stock' | 'Out of Stock';
};

interface PageProps {
    featuredProducts: Product[];
    categories: Category[];
    topCategories: Category[];
    recommendedProducts: Product[];
    tags?: Tag[];
    auth?: {
        user?: {
            name: string;
            email: string;
            role?: 'admin' | 'seller' | 'user';
        };
    };
    [key: string]: unknown;
}

export default function Home() {
    const { props } = usePage<PageProps>();
    const {
        featuredProducts,
        topCategories,
        recommendedProducts,
        categories,
        tags,
        auth,
    } = props;
    const { addToCart } = useCart();
    const user = auth?.user;

    const newsletterForm = useForm({
        email: '',
    });

    const handleAddToCart = (product: Product) => {
        if (product.status !== 'Active') {
            toast.error('This product is not available for purchase');
            return;
        }
        if (product.stock <= 0) {
            toast.error('This product is out of stock');
            return;
        }
        addToCart(product, 1);
        toast.success(`${product.name} added to cart!`);
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        newsletterForm.post('/newsletter/subscribe', {
            onSuccess: () => {
                toast.success('Thank you for subscribing to our newsletter!');
                newsletterForm.reset();
            },
            onError: () => {
                toast.error('Failed to subscribe. Please try again.');
            },
        });
    };

    const features = [
        {
            name: 'Free shipping',
            description: 'Free shipping on orders over $100',
            icon: TruckIcon,
        },
        {
            name: 'Secure payments',
            description: '100% secure payment processing',
            icon: ShieldCheckIcon,
        },
        {
            name: '30-day returns',
            description: 'Easy returns within 30 days',
            icon: RefreshCcwIcon,
        },
    ];

    const testimonials = [
        {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Verified Customer',
            content:
                'Amazing quality products and fast delivery. Highly recommend LiveZen for all your needs!',
            rating: 5,
        },
        {
            id: 2,
            name: 'Michael Chen',
            role: 'Verified Customer',
            content:
                'Great customer service and the products exactly match the descriptions. Will shop again!',
            rating: 5,
        },
        {
            id: 3,
            name: 'Emily Davis',
            role: 'Verified Customer',
            content:
                'Love the variety and quality. The website is easy to use and checkout was seamless.',
            rating: 5,
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <NavStore />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            Welcome to LiveZen
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-purple-100">
                            Discover amazing products from trusted sellers. Shop
                            with confidence and enjoy fast, secure delivery
                            right to your door.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link href="/products">
                                <Button
                                    size="lg"
                                    className="bg-white text-purple-600 hover:bg-gray-50"
                                >
                                    Shop Now
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-white bg-transparent font-semibold text-white hover:bg-white hover:text-purple-600"
                                >
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role-specific Dashboard Quick Access */}
            {user && (user.role === 'admin' || user.role === 'seller') && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                {user.role === 'admin'
                                    ? 'Admin Tools'
                                    : 'Seller Tools'}
                            </h2>
                            <p className="mt-2 text-lg text-indigo-100">
                                Quick access to your {user.role} dashboard and
                                tools
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                {user.role === 'admin' && (
                                    <>
                                        <Link href={admin.dashboard()}>
                                            <Button
                                                size="lg"
                                                className="bg-white text-indigo-600 hover:bg-gray-50"
                                            >
                                                <Settings className="mr-2 h-5 w-5" />
                                                Admin Dashboard
                                            </Button>
                                        </Link>
                                        <Link href={admin.mlRecommendations()}>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-indigo-600"
                                            >
                                                <TrendingUp className="mr-2 h-5 w-5" />
                                                ML Recommendations
                                            </Button>
                                        </Link>
                                    </>
                                )}
                                {user.role === 'seller' && (
                                    <Link href={seller.dashboard()}>
                                        <Button
                                            size="lg"
                                            className="bg-white text-indigo-600 hover:bg-gray-50"
                                        >
                                            <Store className="mr-2 h-5 w-5" />
                                            Seller Dashboard
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Features Section */}
            <div className="bg-gray-50 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Why Choose LiveZen?
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            We're committed to providing you with the best
                            shopping experience possible.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.name}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600">
                                        <feature.icon
                                            className="h-8 w-8 text-white"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <dt className="text-xl leading-7 font-semibold text-gray-900">
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">
                                        {feature.description}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* Top Categories Section */}
            <div className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Shop by Category
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Explore our most popular categories and find exactly
                            what you're looking for.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {topCategories?.map((category) => (
                            <div
                                key={category.id}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-lg transition-transform hover:scale-105"
                            >
                                <div className="relative z-10">
                                    <h3 className="text-xl font-semibold text-white">
                                        {category.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-300">
                                        {category.products_count
                                            ? `${category.products_count} products`
                                            : 'Explore category'}
                                    </p>
                                    <Link
                                        href={`/products?category=${category.id}`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4 border-2 border-white bg-transparent font-semibold text-white transition-all duration-200 hover:bg-white hover:text-gray-900"
                                        >
                                            Browse
                                        </Button>
                                    </Link>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="bg-gray-50 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Featured Products
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Check out our latest and most popular products from
                            trusted sellers.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                        {featuredProducts?.slice(0, 8).map((product) => (
                            <div
                                key={product.id}
                                className="group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl"
                            >
                                <Link
                                    href={`/products/${product.id}`}
                                    className="absolute inset-0 z-10"
                                >
                                    <span className="sr-only">
                                        View {product.name}
                                    </span>
                                </Link>
                                <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                                    <div className="flex h-full items-center justify-center">
                                        <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                                                {product.name}
                                            </h3>
                                            <ProductEditButton
                                                product={product}
                                                size="icon"
                                                variant="ghost"
                                                className="relative z-20 opacity-0 transition-opacity group-hover:opacity-100"
                                                categories={categories || []}
                                                tags={tags || []}
                                            />
                                        </div>
                                        <ProductStatusButton
                                            product={product}
                                            className="relative z-20"
                                        />
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
                                            className="relative z-20 shrink-0"
                                            onClick={() =>
                                                handleAddToCart(product)
                                            }
                                            disabled={
                                                product.status !== 'Active' ||
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
                                                    .slice(0, 2)
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
                    <div className="mt-12 text-center">
                        <Link href="/products">
                            <Button size="lg" variant="outline">
                                View All Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            What Our Customers Say
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Don't just take our word for it - hear from our
                            satisfied customers.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex flex-col justify-between rounded-2xl bg-gray-50 p-8 shadow-sm"
                            >
                                <div>
                                    <div className="flex gap-1 text-yellow-400">
                                        {[...Array(testimonial.rating)].map(
                                            (_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className="h-5 w-5 fill-current"
                                                />
                                            ),
                                        )}
                                    </div>
                                    <p className="mt-4 leading-7 text-gray-600">
                                        "{testimonial.content}"
                                    </p>
                                </div>
                                <div className="mt-6">
                                    <p className="font-semibold text-gray-900">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recommended Products Section */}
            {recommendedProducts && recommendedProducts.length > 0 && (
                <RecommendedProducts
                    products={recommendedProducts}
                    title="Recommended for You"
                    subtitle="Discover products tailored to your interests and browsing history"
                    showViewAll={true}
                    className="bg-gray-50"
                />
            )}

            {/* Recently Viewed Section */}
            <div className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl">
                        <RecentlyViewed />
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-indigo-700 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Stay Updated
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-indigo-200">
                            Subscribe to our newsletter and be the first to know
                            about new products, special offers, and exclusive
                            deals.
                        </p>
                        <form
                            onSubmit={handleNewsletterSubmit}
                            className="mx-auto mt-8 flex max-w-md gap-x-4"
                        >
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={newsletterForm.data.email}
                                onChange={(e) =>
                                    newsletterForm.setData(
                                        'email',
                                        e.target.value,
                                    )
                                }
                                className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-white focus:ring-inset sm:text-sm sm:leading-6"
                                required
                            />
                            <Button
                                type="submit"
                                className="bg-white text-indigo-700 hover:bg-gray-50"
                                disabled={newsletterForm.processing}
                            >
                                {newsletterForm.processing
                                    ? 'Subscribing...'
                                    : 'Subscribe'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-8 xl:col-span-1">
                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    LiveZen
                                </h3>
                                <p className="mt-2 text-base text-gray-300">
                                    Your trusted marketplace for quality
                                    products from verified sellers.
                                </p>
                            </div>
                            <div className="flex space-x-6">
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <span className="sr-only">Facebook</span>
                                    <svg
                                        className="h-6 w-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <span className="sr-only">Twitter</span>
                                    <svg
                                        className="h-6 w-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                                        Shop
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                All Products
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Categories
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                New Arrivals
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Sale
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="mt-12 md:mt-0">
                                    <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                                        Support
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Contact Us
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                FAQs
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Shipping Info
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Returns
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                                        Company
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                About Us
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Careers
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Press
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Blog
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="mt-12 md:mt-0">
                                    <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                                        Legal
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Privacy Policy
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Terms of Service
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-gray-300 hover:text-white"
                                            >
                                                Cookie Policy
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-gray-700 pt-8">
                        <p className="text-base text-gray-400 xl:text-center">
                            &copy; 2025 LiveZen. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
