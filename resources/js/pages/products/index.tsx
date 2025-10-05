import Footer from '@/components/footer';
import NavStore from '@/components/nav-store';
import WishlistButton from '@/components/wishlist-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/contexts/cart-context';
import { Link, router, usePage } from '@inertiajs/react';
import { FilterIcon, SearchIcon, ShoppingBagIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

type Category = { id: string; name: string; products_count?: number };
type Tag = { id: string; name: string; products_count?: number };

type Product = {
    id: string;
    name: string;
    category?: { id: string; name: string };
    price: number;
    stock: number;
    description?: string;
    tags?: Tag[];
    status: 'Active' | 'Low Stock' | 'Out of Stock';
};

type PaginatedProducts = {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url?: string; label: string; active: boolean }[];
};

interface PageProps {
    products: PaginatedProducts;
    categories: Category[];
    tags: Tag[];
    filters: {
        search?: string;
        category?: string;
        tag?: string;
        sort: string;
        order: string;
    };
    [key: string]: unknown;
}

export default function ProductsIndex() {
    const { props } = usePage<PageProps>();
    const { products, categories, tags, filters } = props;
    const { addToCart } = useCart();

    const [searchTerm, setSearchTerm] = React.useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = React.useState(
        filters.category || 'all',
    );
    const [selectedTag, setSelectedTag] = React.useState(filters.tag || 'all');
    const [sortBy, setSortBy] = React.useState(filters.sort || 'created_at');
    const [sortOrder, setSortOrder] = React.useState(filters.order || 'desc');

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

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory && selectedCategory !== 'all')
            params.set('category', selectedCategory);
        if (selectedTag && selectedTag !== 'all')
            params.set('tag', selectedTag);
        if (sortBy) params.set('sort', sortBy);
        if (sortOrder) params.set('order', sortOrder);

        router.get('/products', Object.fromEntries(params), {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedTag('all');
        setSortBy('created_at');
        setSortOrder('desc');
        router.get('/products', {}, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavStore />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Products
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Discover amazing products from our trusted sellers
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Search
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                                <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All categories
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name} (
                                            {category.products_count})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Tag
                            </label>
                            <Select
                                value={selectedTag}
                                onValueChange={setSelectedTag}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All tags" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All tags
                                    </SelectItem>
                                    {tags.map((tag) => (
                                        <SelectItem key={tag.id} value={tag.id}>
                                            {tag.name} ({tag.products_count})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Sort by
                            </label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">
                                        Newest
                                    </SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="price">Price</SelectItem>
                                    <SelectItem value="stock">Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button onClick={handleSearch} className="flex-1">
                                <FilterIcon className="mr-2 h-4 w-4" />
                                Apply
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {products.data.length} of {products.total}{' '}
                        products
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.data.map((product) => (
                        <div
                            key={product.id}
                            className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
                        >
                            {/* Wishlist button */}
                            <div className="absolute top-2 right-2 z-10">
                                <WishlistButton productId={product.id} />
                            </div>
                            
                            <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                                <div className="flex h-full items-center justify-center">
                                    <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
                                </div>
                            </div>
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
                                        {product.tags.slice(0, 3).map((tag) => (
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

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-center space-x-2">
                        {products.links.map((link, index) => (
                            <div key={index}>
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        className={`rounded-md px-3 py-2 text-sm font-medium ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span className="px-3 py-2 text-sm font-medium text-gray-400">
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {products.data.length === 0 && (
                    <div className="py-16 text-center">
                        <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No products found
                        </h3>
                        <p className="mt-2 text-gray-500">
                            Try adjusting your search or filter criteria.
                        </p>
                        <Button className="mt-4" onClick={clearFilters}>
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
