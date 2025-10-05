import { AddProductDialog } from '@/components/products/add-product-dialog';
import { DataTable } from '@/components/products/data-table';
import AppLayout from '@/layouts/app-layout';
import seller from '@/routes/seller';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Seller Dashboard',
        href: seller.dashboard().url,
    },
];

type Product = {
    id: string;
    name: string;
    category?: { id: string; name: string };
    price: number;
    stock: number;
    description?: string;
    tags?: tag[];
    status: 'Active' | 'Inactive' | 'Low Stock';
};

type Category = {
    id: string;
    name: string;
};

type tag = {
    id: string;
    name: string;
};

interface PageProps {
    products: Product[];
    categories: Category[];
    tags: tag[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { products, categories, tags } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Seller Dashboard
                </h1>
                <div className="self-end p-4">
                    <AddProductDialog categories={categories} tags={tags} />
                </div>

                <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                    <DataTable
                        products={products}
                        categories={categories}
                        tags={tags}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
