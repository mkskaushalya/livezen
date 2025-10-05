import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { EditProductDialog } from './edit-product-dialog';
import { DeleteProductDialog } from './delete-product-dialog';

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

type Product = {
    id: string;
    name: string;
    category?: {
        id: string;
        name: string;
    };
    price: number;
    stock: number;
    description?: string;
    tags?: Tag[];
    status: 'Active' | 'Inactive' | 'Low Stock';
};

interface DataTableProps {
    products: Product[];
    categories: Category[];
    tags: Tag[];
}

export function DataTable({
    products,
    categories,
    tags,
}: DataTableProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price (LKR)</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products?.length > 0 ? (
                        products.map((p, i) => (
                            <TableRow key={p.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell className="font-medium">
                                    {p.name}
                                </TableCell>
                                <TableCell>{p.category?.name ?? '—'}</TableCell>
                                <TableCell className="font-semibold text-indigo-600">
                                    {Number(p.price).toLocaleString()}
                                </TableCell>
                                <TableCell>{p.stock}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            p.status === 'Active'
                                                ? 'secondary'
                                                : p.status === 'Low Stock'
                                                  ? 'default'
                                                  : 'destructive'
                                        }
                                    >
                                        {p.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="space-x-2 text-right">
                                    <EditProductDialog
                                        product={p}
                                        categories={categories}
                                        tags={tags}
                                    />
                                    <DeleteProductDialog product={p} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="py-6 text-center text-gray-500"
                            >
                                No products found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
