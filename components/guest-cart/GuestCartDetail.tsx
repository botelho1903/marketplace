'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { GuestChat } from './GuestChat';

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
}

interface GuestCartDetailProps {
  cart: GuestCart;
  onClose: () => void;
  onRefresh: () => void;
}

export function GuestCartDetail({ cart, onClose, onRefresh }: GuestCartDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'items'>('info');
  const [sending, setSending] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const handleSendReply = async () => {
    if (!replyMessage.trim() || sending) return;

    setSending(true);
    try {
      await fetch(`/api/guest-cart/${cart.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'SELLER',
          senderName: 'Vendedor',
          message: replyMessage.trim(),
          contactInfo: contactInfo || undefined,
        }),
      });
      onRefresh();
      setReplyMessage('');
      setContactInfo('');
      setActiveTab('chat');
    } catch (error) {
      console.error('Erro ao responder:', error);
    }
    setSending(false);
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await fetch(`/api/guest-cart/${cart.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      onRefresh();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.salePrice || item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Carrinho de {cart.guestName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {formatDistanceToNow(new Date(cart.createdAt), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              cart.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' :
              cart.status === 'CONTACTED' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {cart.status === 'ACTIVE' && 'Aguardando resposta'}
              {cart.status === 'CONTACTED' && 'Respondido'}
              {cart.status === 'CONVERTED' && 'Convertido em pedido'}
            </span>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6" aria-label="Tabs">
            {['info', 'chat', 'items'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'info' && 'Info & Endereço'}
                {tab === 'chat' && `Chat (${cart.chats.length})`}
                {tab === 'items' && `Itens (${cart.items.length})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{cart.guestName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{cart.guestPhone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{cart.guestEmail || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Itens no carrinho</p>
                  <p className="font-medium">{cart.items.length}</p>
                </div>
              </div>

              {cart.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800">Recado do cliente:</p>
                  <p className="mt-1 text-yellow-700">{cart.notes}</p>
                </div>
              )}

              {cart.address ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">Endereço de entrega salvo ✓</p>
                  <div className="text-green-700 space-y-1">
                    <p>{cart.address.name}</p>
                    <p>{cart.address.phone}</p>
                    <p>{cart.address.street}, {cart.address.number}</p>
                    {cart.address.complement && <p>{cart.address.complement}</p>}
                    <p>{cart.address.neighborhood}, {cart.address.city}/{cart.address.state}</p>
                    <p>CEP: {cart.address.cep}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600">Endereço não informado ainda</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-2">Total estimado: {formatCurrency(subtotal + 15)}</p>
                <div className="flex gap-3">
                  {cart.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleUpdateStatus('CONTACTED')}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Marcar como Respondido
                    </button>
                  )}
                  {cart.status === 'CONTACTED' && (
                    <button
                      onClick={() => handleUpdateStatus('CONVERTED')}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Marcar como Convertido
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <GuestChat
              chats={cart.chats}
              guestName={cart.guestName}
              onSendMessage={handleSendReply}
              cartStatus={cart.status}
            />
          )}

          {activeTab === 'items' && (
            <div className="space-y-4">
              {cart.items.map(item => {
                const price = item.variant?.price || item.product.salePrice || item.product.basePrice;
                const image = item.product.images.find(i => i.isPrimary) || item.product.images[0];

                return (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={image?.url || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      {item.variant && <p className="text-sm text-gray-500">{item.variant.name}</p>}
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
              <div className="text-right font-semibold text-lg">
                Subtotal: {formatCurrency(subtotal)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}