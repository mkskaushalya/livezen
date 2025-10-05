import { AddProductDialog } from '@/components/products/add-product-dialog';
import { DataTable } from '@/components/products/data-table';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import { UsersDataTable } from '@/components/users/users-data-table';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: admin.dashboard().url,
    },
];

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

type Product = {
    id: string;
    name: string;
    category?: { id: string; name: string };
    seller?: { id: string; name: string };
    price: number;
    stock: number;
    description?: string;
    tags?: Tag[];
    status: 'Active' | 'Inactive' | 'Low Stock';
};

type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    phone?: string;
    address?: string;
    role: 'admin' | 'seller' | 'user';
    email_verified_at?: string;
    created_at: string;
};

interface PageProps {
    products: Product[];
    categories: Category[];
    tags: Tag[];
    users: User[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { products, categories, tags, users } = props;
    const [activeTab, setActiveTab] = React.useState<'products' | 'users'>(
        'products',
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Admin Dashboard
                    </h1>

                    {/* Tab Navigation */}
                    <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                activeTab === 'products'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                activeTab === 'users'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Users
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                    {activeTab === 'products' ? (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Product Management
                                </h2>
                                <AddProductDialog
                                    categories={categories}
                                    tags={tags}
                                />
                            </div>
                            <DataTable
                                products={products}
                                categories={categories}
                                tags={tags}
                            />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    User Management
                                </h2>
                                <AddUserDialog />
                            </div>
                            <UsersDataTable users={users} />
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
