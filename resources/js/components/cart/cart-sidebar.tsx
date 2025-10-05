import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCartIcon, PlusIcon, MinusIcon, XIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import * as React from 'react';

export function CartSidebar({ children }: { children?: React.ReactNode }) {
    const { items, totalItems, totalPrice, updateQuantity, removeFromCart, isOpen, setIsOpen } = useCart();

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="outline" size="icon" className="relative">
                        <ShoppingCartIcon className="h-4 w-4" />
                        {totalItems > 0 && (
                            <Badge
                                variant="secondary"
                                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                            >
                                {totalItems}
                            </Badge>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                <SheetHeader className="space-y-2.5 pr-6">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCartIcon className="h-5 w-5" />
                        Shopping Cart ({totalItems})
                    </SheetTitle>
                </SheetHeader>
                
                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center space-y-4 pr-6">
                        <ShoppingCartIcon className="h-16 w-16 text-gray-300" />
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Add some products to get started!
                            </p>
                        </div>
                        <Button onClick={() => setIsOpen(false)}>
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-6">
                            {items.map((item) => (
                                <div key={item.product.id} className="flex items-center space-x-4 rounded-lg border p-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                                        <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1">
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {item.product.name}
                                        </h3>
                                        {item.product.category && (
                                            <p className="text-xs text-gray-500">
                                                {item.product.category.name}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-indigo-600">
                                                LKR {item.product.price.toLocaleString()}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <MinusIcon className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product.stock}
                                                >
                                                    <PlusIcon className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                                        onClick={() => removeFromCart(item.product.id)}
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 pr-6">
                            <Separator />
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span>LKR {totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span>{totalPrice >= 10000 ? 'Free' : 'LKR 500'}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>LKR {(totalPrice + (totalPrice >= 10000 ? 0 : 500)).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Link href="/checkout" className="w-full">
                                    <Button className="w-full" onClick={() => setIsOpen(false)}>
                                        Proceed to Checkout
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}