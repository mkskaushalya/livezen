import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface WishlistButtonProps {
    productId: string;
    className?: string;
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if product is in wishlist on mount
    useEffect(() => {
        checkWishlistStatus();
    }, [productId]);

    const checkWishlistStatus = async () => {
        try {
            const response = await fetch('/wishlist/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ product_id: productId }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsInWishlist(data.in_wishlist);
            }
        } catch {
            // Silently fail - user just won't see wishlist status
        }
    };

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent any parent link navigation
        e.stopPropagation();

        setIsLoading(true);
        try {
            const url = '/wishlist';
            const method = isInWishlist ? 'DELETE' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ product_id: productId }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsInWishlist(data.in_wishlist);
                toast.success(data.message);
            } else {
                toast.error('Please login to use wishlist');
            }
        } catch {
            toast.error('Failed to update wishlist');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={isLoading}
            className={`rounded-full p-2 transition-colors ${
                isInWishlist 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-red-600'
            } ${className}`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart 
                className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} 
            />
        </button>
    );
}