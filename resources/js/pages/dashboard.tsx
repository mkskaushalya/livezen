import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import seller from '@/routes/seller';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Settings, Store, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Role-specific dashboard quick access */}
                {(userRole === 'admin' || userRole === 'seller') && (
                    <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
                        <h2 className="mb-4 text-xl font-semibold text-indigo-900 dark:text-indigo-100">
                            Quick Access
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {userRole === 'admin' && (
                                <>
                                    <Link href={admin.dashboard()}>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Admin Dashboard
                                        </Button>
                                    </Link>
                                    <Link href={admin.mlRecommendations()}>
                                        <Button
                                            variant="outline"
                                            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                                        >
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            ML Recommendations
                                        </Button>
                                    </Link>
                                </>
                            )}
                            {userRole === 'seller' && (
                                <Link href={seller.dashboard()}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                                        <Store className="mr-2 h-4 w-4" />
                                        Seller Dashboard
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
