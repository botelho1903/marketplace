'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { GuestCartClient } from '@/components/guest-cart/GuestCartClient';

export default function GuestCartPage() {
  const params = useParams();
  const router = useRouter();
  const nome = params.nome as string;

  if (!nome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Carrinho não encontrado</h1>
          <p className="mt-2 text-gray-600">Nome do carrinho não informado</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 hover:underline">
            Voltar à loja
          </Link>
        </div>
      </div>
    );
  }

  return <GuestCartClient guestName={nome} />;
}