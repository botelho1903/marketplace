'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EsqueciSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<'contact' | 'sent'>('contact');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateContact = (value: string, type: 'email' | 'phone') => {
    if (type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    // Telefone brasileiro: (11) 99999-9999 ou 11999999999
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateContact(contact, contactType)) {
      setError(contactType === 'email' ? 'Email inválido' : 'Telefone inválido (ex: 11999999999)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [contactType]: contact,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao solicitar reset');
        return;
      }

      setStep('sent');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Marketplace Botelho</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 'contact' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Esqueceu a senha?</h2>
              <p className="text-gray-600 text-center mb-8">
                Informe seu email ou telefone para receber instruções de redefinição.
              </p>

              {/* Toggle Email/Telefone */}
              <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setContactType('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    contactType === 'email'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📧 Email
                </button>
                <button
                  type="button"
                  onClick={() => setContactType('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    contactType === 'phone'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📱 Telefone
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                    {contactType === 'email' ? 'Email cadastrado' : 'Telefone cadastrado (com DDD)'}
                  </label>
                  <input
                    id="contact"
                    type={contactType === 'email' ? 'email' : 'tel'}
                    autoComplete={contactType === 'email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'seu@email.com' : '11999999999'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar instruções'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Lembrou a senha? <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">Fazer login</Link>
              </p>
            </>
          ) : (
            // Step: Sent
            <div className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instruções enviadas!</h3>
              <p className="text-gray-600 mb-6">
                Verifique seu {contactType === 'email' ? 'email' : 'SMS'} para redefinir sua senha.
                <br />
                <span className="text-sm">O link expira em 1 hora.</span>
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Ir para Login
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Marketplace Botelho
        </p>
      </div>
    </div>
  );
}