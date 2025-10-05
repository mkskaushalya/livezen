import * as React from 'react';

type Product = {
    id: string;
    name: string;
    category?: { id: string; name: string };
    price: number;
    stock: number;
    description?: string;
    tags?: { id: string; name: string }[];
    status: 'Active' | 'Low Stock' | 'Out of Stock';
};

type CartItem = {
    product: Product;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const CartContext = React.createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = React.useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);

    // Load cart from localStorage on mount
    React.useEffect(() => {
        const savedCart = localStorage.getItem('livezen-cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever items change
    React.useEffect(() => {
        localStorage.setItem('livezen-cart', JSON.stringify(items));
    }, [items]);

    const addToCart = React.useCallback((product: Product, quantity = 1) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find(
                (item) => item.product.id === product.id,
            );

            if (existingItem) {
                // Update quantity if item already exists
                return currentItems.map((item) =>
                    item.product.id === product.id
                        ? {
                              ...item,
                              quantity: Math.min(
                                  item.quantity + quantity,
                                  product.stock,
                              ),
                          }
                        : item,
                );
            } else {
                // Add new item
                return [
                    ...currentItems,
                    { product, quantity: Math.min(quantity, product.stock) },
                ];
            }
        });
    }, []);

    const removeFromCart = React.useCallback((productId: string) => {
        setItems((currentItems) =>
            currentItems.filter((item) => item.product.id !== productId),
        );
    }, []);

    const updateQuantity = React.useCallback(
        (productId: string, quantity: number) => {
            if (quantity <= 0) {
                removeFromCart(productId);
                return;
            }

            setItems((currentItems) =>
                currentItems.map((item) => {
                    if (item.product.id === productId) {
                        return {
                            ...item,
                            quantity: Math.min(quantity, item.product.stock),
                        };
                    }
                    return item;
                }),
            );
        },
        [removeFromCart],
    );

    const clearCart = React.useCallback(() => {
        setItems([]);
        localStorage.removeItem('livezen-cart');
    }, []);

    const totalItems = React.useMemo(() => {
        return items.reduce((total, item) => total + item.quantity, 0);
    }, [items]);

    const totalPrice = React.useMemo(() => {
        return items.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0,
        );
    }, [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isOpen,
                setIsOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = React.useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
