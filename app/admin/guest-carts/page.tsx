'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface GuestCart {
  id: string;
  guestName: string;
  guestToken: string;
  guestEmail: string | null;
  guestPhone: string | null;
  status: string;
  notes: string | null;
  items: Array<{ id: string; quantity: number; product: { name: string; slug: string; basePrice: number; salePrice: number | null; images: Array<{ url: string }> }; variant: { name: string; price: number } | null }>;
  chats: Array<{ id: string; senderType: string; message: string; createdAt: string }>;
  address: { street: string; number: string; neighborhood: string; city: string; state: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminGuestCartsPage() {
  const [carts, setCarts] = useState<GuestCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'CONTACTED' | 'CONVERTED'>('all');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/guest-carts');
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

  const copyLink = (guestName: string, guestToken: string) => {
    const link = `${window.location.origin}/carrinho/${encodeURIComponent(guestName)}?token=${guestToken}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">Carrinhos Guest - Links Diretos</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Aguardando</p>
            <p className="text-3xl font-bold text-gray-900">{carts.filter(c => c.status === 'ACTIVE').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Respondidos</p>
            <p className="text-3xl font-bold text-gray-900">{carts.filter(c => c.status === 'CONTACTED').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500">Convertidos</p>
            <p className="text-3xl font-bold text-gray-900">{carts.filter(c => c.status === 'CONVERTED').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-500">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-bold text-gray-900">{carts.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'ACTIVE', 'CONTACTED', 'CONVERTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>

        {/* Cart List with Direct Links */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : filteredCarts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v18a2 2 0 002 2h2m12-2V9a2 2 0 00-2-2h-2m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 16l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <p className="mt-4 text-gray-500">Nenhum carrinho encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCarts.map(cart => {
              const directLink = `${window.location.origin}/carrinho/${encodeURIComponent(cart.guestName)}?token=${cart.guestToken}`;
              const subtotal = cart.items.reduce((sum, item) => {
                const price = item.variant?.price || item.product.salePrice || item.product.basePrice;
                return sum + price * item.quantity;
              }, 0);

              return (
                <div key={cart.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{cart.guestName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          cart.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' :
                          cart.status === 'CONTACTED' ? 'bg-green-100 text-green-800' :
                          cart.status === 'CONVERTED' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cart.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(cart.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                        <span>{formatCurrency(subtotal)}</span>
                        {cart.guestPhone && <span>📞 {cart.guestPhone}</span>}
                        {cart.guestEmail && <span>✉️ {cart.guestEmail}</span>}
                        {cart.address && <span className="text-green-600">✓ Endereço salvo</span>}
                      </div>

                      {cart.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          Recado: {cart.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 lg:w-auto lg:flex-shrink-0">
                      <button
                        onClick={() => copyLink(cart.guestName, cart.guestToken)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        {copiedLink === directLink ? 'Copiado!' : 'Copiar Link'}
                      </button>
                      <Link
                        href={`/carrinho/${cart.guestName}?token=${cart.guestToken}`}
                        target="_blank"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                      >
                        Abrir
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}