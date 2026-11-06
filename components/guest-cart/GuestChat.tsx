'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GuestChat {
  id: string;
  senderType: 'GUEST' | 'SELLER';
  senderName: string;
  message: string;
  contactInfo: string | null;
  isRead: boolean;
  createdAt: string;
}

interface GuestChatProps {
  chats: GuestChat[];
  guestName: string;
  onSendMessage: (message: string) => void;
  cartStatus: string;
}

export function GuestChat({ chats, guestName, onSendMessage, cartStatus }: GuestChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    await onSendMessage(newMessage.trim());
    setNewMessage('');
    setSending(false);
  };

  if (chats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma mensagem ainda</h3>
          <p className="mt-2 text-gray-500">Envie uma mensagem para o vendedor</p>
        </div>
        <form onSubmit={handleSend} className="mt-6 flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Conversa com o vendedor</h2>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {cartStatus === 'CONTACTED' && 'Vendedor respondeu'}
            {cartStatus === 'ACTIVE' && 'Aguardando resposta'}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          O vendedor pode responder com WhatsApp/telefone para combinar detalhes
        </p>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {chats.map((chat) => (
          <div key={chat.id} className={`flex ${chat.senderType === 'GUEST' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${chat.senderType === 'GUEST' ? 'order-2' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                chat.senderType === 'GUEST'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {chat.senderType === 'GUEST' ? 'Você' : chat.senderName}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{chat.message}</p>
                {chat.contactInfo && chat.senderType === 'SELLER' && (
                  <div className="mt-3 p-3 bg-white/20 rounded-lg border border-white/30">
                    <p className="text-xs font-medium mb-1">Contato do vendedor:</p>
                    <a
                      href={chat.contactInfo.includes('@') ? `mailto:${chat.contactInfo}` : `https://wa.me/${chat.contactInfo.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium underline hover:opacity-80"
                    >
                      {chat.contactInfo}
                    </a>
                  </div>
                )}
              </div>
            </div>
            {chat.senderType === 'SELLER' && !chat.isRead && (
              <div className="w-6 flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}