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

interface DeleteUserDialogProps {
    user: User;
    children?: React.ReactNode;
}

export function DeleteUserDialog({ user, children }: DeleteUserDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        
        router.delete(route('users.destroy', user.id), {
            onSuccess: () => {
                toast.success('User deleted successfully.');
                setOpen(false);
                setIsDeleting(false);
            },
            onError: () => {
                toast.error('Failed to delete user. You cannot delete your own account.');
                setIsDeleting(false);
            },
        });
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'seller': return 'bg-blue-100 text-blue-800';
            case 'user': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                    <DialogTitle className="text-red-600">Delete User</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">User Details:</p>
                        <div className="rounded-md border border-gray-200 p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Username: {user.username}
                            </p>
                            <p className="text-sm text-gray-600">
                                Email: {user.email}
                            </p>
                            {user.phone && (
                                <p className="text-sm text-gray-600">
                                    Phone: {user.phone}
                                </p>
                            )}
                            {user.address && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Address: {user.address}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                                Member since: {new Date(user.created_at).toLocaleDateString()}
                            </p>
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
                        {isDeleting ? 'Deleting...' : 'Delete User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}