'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CartItems } from './CartItems';
import { GuestChat } from './GuestChat';
import { GuestAddressForm } from './GuestAddressForm';
import { CartSummary } from './CartSummary';
import { Toast } from './Toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  images: Array<{ url: string; isPrimary: boolean }>;
  variants?: Array<{ id: string; name: string; price: number }>;
}

interface GuestCartItem {
  id: string;
  quantity: number;
  productId: string;
  variantId: string | null;
  product: Product;
  variant: { id: string; name: string; price: number } | null;
}

interface GuestChat {
  id: string;
  senderType: 'GUEST' | 'SELLER';
  senderName: string;
  message: string;
  contactInfo: string | null;
  isRead: boolean;
  createdAt: string;
}

interface GuestAddress {
  id: string;
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

interface GuestCart {
  id: string;
  guestName: string;
  guestToken: string;
  guestEmail: string | null;
  guestPhone: string | null;
  status: string;
  notes: string | null;
  items: GuestCartItem[];
  chats: GuestChat[];
  address: GuestAddress | null;
  createdAt: string;
}

export function GuestCartClient({ guestName }: { guestName: string }) {
  const router = useRouter();
  const [cart, setCart] = useState<GuestCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'carrinho' | 'chat' | 'endereco'>('carrinho');

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guest-cart?nome=${encodeURIComponent(guestName)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Carrinho não encontrado');
      }

      setCart(data.guestCart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar carrinho');
    } finally {
      setLoading(false);
    }
  }, [guestName]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;

    try {
      const response = await fetch(`/api/guest-cart/${cart.id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar');

      fetchCart();
      showToast('Quantidade atualizada', 'success');
    } catch {
      showToast('Erro ao atualizar quantidade', 'error');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!cart) return;

    try {
      const response = await fetch(`/api/guest-cart/${cart.id}/items?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao remover');

      fetchCart();
      showToast('Item removido', 'success');
    } catch {
      showToast('Erro ao remover item', 'error');
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!cart) return;

    try {
      const response = await fetch(`/api/guest-cart/${cart.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'GUEST',
          senderName: guestName,
          message,
        }),
      });

      if (!response.ok) throw new Error('Erro ao enviar');

      fetchCart();
    } catch {
      showToast('Erro ao enviar mensagem', 'error');
    }
  };

  const handleSaveAddress = async (addressData: Omit<GuestAddress, 'id'>) => {
    if (!cart) return;

    try {
      const response = await fetch(`/api/guest-cart/${cart.id}/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      fetchCart();
      showToast('Endereço salvo com segurança', 'success');
      setActiveTab('chat');
    } catch {
      showToast('Erro ao salvar endereço', 'error');
    }
  };

  const handleFinalize = async () => {
    if (!cart) return;

    try {
      showToast('Finalizando e notificando vendedor...', 'success');

      const response = await fetch(`/api/guest-cart/${cart.id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: cart.guestName,
          guestPhone: cart.guestPhone,
          guestEmail: cart.guestEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao finalizar');
      }

      showToast('Pedido finalizado! Vendedor notificado no WhatsApp 📱', 'success');

      // Atualiza status do carrinho
      fetchCart();

      // Redireciona para página de sucesso ou pagamento
      // router.push(`/pedido-sucesso?cart=${cart.id}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao finalizar', 'error');
    }
  };

  const subtotal = cart?.items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.salePrice || item.product.basePrice;
    return sum + price * item.quantity;
  }, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Carrinho não encontrado</h1>
          <p className="mt-2 text-gray-600">{error || `Nenhum carrinho ativo para "${guestName}"`}</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 hover:underline">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  const unreadChats = cart.chats.filter(c => c.senderType === 'SELLER' && !c.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">Marketplace</Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Carrinho de: <span className="font-medium">{cart.guestName}</span></span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {cart.status === 'ACTIVE' && 'Ativo'}
                {cart.status === 'CONTACTED' && 'Vendedor respondeu'}
                {cart.status === 'CONVERTED' && 'Convertido em pedido'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('carrinho')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'carrinho'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Carrinho ({cart.items.length})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'chat'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat {unreadChats > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadChats}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('endereco')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'endereco'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Endereço {cart.address ? '✓' : ''}
            </button>
          </nav>
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'carrinho' && (
              <CartItems
                items={cart.items}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            )}
            {activeTab === 'chat' && (
              <GuestChat
                chats={cart.chats}
                guestName={guestName}
                onSendMessage={handleSendMessage}
                cartStatus={cart.status}
              />
            )}
            {activeTab === 'endereco' && (
              <GuestAddressForm
                address={cart.address}
                onSave={handleSaveAddress}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              itemCount={cart.items.length}
              onFinalize={handleFinalize}
              hasAddress={!!cart.address}
              status={cart.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}