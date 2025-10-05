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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

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

interface EditProductDialogProps {
    product: Product;
    categories: Category[];
    tags: Tag[];
    children?: React.ReactNode;
}

export function EditProductDialog({
    product,
    categories,
    tags,
    children,
}: EditProductDialogProps) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        category_id: product.category?.id || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        description: product.description || '',
        tags: product.tags?.map((tag) => tag.id) || ([] as string[]),
    });

    const handleTagToggle = (tagId: string) => {
        setData(
            'tags',
            data.tags.includes(tagId)
                ? data.tags.filter((t) => t !== tagId)
                : [...data.tags, tagId],
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('products.update', product.id), {
            onSuccess: () => {
                toast.success('Product updated successfully.');
                setOpen(false);
            },
            onError: (err) => {
                toast.error(Object.values(err).join(', '));
            },
        });
    };

    // Reset form data when product changes or dialog opens
    React.useEffect(() => {
        if (open) {
            setData({
                name: product.name || '',
                category_id: product.category?.id || '',
                price: product.price?.toString() || '',
                stock: product.stock?.toString() || '',
                description: product.description || '',
                tags: product.tags?.map((tag) => tag.id) || [],
            });
        }
    }, [open, product, setData]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        Edit
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>
                        Update the product details below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ex: Organic Fertilizer"
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Select
                            value={data.category_id?.toString() || ''}
                            onValueChange={(val) => setData('category_id', val)}
                        >
                            <SelectTrigger id="category_id">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={cat.id.toString()}
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && (
                            <p className="text-sm text-red-500">
                                {errors.category_id}
                            </p>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <Button
                                    key={tag.id}
                                    type="button"
                                    size="sm"
                                    variant={
                                        data.tags.includes(tag.id)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => handleTagToggle(tag.id)}
                                >
                                    #{tag.name}
                                </Button>
                            ))}
                        </div>
                        {errors.tags && (
                            <p className="text-sm text-red-500">
                                {errors.tags}
                            </p>
                        )}
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (LKR)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                placeholder="0.00"
                            />
                            {errors.price && (
                                <p className="text-sm text-red-500">
                                    {errors.price}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={data.stock}
                                onChange={(e) =>
                                    setData('stock', e.target.value)
                                }
                            />
                            {errors.stock && (
                                <p className="text-sm text-red-500">
                                    {errors.stock}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Short description..."
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="cursor-pointer"
                        >
                            {processing ? 'Updating...' : 'Update Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
