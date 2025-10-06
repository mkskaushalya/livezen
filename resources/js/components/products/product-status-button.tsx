'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm, usePage } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'seller' | 'user';
};

type Product = {
    id: string;
    name: string;
    seller_id?: string;
    seller?: {
        id: string;
        name: string;
    };
    price: number;
    stock: number;
    status: 'Active' | 'Inactive' | 'Low Stock' | 'Out of Stock';
    description?: string;
    category?: {
        id: string;
        name: string;
    };
    tags?: { id: string; name: string }[];
};

interface ProductStatusButtonProps {
    product: Product;
    className?: string;
}

export default function ProductStatusButton({
    product,
    className = '',
}: ProductStatusButtonProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const { props } = usePage<{
        auth?: { user?: User };
    }>();

    const user = props.auth?.user;

    const { data, setData, put, processing } = useForm({
        status: product.status,
    });

    // Don't show button if user is not authenticated
    if (!user) {
        return null;
    }

    // Check if user can edit this product
    const canEdit =
        user.role === 'admin' ||
        (user.role === 'seller' &&
            (product.seller_id === user.id || product.seller?.id === user.id));

    if (!canEdit) {
        return null;
    }

    const handleSave = () => {
        put(route('products.update', product.id), {
            onSuccess: () => {
                toast.success('Product status updated successfully.');
                setIsEditing(false);
            },
            onError: (err) => {
                toast.error(Object.values(err).join(', '));
            },
        });
    };

    const handleCancel = () => {
        setData('status', product.status);
        setIsEditing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-500';
            case 'Inactive':
                return 'bg-gray-500';
            case 'Low Stock':
                return 'bg-yellow-500';
            case 'Out of Stock':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (isEditing) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Select
                    value={data.status}
                    onValueChange={(val) =>
                        setData(
                            'status',
                            val as
                                | 'Active'
                                | 'Inactive'
                                | 'Low Stock'
                                | 'Out of Stock',
                        )
                    }
                >
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                Active
                            </div>
                        </SelectItem>
                        <SelectItem value="Inactive">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                                Inactive
                            </div>
                        </SelectItem>
                        <SelectItem value="Low Stock">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                Low Stock
                            </div>
                        </SelectItem>
                        <SelectItem value="Out of Stock">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                Out of Stock
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={processing}
                    className="h-8 w-8 p-0"
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className={`flex items-center gap-2 ${className}`}
            title="Click to edit status"
        >
            <div
                className={`h-2 w-2 rounded-full ${getStatusColor(product.status)}`}
            ></div>
            {product.status}
        </Button>
    );
}
