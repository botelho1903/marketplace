'use client';

import { useState } from 'react';

interface GuestAddress {
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

interface GuestAddressFormProps {
  address: GuestAddress | null;
  onSave: (address: Omit<GuestAddress, 'id'>) => void;
}

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function GuestAddressForm({ address, onSave }: GuestAddressFormProps) {
  const [formData, setFormData] = useState<Omit<GuestAddress, 'complement'> & { complement: string }>({
    name: address?.name || '',
    phone: address?.phone || '',
    cep: address?.cep || '',
    street: address?.street || '',
    number: address?.number || '',
    complement: address?.complement || '',
    neighborhood: address?.neighborhood || '',
    city: address?.city || '',
    state: address?.state || '',
    country: address?.country || 'Brasil',
  });
  const [saving, setSaving] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'cep') setCepError(null);
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
      } else {
        setCepError('CEP não encontrado');
      }
    } catch {
      setCepError('Erro ao buscar CEP');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const required = ['name', 'phone', 'cep', 'street', 'number', 'neighborhood', 'city', 'state'];
    const missing = required.filter(f => !formData[f as keyof GuestAddress]);

    if (missing.length > 0) {
      alert(`Preencha: ${missing.join(', ')}`);
      return;
    }

    setSaving(true);
    onSave(formData);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Endereço de Entrega</h2>
      <p className="text-sm text-gray-500 mb-6">
        Seus dados ficam criptografados e só o vendedor vê após confirmação
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="(11) 99999-9999"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
            <input
              type="text"
              value={formData.cep}
              onChange={(e) => handleChange('cep', e.target.value)}
              onBlur={handleCepBlur}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="00000-000"
              maxLength={9}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        {cepError && <p className="text-red-600 text-sm">{cepError}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rua/Avenida *</label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => handleChange('street', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
          <input
            type="text"
            value={formData.complement}
            onChange={(e) => handleChange('complement', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Apto, bloco, casa..."
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecione</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {saving ? 'Salvando...' : 'Salvar Endereço Seguro'}
          </button>
        </div>

        {address && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">Endereço salvo com segurança ✓</p>
            <p className="text-xs text-green-600 mt-1">
              {address.street}, {address.number} - {address.neighborhood}, {address.city}/{address.state} - {address.cep}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}