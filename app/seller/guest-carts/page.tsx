'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GuestCartDetail } from '@/components/guest-cart/GuestCartDetail';

interface GuestCart {
  id: string;
  guestName: string;
  guestToken: string;
  guestEmail: string | null;
  guestPhone: string | null;
  status: string;
  notes: string | null;
  items: Array<{ id: string; quantity: number; product: { name: string; slug: string; images: Array<{ url: string; isPrimary: boolean }>; basePrice: number; salePrice: number | null }; variant: { name: string; price: number } | null }>;
  chats: Array<{ id: string; senderType: 'GUEST' | 'SELLER'; senderName: string; message: string; contactInfo: string | null; isRead: boolean; createdAt: string }>;
  address: { name: string; phone: string; street: string; number: string; complement: string | null; neighborhood: string; city: string; state: string; cep: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function SellerGuestCartsPage() {
  const [carts, setCarts] = useState<GuestCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCart, setSelectedCart] = useState<GuestCart | null>(null);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'CONTACTED'>('all');

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/guest-carts');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao carregar');

      setCarts(data.guestCarts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const filteredCarts = carts.filter(c =>
    filter === 'all' || c.status === filter
  );

  const activeCount = carts.filter(c => c.status === 'ACTIVE').length;
  const contactedCount = carts.filter(c => c.status === 'CONTACTED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">Carrinhos de Clientes</h1>
            <Link href="/seller/dashboard" className="text-primary-600 hover:underline text-sm">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Aguardando resposta</p>
            <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Vendedor respondeu</p>
            <p className="text-3xl font-bold text-gray-900">{contactedCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-bold text-gray-900">{carts.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'ACTIVE', 'CONTACTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'ACTIVE' ? 'Aguardando' : 'Respondidos'}
            </button>
          ))}
        </div>

        {/* Cart List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : filteredCarts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v18a2 2 0 002 2h2m12-2V9a2 2 0 00-2-2h-2m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 16l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <p className="mt-4 text-gray-500">Nenhum carrinho {filter !== 'all' ? `com status ${filter}` : ''}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCarts.map(cart => (
              <div
                key={cart.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCart(cart)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{cart.guestName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cart.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' :
                        cart.status === 'CONTACTED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cart.status === 'ACTIVE' && 'Aguardando'}
                        {cart.status === 'CONTACTED' && 'Respondido'}
                        {cart.status === 'CONVERTED' && 'Convertido'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(cart.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                      <span>R$ {cart.items.reduce((sum, i) => sum + (i.variant?.price || i.product.basePrice) * i.quantity, 0).toFixed(2)}</span>
                      {cart.guestPhone && <span>📞 {cart.guestPhone}</span>}
                      {cart.guestEmail && <span>✉️ {cart.guestEmail}</span>}
                    </div>

                    {cart.notes && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        Recado: {cart.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/carrinho/${cart.guestName}`}
                      target="_blank"
                      className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                    >
                      Abrir Carrinho
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Detail */}
        {selectedCart && (
          <GuestCartDetail
            cart={selectedCart}
            onClose={() => setSelectedCart(null)}
            onRefresh={fetchCarts}
          />
        )}
      </main>
    </div>
  );
}