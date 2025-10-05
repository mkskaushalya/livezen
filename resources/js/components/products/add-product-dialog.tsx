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

interface AddProductDialogProps {
    categories: Category[];
    tags: Tag[];
}

export function AddProductDialog({ categories, tags }: AddProductDialogProps) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        category_id: '',
        price: '',
        stock: '',
        description: '',
        tags: [] as string[],
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

        post(route('products.store'), {
            onSuccess: () => {
                toast.success('Product added successfully.');
                reset();
                setOpen(false);
            },
            onError: (err) => {
                toast.error(Object.values(err).join(', '));
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                    ➕ Add Product
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new product.
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
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
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
                            type="submit"
                            disabled={processing}
                            className="cursor-pointer"
                        >
                            {processing ? 'Saving...' : 'Save Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
