import { EditProductDialog } from '@/components/products/edit-product-dialog';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { Edit } from 'lucide-react';

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

interface ProductEditButtonProps {
    product: Product;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showText?: boolean;
    categories?: { id: string; name: string }[];
    tags?: { id: string; name: string }[];
}

export default function ProductEditButton({
    product,
    variant = 'outline',
    size = 'sm',
    className = '',
    showText = false,
    categories = [],
    tags = [],
}: ProductEditButtonProps) {
    const { props } = usePage<{
        auth?: { user?: User };
        categories?: { id: string; name: string }[];
        tags?: { id: string; name: string }[];
    }>();

    const user = props.auth?.user;

    // Use provided categories/tags or fall back to page props
    const availableCategories =
        categories.length > 0 ? categories : props.categories || [];
    const availableTags = tags.length > 0 ? tags : props.tags || [];

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

    // If we have categories and tags available, use the dialog
    if (availableCategories.length > 0 && availableTags.length > 0) {
        return (
            <EditProductDialog
                product={product}
                categories={availableCategories}
                tags={availableTags}
            >
                <Button
                    variant={variant}
                    size={size}
                    className={`${className}`}
                    title={`Edit ${product.name}`}
                >
                    {size === 'icon' ? (
                        <Edit className="h-4 w-4" />
                    ) : (
                        <>
                            <Edit className="h-4 w-4" />
                            {showText && <span className="ml-2">Edit</span>}
                        </>
                    )}
                </Button>
            </EditProductDialog>
        );
    }

    // Fallback to redirect behavior if categories/tags not available
    const handleEdit = () => {
        const dashboardUrl =
            user.role === 'admin' ? '/dashboard/admin' : '/dashboard/seller';
        window.location.href = `${dashboardUrl}?edit=${product.id}`;
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleEdit}
            className={`${className}`}
            title={`Edit ${product.name}`}
        >
            {size === 'icon' ? (
                <Edit className="h-4 w-4" />
            ) : (
                <>
                    <Edit className="h-4 w-4" />
                    {showText && <span className="ml-2">Edit</span>}
                </>
            )}
        </Button>
    );
}
