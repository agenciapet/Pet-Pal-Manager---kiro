import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { employeeService } from '../../services/authService';

interface AddressData {
  zip_code: string;
  country: string;
  street: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  default?: boolean;
}

interface State {
  code: string;
  name: string;
}

interface AddressFormProps {
  data: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
  disabled?: boolean;
}

interface AddressLabels {
  zip_code: string;
  country: string;
  street: string;
  address_number: string;
  address_complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const getLabelsForCountry = (countryCode: string): AddressLabels => {
  const labelsByCountry: Record<string, AddressLabels> = {
    BR: {
      zip_code: 'CEP',
      country: 'País',
      street: 'Rua',
      address_number: 'Número',
      address_complement: 'Complemento',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado'
    },
    US: {
      zip_code: 'ZIP Code',
      country: 'Country',
      street: 'Street',
      address_number: 'Number',
      address_complement: 'Apt/Suite/Other',
      neighborhood: 'Neighborhood',
      city: 'City',
      state: 'State'
    },
    PT: {
      zip_code: 'CP',
      country: 'País',
      street: 'Morada',
      address_number: 'Número',
      address_complement: 'Andar',
      neighborhood: 'Bairro',
      city: 'Freguesia',
      state: 'Distrito'
    }
  };

  return labelsByCountry[countryCode] || labelsByCountry.BR;
};

const AddressForm: React.FC<AddressFormProps> = ({ data, onChange, disabled = false }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [addressFieldsDisabled, setAddressFieldsDisabled] = useState(false);

  const labels = getLabelsForCountry(data.country || 'BR');

  useEffect(() => {
    // Buscar países
    employeeService.getCountries()
      .then(response => {
        setCountries(response.countries || []);
        // Se não há país selecionado, selecionar Brasil como padrão
        if (!data.country) {
          const defaultCountry = response.countries.find(c => c.default);
          if (defaultCountry) {
            onChange('country', defaultCountry.code);
          }
        }
      })
      .catch(err => {
        console.error("Erro ao buscar países:", err);
        // Fallback para dados básicos
        const fallbackCountries = [
          { code: 'BR', name: 'Brasil', flag: '🇧🇷', default: true },
          { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
          { code: 'AR', name: 'Argentina', flag: '🇦🇷' }
        ];
        setCountries(fallbackCountries);
        if (!data.country) {
          onChange('country', 'BR');
        }
      });

    // Buscar estados brasileiros
    employeeService.getBrazilianStates()
      .then(response => {
        setStates(response.states || []);
      })
      .catch(err => {
        console.error("Erro ao buscar estados brasileiros:", err);
        // Fallback para estados brasileiros básicos
        const fallbackStates = [
          { code: 'SP', name: 'São Paulo' },
          { code: 'RJ', name: 'Rio de Janeiro' },
          { code: 'MG', name: 'Minas Gerais' },
          { code: 'RS', name: 'Rio Grande do Sul' },
          { code: 'PR', name: 'Paraná' },
          { code: 'SC', name: 'Santa Catarina' },
          { code: 'BA', name: 'Bahia' },
          { code: 'GO', name: 'Goiás' },
          { code: 'PE', name: 'Pernambuco' },
          { code: 'CE', name: 'Ceará' }
        ];
        setStates(fallbackStates);
      });
  }, []);

  const handleCepChange = async (cep: string) => {
    onChange('zip_code', cep);

    // Se for Brasil e CEP tiver 8 dígitos, buscar endereço
    if (data.country === 'BR' && cep.replace(/\D/g, '').length === 8) {
      setIsLoadingCep(true);
      setAddressFieldsDisabled(true);

      try {
        const response = await employeeService.getAddressByCep(cep);
        const address = response.address;

        // Preencher campos automaticamente
        onChange('street', address.street);
        onChange('neighborhood', address.neighborhood);
        onChange('city', address.city);
        onChange('state', address.state);
        
        setAddressFieldsDisabled(false);
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setAddressFieldsDisabled(false);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleCountryChange = (countryCode: string) => {
    onChange('country', countryCode);
    
    // Limpar campos quando mudar de país
    if (countryCode !== data.country) {
      onChange('zip_code', '');
      onChange('street', '');
      onChange('neighborhood', '');
      onChange('city', '');
      onChange('state', '');
      setAddressFieldsDisabled(false);
    }
  };

  const formatCEP = (value: string) => {
    if (data.country === 'BR') {
      return value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* CEP */}
      <div>
        <label className="text-sm font-medium block mb-1">{labels.zip_code} *</label>
        <Input
          value={formatCEP(data.zip_code)}
          onChange={(e) => handleCepChange(e.target.value)}
          placeholder={data.country === 'BR' ? '00000-000' : labels.zip_code}
          disabled={disabled || isLoadingCep}
        />
        {isLoadingCep && (
          <p className="text-xs text-gray-500 mt-1">Buscando endereço...</p>
        )}
      </div>

      {/* País */}
      <div>
        <label className="text-sm font-medium block mb-1">{labels.country} *</label>
        <Select
          value={data.country || 'BR'}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.flag} {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rua */}
      <div>
        <label className="text-sm font-medium block mb-1">{labels.street} *</label>
        <Input
          value={data.street}
          onChange={(e) => onChange('street', e.target.value)}
          placeholder={labels.street}
          disabled={disabled || (data.country === 'BR' && addressFieldsDisabled)}
        />
      </div>

      {/* Número */}
      <div>
        <label className="text-sm font-medium block mb-1">{labels.address_number} *</label>
        <Input
          value={data.address_number}
          onChange={(e) => onChange('address_number', e.target.value)}
          placeholder={labels.address_number}
          disabled={disabled}
        />
      </div>

      {/* Complemento */}
      <div>
        <label className="text-sm font-medium block mb-1">{labels.address_complement}</label>
        <Input
          value={data.address_complement || ''}
          onChange={(e) => onChange('address_complement', e.target.value)}
          placeholder={labels.address_complement}
          disabled={disabled}
        />
      </div>

      {/* Bairro */}
      <div>
        <label className="text-sm font-medium block mb-1">{labels.neighborhood} *</label>
        <Input
          value={data.neighborhood}
          onChange={(e) => onChange('neighborhood', e.target.value)}
          placeholder={labels.neighborhood}
          disabled={disabled || (data.country === 'BR' && addressFieldsDisabled)}
        />
      </div>

      {/* Cidade */}
      <div>
        <label className="text-sm font-medium block mb-1">{labels.city} *</label>
        {data.country === 'BR' ? (
          <Input
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder={labels.city}
            disabled={disabled || addressFieldsDisabled}
          />
        ) : (
          <Input
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder={labels.city}
            disabled={disabled}
          />
        )}
      </div>

      {/* Estado */}
      <div>
        <label className="text-sm font-medium block mb-1">{labels.state} *</label>
        {data.country === 'BR' ? (
          <Select
            value={data.state || ''}
            onValueChange={(value) => onChange('state', value)}
            disabled={disabled || addressFieldsDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.code} - {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={data.state}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder={labels.state}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

export default AddressForm;