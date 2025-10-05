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

interface EditUserDialogProps {
    user: User;
    children?: React.ReactNode;
}

export function EditUserDialog({ user, children }: EditUserDialogProps) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('users.update', user.id), {
            onSuccess: () => {
                toast.success('User updated successfully.');
                setOpen(false);
            },
            onError: () => {
                toast.error('Failed to update user. Please check the form.');
            },
        });
    };

    // Reset form data when user changes or dialog opens
    React.useEffect(() => {
        if (open) {
            setData({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                role: user.role || '',
                password: '',
                password_confirmation: '',
            });
        }
    }, [open, user, setData]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        Edit
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update the user details below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ex: John Doe"
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={data.username}
                            onChange={(e) =>
                                setData('username', e.target.value)
                            }
                            placeholder="Ex: johndoe"
                            required
                        />
                        {errors.username && (
                            <p className="text-sm text-red-500">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Ex: john@example.com"
                            required
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone & Role */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="Ex: +1234567890"
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={data.role}
                                onValueChange={(val) =>
                                    setData(
                                        'role',
                                        val as 'admin' | 'seller' | 'user',
                                    )
                                }
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="seller">
                                        Seller
                                    </SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-500">
                                    {errors.role}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Full address..."
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    {/* Password (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            New Password (Optional)
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder="Leave blank to keep current password"
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password (Only if password is set) */}
                    {data.password && (
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirm New Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                placeholder="Repeat new password"
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-red-500">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    )}

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
                            {processing ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
