import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import seller from '@/routes/seller';
import user from '@/routes/user';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Settings,
    ShoppingBag,
    Store,
    TrendingUp,
} from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/mkskaushalya/livezen',
        icon: Folder,
    },
    {
        title: 'About LiveZen',
        href: '/about',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role;

    // Generate navigation items based on user role
    const getMainNavItems = (): NavItem[] => {
        const baseItems: NavItem[] = [
            {
                title: 'General Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ];

        // Add role-specific dashboard links for admin and seller
        if (userRole === 'admin') {
            baseItems.push(
                {
                    title: 'Admin Dashboard',
                    href: admin.dashboard(),
                    icon: Settings,
                },
                {
                    title: 'ML Recommendations',
                    href: admin.mlRecommendations(),
                    icon: TrendingUp,
                },
            );
        }

        if (userRole === 'seller') {
            baseItems.push({
                title: 'Seller Dashboard',
                href: seller.dashboard(),
                icon: Store,
            });
        }

        if (userRole === 'user') {
            baseItems.push({
                title: 'My Dashboard',
                href: user.dashboard(),
                icon: ShoppingBag,
            });
        }

        // Add cross-role access for admins and sellers
        if (userRole === 'admin') {
            baseItems.push({
                title: 'Seller View',
                href: seller.dashboard(),
                icon: Store,
            });
        }

        if (userRole === 'admin' || userRole === 'seller') {
            baseItems.push({
                title: 'User View',
                href: user.dashboard(),
                icon: ShoppingBag,
            });
        }

        return baseItems;
    };

    const mainNavItems = getMainNavItems();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
