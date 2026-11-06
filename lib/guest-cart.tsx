'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AddToGuestCartParams {
  productId: string;
  variantId?: string;
  quantity?: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  notes?: string;
  siteId?: string;
}

export function useGuestCart() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addToGuestCart = useCallback(async (params: AddToGuestCartParams) => {
    setLoading(true);
    try {
      const response = await fetch('/api/guest-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar ao carrinho');
      }

      toast.success('Adicionado ao carrinho!');

      // Retorna o token para criar link direto
      const guestToken = data.guestCart?.guestToken;
      const guestName = data.guestCart?.guestName;

      if (guestToken && guestName) {
        const directLink = `${window.location.origin}/carrinho/${encodeURIComponent(guestName)}?token=${guestToken}`;
        return { success: true, guestCart: data.guestCart, directLink };
      }

      return { success: true, guestCart: data.guestCart };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar');
      return { success: false, error: error instanceof Error ? error.message : 'Erro' };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateDirectLink = useCallback((guestName: string, guestToken: string) => {
    return `${window.location.origin}/carrinho/${encodeURIComponent(guestName)}?token=${guestToken}`;
  }, []);

  return { addToGuestCart, generateDirectLink, loading };
}

// Função utilitária para criar link compartilhável
export function createGuestCartLink(guestName: string, guestToken: string, baseUrl: string = ''): string {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin}/carrinho/${encodeURIComponent(guestName)}?token=${guestToken}`;
}

// Componente de botão para adicionar ao carrinho guest
export function GuestCartButton({
  productId,
  variantId,
  guestName,
  guestEmail,
  guestPhone,
  children,
  className = ''
}: {
  productId: string;
  variantId?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { addToGuestCart, loading } = useGuestCart();

  const handleClick = async () => {
    if (!guestName.trim()) {
      toast.error('Digite seu nome para salvar o carrinho');
      return;
    }

    const result = await addToGuestCart({ productId, variantId, guestName, guestEmail, guestPhone });

    if (result.success && result.directLink) {
      // Copia link para clipboard
      navigator.clipboard.writeText(result.directLink).then(() => {
        toast.success('Link do carrinho copiado! Compartilhe com o vendedor.');
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v18a2 2 0 002 2h2m12-2V9a2 2 0 00-2-2h-2m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 16l4-4m0 0l4 4m-4-4v12" />
        </svg>
      )}
      {children}
    </button>
  );
}