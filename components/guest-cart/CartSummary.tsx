'use client';

import { formatCurrency } from '@/lib/utils';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onFinalize: () => void;
  hasAddress: boolean;
  status: string;
}

const SHIPPING_COST = 15.00;

export function CartSummary({ subtotal, itemCount, onFinalize, hasAddress, status }: CartSummaryProps) {
  const total = subtotal + SHIPPING_COST;
  const canFinalize = itemCount > 0 && hasAddress && status === 'CONTACTED';

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 h-fit">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} itens)</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Frete</span>
          <span className="font-medium text-gray-900">{formatCurrency(SHIPPING_COST)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {!hasAddress ? (
          <button
            disabled
            className="w-full py-3 bg-gray-200 text-gray-500 font-medium rounded-lg cursor-not-allowed"
          >
            Adicione endereço para continuar
          </button>
        ) : status !== 'CONTACTED' ? (
          <button
            disabled
            className="w-full py-3 bg-yellow-100 text-yellow-700 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Aguardando vendedor responder no chat
          </button>
        ) : (
          <button
            onClick={onFinalize}
            className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Ir para Pagamento
          </button>
        )}

        <p className="text-xs text-center text-gray-500">
          Pagamento seguro via Stripe / Mercado Pago
        </p>
      </div>

      {/* Status indicator */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-3 h-3 rounded-full ${
            status === 'ACTIVE' ? 'bg-green-500' :
            status === 'CONTACTED' ? 'bg-blue-500' :
            status === 'CONVERTED' ? 'bg-purple-500' : 'bg-gray-300'
          }`} />
          <span className="font-medium text-gray-700">
            {status === 'ACTIVE' && 'Carrinho ativo - aguardando vendedor'}
            {status === 'CONTACTED' && 'Vendedor respondeu - pronto para fechar'}
            {status === 'CONVERTED' && 'Convertido em pedido'}
          </span>
        </div>
      </div>
    </div>
  );
}