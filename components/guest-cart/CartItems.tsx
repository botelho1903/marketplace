'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  images: Array<{ url: string; isPrimary: boolean }>;
}

interface GuestCartItem {
  id: string;
  quantity: number;
  productId: string;
  variantId: string | null;
  product: Product;
  variant: { id: string; name: string; price: number } | null;
}

interface CartItemsProps {
  items: GuestCartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItems({ items, onUpdateQuantity, onRemove }: CartItemsProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v18a2 2 0 002 2h2m12-2V9a2 2 0 00-2-2h-2m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 16l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Carrinho vazio</h3>
        <p className="mt-2 text-gray-500">Adicione produtos para começar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-200">
        {items.map((item) => {
          const price = item.variant?.price || item.product.salePrice || item.product.basePrice;
          const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
          const totalPrice = price * item.quantity;

          return (
            <div key={item.id} className="p-4 sm:p-6 flex gap-4">
              <Link href={`/produto/${item.product.slug}`} className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {primaryImage ? (
                  <Image src={primaryImage.url} alt={item.product.name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <Link href={`/produto/${item.product.slug}`}>
                      <h3 className="text-lg font-medium text-gray-900 truncate">{item.product.name}</h3>
                    </Link>
                    {item.variant && (
                      <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(totalPrice)}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                      aria-label="Diminuir quantidade"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-4 py-1.5 text-center w-12 font-medium text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                      aria-label="Aumentar quantidade"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remover
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}