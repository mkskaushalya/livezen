import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DeleteUserDialog } from './delete-user-dialog';
import { EditUserDialog } from './edit-user-dialog';

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

interface UsersDataTableProps {
    users: User[];
}

export function UsersDataTable({ users }: UsersDataTableProps) {
    const getRoleVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'seller':
                return 'default';
            case 'user':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users?.length > 0 ? (
                        users.map((user, i) => (
                            <TableRow key={user.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell className="font-medium">
                                    {user.name}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    @{user.username}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {user.email}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {user.phone || '—'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getRoleVariant(user.role)}>
                                        {user.role.charAt(0).toUpperCase() +
                                            user.role.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.email_verified_at
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                    >
                                        {user.email_verified_at
                                            ? 'Verified'
                                            : 'Unverified'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {formatDate(user.created_at)}
                                </TableCell>
                                <TableCell className="space-x-2 text-right">
                                    <EditUserDialog user={user} />
                                    <DeleteUserDialog user={user} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={9}
                                className="py-6 text-center text-gray-500"
                            >
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
