'use client';

import { CartSidebar } from '@/components/cart/cart-sidebar';
import { useCart } from '@/contexts/cart-context';
import admin from '@/routes/admin';
import seller from '@/routes/seller';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const navigation = {
    pages: [
        { name: 'Products', href: '/products' },
        { name: 'Recently Viewed', href: '/recently-viewed' },
        { name: 'Wishlist', href: '/wishlist' },
        { name: 'About', href: '/about' },
    ],
};

export default function Example() {
    const [open, setOpen] = useState(false);
    const { totalItems } = useCart();
    const { props } = usePage<{
        auth?: {
            user?: {
                name: string;
                email: string;
                role?: 'admin' | 'seller' | 'user';
            };
        };
    }>();
    const user = props.auth?.user;

    return (
        <div className="bg-white">
            {/* Mobile menu */}
            <Dialog
                open={open}
                onClose={setOpen}
                className="relative z-40 lg:hidden"
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                />
                <div className="fixed inset-0 z-40 flex">
                    <DialogPanel
                        transition
                        className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
                    >
                        <div className="flex px-4 pt-5 pb-2">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                            >
                                <span className="absolute -inset-0.5" />
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon
                                    aria-hidden="true"
                                    className="size-6"
                                />
                            </button>
                        </div>

                        {/* Links */}
                        <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                            {navigation.pages.map((page) => (
                                <div key={page.name} className="flow-root">
                                    <Link
                                        href={page.href}
                                        className="-m-2 block p-2 font-medium text-gray-900"
                                    >
                                        {page.name}
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                            {user ? (
                                <>
                                    <div className="flow-root">
                                        <Link
                                            href="/dashboard"
                                            className="-m-2 block p-2 font-medium text-gray-900"
                                        >
                                            Dashboard
                                        </Link>
                                    </div>
                                    {user.role === 'admin' && (
                                        <div className="flow-root">
                                            <Link
                                                href={admin.dashboard()}
                                                className="-m-2 block p-2 font-medium text-indigo-600"
                                            >
                                                Admin Dashboard
                                            </Link>
                                        </div>
                                    )}
                                    {user.role === 'seller' && (
                                        <div className="flow-root">
                                            <Link
                                                href={seller.dashboard()}
                                                className="-m-2 block p-2 font-medium text-indigo-600"
                                            >
                                                Seller Dashboard
                                            </Link>
                                        </div>
                                    )}
                                    <div className="flow-root">
                                        <Link
                                            href="/dashboard/profile"
                                            className="-m-2 block p-2 font-medium text-gray-900"
                                        >
                                            Profile
                                        </Link>
                                    </div>
                                    <div className="flow-root">
                                        <Link
                                            href="/logout"
                                            method="post"
                                            className="-m-2 block p-2 font-medium text-gray-900"
                                        >
                                            Sign out
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flow-root">
                                        <Link
                                            href="/login"
                                            className="-m-2 block p-2 font-medium text-gray-900"
                                        >
                                            Sign in
                                        </Link>
                                    </div>
                                    <div className="flow-root">
                                        <Link
                                            href="/register"
                                            className="-m-2 block p-2 font-medium text-gray-900"
                                        >
                                            Create account
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-gray-200 px-4 py-6">
                            <a href="#" className="-m-2 flex items-center p-2">
                                <img
                                    alt=""
                                    src="/sl-flag.svg"
                                    className="block h-auto w-5 shrink-0"
                                />
                                <span className="ml-3 block text-base font-medium text-gray-900">
                                    LKR
                                </span>
                                <span className="sr-only">
                                    , change currency
                                </span>
                            </a>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            <header className="relative bg-white">
                <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
                    Get free delivery on orders over $100
                </p>

                <nav
                    aria-label="Top"
                    className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                >
                    <div className="border-b border-gray-200">
                        <div className="flex h-16 items-center">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
                            >
                                <span className="absolute -inset-0.5" />
                                <span className="sr-only">Open menu</span>
                                <Bars3Icon
                                    aria-hidden="true"
                                    className="size-6"
                                />
                            </button>

                            {/* Logo */}
                            <div className="ml-4 flex lg:ml-0">
                                <Link href="/">
                                    <span className="sr-only">LiveZen</span>
                                    <img
                                        alt=""
                                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                        className="h-8 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden lg:ml-8 lg:flex lg:space-x-8">
                                {navigation.pages.map((page) => (
                                    <Link
                                        key={page.name}
                                        href={page.href}
                                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                                    >
                                        {page.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="ml-auto flex items-center">
                                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                                    {user ? (
                                        <>
                                            <Link
                                                href="/dashboard"
                                                className="text-sm font-medium text-gray-700 hover:text-gray-800"
                                            >
                                                Dashboard
                                            </Link>
                                            {user.role === 'admin' && (
                                                <>
                                                    <span
                                                        aria-hidden="true"
                                                        className="h-6 w-px bg-gray-200"
                                                    />
                                                    <Link
                                                        href={admin.dashboard()}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        Admin Dashboard
                                                    </Link>
                                                </>
                                            )}
                                            {user.role === 'seller' && (
                                                <>
                                                    <span
                                                        aria-hidden="true"
                                                        className="h-6 w-px bg-gray-200"
                                                    />
                                                    <Link
                                                        href={seller.dashboard()}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        Seller Dashboard
                                                    </Link>
                                                </>
                                            )}
                                            <span
                                                aria-hidden="true"
                                                className="h-6 w-px bg-gray-200"
                                            />
                                            <Link
                                                href="/dashboard/profile"
                                                className="text-sm font-medium text-gray-700 hover:text-gray-800"
                                            >
                                                Profile
                                            </Link>
                                            <span
                                                aria-hidden="true"
                                                className="h-6 w-px bg-gray-200"
                                            />
                                            <Link
                                                href="/logout"
                                                method="post"
                                                className="text-sm font-medium text-gray-700 hover:text-gray-800"
                                            >
                                                Sign out
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                className="text-sm font-medium text-gray-700 hover:text-gray-800"
                                            >
                                                Sign in
                                            </Link>
                                            <span
                                                aria-hidden="true"
                                                className="h-6 w-px bg-gray-200"
                                            />
                                            <Link
                                                href="/register"
                                                className="text-sm font-medium text-gray-700 hover:text-gray-800"
                                            >
                                                Create account
                                            </Link>
                                        </>
                                    )}
                                </div>

                                <div className="hidden lg:ml-8 lg:flex">
                                    <a
                                        href="#"
                                        className="flex items-center text-gray-700 hover:text-gray-800"
                                    >
                                        <img
                                            alt=""
                                            src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                                            className="block h-auto w-5 shrink-0"
                                        />
                                        <span className="ml-3 block text-sm font-medium">
                                            CAD
                                        </span>
                                        <span className="sr-only">
                                            , change currency
                                        </span>
                                    </a>
                                </div>

                                {/* Search */}
                                <div className="flex lg:ml-6">
                                    <a
                                        href="#"
                                        className="p-2 text-gray-400 hover:text-gray-500"
                                    >
                                        <span className="sr-only">Search</span>
                                        <MagnifyingGlassIcon
                                            aria-hidden="true"
                                            className="size-6"
                                        />
                                    </a>
                                </div>

                                {/* Cart */}
                                <div className="ml-4 flow-root lg:ml-6">
                                    <CartSidebar>
                                        <button className="group -m-2 flex items-center p-2">
                                            <ShoppingBagIcon
                                                aria-hidden="true"
                                                className="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                                                {totalItems}
                                            </span>
                                            <span className="sr-only">
                                                items in cart, view bag
                                            </span>
                                        </button>
                                    </CartSidebar>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </div>
    );
}
