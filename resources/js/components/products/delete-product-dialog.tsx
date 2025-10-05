'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

type Product = {
    id: string;
    name: string;
    category?: { id: string; name: string };
    price: number;
    stock: number;
    description?: string;
    status: 'Active' | 'Inactive' | 'Low Stock';
};

interface DeleteProductDialogProps {
    product: Product;
    children?: React.ReactNode;
}

export function DeleteProductDialog({
    product,
    children,
}: DeleteProductDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = () => {
        setIsDeleting(true);

        router.delete(route('products.destroy', product.id), {
            onSuccess: () => {
                toast.success('Product deleted successfully.');
                setOpen(false);
                setIsDeleting(false);
            },
            onError: () => {
                toast.error('Failed to delete product. Please try again.');
                setIsDeleting(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="destructive" size="sm">
                        Delete
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600">
                        Delete Product
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Are you sure you want to delete this product? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">
                            Product Details:
                        </p>
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                            <p className="font-semibold text-gray-900">
                                {product.name}
                            </p>
                            {product.category && (
                                <p className="text-sm text-gray-600">
                                    Category: {product.category.name}
                                </p>
                            )}
                            <p className="text-sm text-gray-600">
                                Price: LKR{' '}
                                {Number(product.price).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                Stock: {product.stock} units
                            </p>
                            {product.description && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Description: {product.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="cursor-pointer"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Product'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
