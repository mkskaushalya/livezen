import React, { createContext, useContext, useEffect, useState } from 'react';

type Product = {
    id: string;
    name: string;
    price: number;
    status: string;
    viewedAt: number;
};

type RecentlyViewedContextType = {
    recentProducts: Product[];
    addRecentProduct: (product: Omit<Product, 'viewedAt'>) => void;
    clearRecentProducts: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function useRecentlyViewed() {
    const context = useContext(RecentlyViewedContext);
    if (!context) {
        throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
    }
    return context;
}

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);

    // Load recently viewed products from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Sort by viewedAt timestamp (most recent first)
                const sorted = parsed.sort((a: Product, b: Product) => b.viewedAt - a.viewedAt);
                setRecentProducts(sorted);
            } catch (error) {
                console.error('Failed to parse recently viewed products:', error);
                localStorage.removeItem('recentlyViewed');
            }
        }
    }, []);

    // Save to localStorage whenever recentProducts changes
    useEffect(() => {
        if (recentProducts.length > 0) {
            localStorage.setItem('recentlyViewed', JSON.stringify(recentProducts));
        }
    }, [recentProducts]);

    const addRecentProduct = (product: Omit<Product, 'viewedAt'>) => {
        const productWithTimestamp: Product = {
            ...product,
            viewedAt: Date.now(),
        };

        setRecentProducts(prev => {
            // Remove existing entry if it exists
            const filtered = prev.filter(p => p.id !== product.id);
            
            // Add to front and limit to 10 items
            const updated = [productWithTimestamp, ...filtered].slice(0, 10);
            
            return updated;
        });
    };

    const clearRecentProducts = () => {
        setRecentProducts([]);
        localStorage.removeItem('recentlyViewed');
    };

    return (
        <RecentlyViewedContext.Provider 
            value={{ 
                recentProducts, 
                addRecentProduct, 
                clearRecentProducts 
            }}
        >
            {children}
        </RecentlyViewedContext.Provider>
    );
}