import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, PlusCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { employeeService } from '../../services/authService';
import { AddressForm } from '../../components/AddressForm';

interface TelefoneFormData {
  id?: string;
  phone_number: string;
  is_primary: boolean;
  country_code: string;
}

interface EnderecoFormData {
  street: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface DadosBancariosFormData {
  bank_name: string;
  bank_agency?: string;
  bank_account?: string;
  pix_key?: string;
  pix_key_type?: 'CPF' | 'Email' | 'Telefone' | 'Chave Aleatória' | 'Outro' | '';
}

interface CountryCode {
  id: number;
  name: string;
  country_iso_code: string;
  dial_code: string;
  flag_emoji: string;
}

interface FormData {
  full_name: string;
  contact_email: string;
  cpf: string;
  birth_date: string;
  phones: TelefoneFormData[];
  salary: string;
  hire_date: string;
  position?: string;
  is_active: boolean;
  zip_code: string;
  street: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  is_veterinarian: boolean;
  crmv_number?: string;
  crmv_state?: string;
  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;
  pix_key?: string;
  pix_key_type?: 'CPF' | 'Email' | 'Telefone' | 'Chave Aleatória' | 'Outro' | '';
  contract_id?: string | null;
}

export default function FormColaborador() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [brazilianStates, setBrazilianStates] = useState<Array<{ code: string; name: string }>>([]);
  const [isColaboradorInativoParaEdicao, setIsColaboradorInativoParaEdicao] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    contact_email: '',
    cpf: '',
    birth_date: '',
    phones: [{ phone_number: '', is_primary: true, country_code: '+55' }],
    salary: '',
    hire_date: new Date().toISOString().split('T')[0],
    position: '',
    is_active: true,
    zip_code: '',
    street: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil',
    is_veterinarian: false,
    crmv_number: '',
    crmv_state: '',
    bank_name: '',
    bank_agency: '',
    bank_account: '',
    pix_key: '',
    pix_key_type: '',
    contract_id: null,
  });

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      setErrorMessage(null);
      setIsColaboradorInativoParaEdicao(false);
      employeeService.getEmployeeById(id)
        .then(response => {
          const colaborador = response.employee;
          if (colaborador) {
            setFormData({
              full_name: colaborador.full_name || '',
              contact_email: colaborador.contact_email || '',
              cpf: colaborador.cpf || '',
              birth_date: colaborador.birth_date ? colaborador.birth_date.split('T')[0] : '',
              phones: colaborador.phones && colaborador.phones.length > 0 
                ? colaborador.phones.map((p: any) => ({
                    id: p.id,
                    phone_number: p.phone_number || '',
                    is_primary: p.is_primary || false,
                    country_code: p.country_code || '+55'
                  })) 
                : [{ phone_number: '', is_primary: true, country_code: '+55' }],
              salary: colaborador.salary?.toString() || '',
              hire_date: colaborador.hire_date ? colaborador.hire_date.split('T')[0] : '',
              position: colaborador.position || '',
              is_active: typeof colaborador.is_active === 'boolean' ? colaborador.is_active : true,
              zip_code: colaborador.zip_code || '',
              street: colaborador.street || '',
              address_number: colaborador.address_number || '',
              address_complement: colaborador.address_complement || '',
              neighborhood: colaborador.neighborhood || '',
              city: colaborador.city || '',
              state: colaborador.state || '',
              country: colaborador.country || 'Brasil',
              is_veterinarian: colaborador.is_veterinarian || false,
              crmv_number: colaborador.crmv_number || '',
              crmv_state: colaborador.crmv_state || '',
              bank_name: colaborador.bank_name || '',
              bank_agency: colaborador.bank_agency || '',
              bank_account: colaborador.bank_account || '',
              pix_key: colaborador.pix_key || '',
              pix_key_type: colaborador.pix_key_type || '',
              contract_id: colaborador.contract_id || null,
            });
            if (!colaborador.is_active) {
              setIsColaboradorInativoParaEdicao(true);
            }
          } else {
            setErrorMessage('Colaborador não encontrado.');
            setIsColaboradorInativoParaEdicao(true);
          }
        })
        .catch(err => {
          console.error("Erro ao buscar colaborador:", err);
          const apiError = err.response?.data?.message || err.message || 'Erro ao buscar dados do colaborador.';
          setErrorMessage(apiError);
          setIsColaboradorInativoParaEdicao(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsColaboradorInativoParaEdicao(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    employeeService.getCountryCodes()
      .then(response => {
        setCountryCodes(response.countries || []);
      })
      .catch(err => {
        console.error("Erro ao buscar códigos de país:", err);
      });

    employeeService.getBrazilianStates()
      .then(response => {
        setBrazilianStates(response.states || []);
      })
      .catch(err => {
        console.error("Erro ao buscar estados brasileiros:", err);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, fieldName?: keyof FormData, index?: number) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (isColaboradorInativoParaEdicao && name !== 'is_active') {
        return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));
  };
  
  const handleTelefoneChange = (index: number, field: keyof Omit<TelefoneFormData, 'phone_type'>, value: string | boolean) => {
    if (isColaboradorInativoParaEdicao) return;
    let newPhones = formData.phones.map((phone, i) => 
      i === index ? { ...phone, [field]: value } : phone
    );

    if (field === 'country_code') {
      const selectedCountry = countryCodes.find(c => c.country_iso_code === value);
      if (selectedCountry) {
        const dialCode = selectedCountry.dial_code;
        newPhones = newPhones.map((phone, i) => 
          i === index ? { ...phone, country_code: dialCode, phone_number: '' } : phone
        );
      }
    }
    
    if (field === 'phone_number' && typeof value === 'string') {
      const currentDialCode = newPhones[index].country_code;
      const maskedValue = applyPhoneMask(value, currentDialCode);
      newPhones = newPhones.map((phone, i) => 
        i === index ? { ...phone, phone_number: maskedValue } : phone
      );
    }

    if (field === 'is_primary' && value === true) {
      newPhones.forEach((phone, i) => {
        if (i !== index) {
          phone.is_primary = false;
        }
      });
    }
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const handleAddTelefone = () => {
    if (isColaboradorInativoParaEdicao) return;
    setFormData(prev => ({
      ...prev,
      phones: [...prev.phones, { phone_number: '', is_primary: prev.phones.length === 0, country_code: '+55' }]
    }));
  };

  const handleRemoveTelefone = (index: number) => {
    if (isColaboradorInativoParaEdicao) return;
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      if (!newPhones.some(p => p.is_primary) && newPhones.length > 0) {
        newPhones[0].is_primary = true;
      }
      setFormData(prev => ({ ...prev, phones: newPhones }));
    } else {
      alert("É necessário manter pelo menos um telefone.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isColaboradorInativoParaEdicao && !formData.is_active) {
        const colaboradorOriginalEstavaInativo = !formData.is_active;
        if (colaboradorOriginalEstavaInativo && !formData.is_active) {
            setErrorMessage("Não é possível salvar outras alterações em um colaborador inativo. Reative-o primeiro ou salve apenas a alteração do status para ativo.");
            return;
        }
    }

    setIsLoading(true);
    setErrorMessage(null);

    console.log('[handleSubmit] formData.salary ANTES do parseFloat:', formData.salary);
    const salaryFloat = parseFloat(formData.salary);
    console.log('[handleSubmit] salaryFloat APÓS parseFloat:', salaryFloat);

    const payload = {
      ...formData,
      salary: salaryFloat,
    };

    if (!payload.crmv_number) delete payload.crmv_number;
    if (!payload.crmv_state) delete payload.crmv_state;
    if (!payload.bank_name) delete payload.bank_name;
    if (!payload.bank_agency) delete payload.bank_agency;
    if (!payload.bank_account) delete payload.bank_account;
    if (!payload.pix_key) delete payload.pix_key;
    if (!payload.pix_key_type) delete payload.pix_key_type;
    if (!payload.contract_id) delete payload.contract_id;
    if (!payload.address_complement) delete payload.address_complement;
    if (!payload.position) delete payload.position;

    try {
      if (isEdit && id) {
        await employeeService.updateEmployee(id, payload);
        alert('Colaborador atualizado com sucesso!');
      } else {
        await employeeService.createEmployee(payload);
        alert('Colaborador criado com sucesso!');
      }
      navigate('/colaboradores');
    } catch (err: any) {
      console.error('Erro ao salvar colaborador:', err);
      const apiError = err.response?.data?.message || err.message || 'Erro ao salvar dados do colaborador.';
      setErrorMessage(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const applyPhoneMask = (phoneNumber: string, dialCode: string): string => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (dialCode === '+55') {
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`.slice(0,16);
    }
    return digits;
  };

  const disableFormFields = isEdit && isColaboradorInativoParaEdicao;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/colaboradores')}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h1>
        </div>
      </div>

      {isEdit && isColaboradorInativoParaEdicao && (
        <Alert variant="default" className="mb-6 border-yellow-500 text-yellow-700">
          <AlertTriangle className="h-4 w-4 !text-yellow-700" />
          <AlertTitle className="text-yellow-800">Colaborador Inativo</AlertTitle>
          <AlertDescription>
            Este colaborador está inativo. Apenas o status "Colaborador Ativo" pode ser modificado. Para editar outros dados, primeiro reative-o através da página de listagem ou detalhes.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset disabled={disableFormFields} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="text-sm font-medium block mb-1">Nome Completo *</label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  disabled={disableFormFields}
                />
              </div>
              <div>
                <label htmlFor="contact_email" className="text-sm font-medium block mb-1">E-mail *</label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  required
                  disabled={disableFormFields}
                />
              </div>
              <div>
                <label htmlFor="cpf" className="text-sm font-medium block mb-1">CPF *</label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={handleChange}
                  maxLength={14}
                  required
                  disabled={disableFormFields}
                />
              </div>
              <div>
                <label htmlFor="birth_date" className="text-sm font-medium block mb-1">Data de Nascimento *</label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                  disabled={disableFormFields}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-2">Telefones *</label>
                {formData.phones.map((tel, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 p-3 border rounded-md">
                    <div className="w-full sm:w-auto">
                      <label htmlFor={`country_code_${index}`} className="text-xs text-muted-foreground">Cód. País</label>
                      <Select
                        value={countryCodes.find(c => c.dial_code === tel.country_code)?.country_iso_code || ''}
                        onValueChange={(isoCode) => handleTelefoneChange(index, 'country_code', isoCode)}
                        disabled={disableFormFields}
                      >
                        <SelectTrigger id={`country_code_${index}`} className="w-full sm:w-[150px]"> 
                          <SelectValue placeholder="Cód." />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.length === 0 && <SelectItem value="BR" disabled>🇧🇷 +55 (Brasil)</SelectItem>}
                          {countryCodes.map(country => (
                            <SelectItem key={country.country_iso_code} value={country.country_iso_code}>
                              {country.flag_emoji} {country.dial_code} ({country.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-grow w-full sm:w-auto">
                      <label htmlFor={`phone_number_${index}`} className="text-xs text-muted-foreground">Número</label>
                      <Input
                        id={`phone_number_${index}`}
                        name="phone_number"
                        placeholder="Apenas números"
                        value={tel.phone_number}
                        onChange={(e) => handleTelefoneChange(index, 'phone_number', e.target.value)}
                        required={index === 0}
                        disabled={disableFormFields}
                      />
                    </div>
                    <div className="flex items-center pt-4 sm:pt-5">
                      <input 
                        type="checkbox" 
                        id={`is_primary_${index}`}
                        name="is_primary" 
                        checked={tel.is_primary}
                        onChange={(e) => handleTelefoneChange(index, 'is_primary', e.target.checked)}
                        className="mr-2 h-4 w-4 accent-primary"
                        disabled={disableFormFields}
                      />
                      <label htmlFor={`is_primary_${index}`} className="text-xs text-muted-foreground whitespace-nowrap">Principal?</label>
                    </div>

                    {formData.phones.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTelefone(index)} className="mt-4 sm:mt-0 self-center sm:self-end" disabled={disableFormFields}>
                        <XCircle className="h-5 w-5 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddTelefone} className="mt-2" disabled={disableFormFields}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Telefone
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="position" className="text-sm font-medium block mb-1">Cargo</label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position || ''}
                    onChange={handleChange}
                    placeholder="Ex: Desenvolvedor, Veterinário"
                    disabled={disableFormFields}
                  />
                </div>
                <div>
                  <label htmlFor="salary" className="text-sm font-medium block mb-1">Salário *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="salary"
                      name="salary"
                      className="pl-10 text-right"
                      value={formData.salary}
                      onChange={handleChange}
                      onBlur={(e) => {}}
                      placeholder="Ex: 2500.23"
                      required
                      disabled={disableFormFields}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="hire_date" className="text-sm font-medium block mb-1">Data de Admissão *</label>
                  <Input
                    id="hire_date"
                    name="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={handleChange}
                    required
                    disabled={disableFormFields}
                  />
                </div>
                <div className="flex items-center space-x-2 md:pt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Colaborador Ativo
                  </label>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_veterinarian"
                    name="is_veterinarian"
                    checked={formData.is_veterinarian}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    disabled={disableFormFields}
                  />
                  <label htmlFor="is_veterinarian" className="text-sm font-medium">
                    É Veterinário?
                  </label>
              </div>
              {formData.is_veterinarian && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                   <div>
                      <label htmlFor="crmv_number" className="text-sm font-medium block mb-1">CRMV</label>
                      <Input
                          id="crmv_number"
                          name="crmv_number"
                          value={formData.crmv_number || ''}
                          onChange={handleChange}
                          placeholder="Ex: 12345"
                          disabled={disableFormFields}
                      />
                   </div>
                   <div>
                      <label htmlFor="crmv_state" className="text-sm font-medium block mb-1">UF do CRMV</label>
                      <Select
                        value={formData.crmv_state || ''}
                        onValueChange={(value) => handleChange({ target: { name: 'crmv_state', value } } as any)}
                        disabled={disableFormFields}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map((state) => (
                            <SelectItem key={state.code} value={state.code}>
                              {state.code} - {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressForm
                data={{
                  zip_code: formData.zip_code,
                  country: formData.country,
                  street: formData.street,
                  address_number: formData.address_number,
                  address_complement: formData.address_complement,
                  neighborhood: formData.neighborhood,
                  city: formData.city,
                  state: formData.state
                }}
                onChange={(field, value) => {
                  setFormData(prev => ({ ...prev, [field]: value }));
                }}
                disabled={disableFormFields}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bank_name" className="text-sm font-medium block mb-1">Banco</label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name || ''}
                  onChange={handleChange}
                  disabled={disableFormFields}
                />
              </div>
              <div>
                <label htmlFor="bank_agency" className="text-sm font-medium block mb-1">Agência</label>
                <Input
                  id="bank_agency"
                  name="bank_agency"
                  value={formData.bank_agency || ''}
                  onChange={handleChange}
                  disabled={disableFormFields}
                />
              </div>
              <div>
                <label htmlFor="bank_account" className="text-sm font-medium block mb-1">Conta</label>
                <Input
                  id="bank_account"
                  name="bank_account"
                  value={formData.bank_account || ''}
                  onChange={handleChange}
                  disabled={disableFormFields}
                />
              </div>
              <div>
                <label htmlFor="pix_key" className="text-sm font-medium block mb-1">Chave PIX</label>
                <Input
                  id="pix_key"
                  name="pix_key"
                  value={formData.pix_key || ''}
                  onChange={handleChange}
                  disabled={disableFormFields}
                />
              </div>
              <div>
                <label htmlFor="pix_key_type" className="text-sm font-medium block mb-1">Tipo de Chave PIX</label>
                <Select
                  name="pix_key_type"
                  value={formData.pix_key_type || ''}
                  onValueChange={(value) => {
                    if (isColaboradorInativoParaEdicao) return;
                    setFormData(prev => ({...prev, pix_key_type: value as FormData['pix_key_type']}))
                  }}
                  disabled={disableFormFields}
                >
                  <SelectTrigger id="pix_key_type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="Email">E-mail</SelectItem>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                    <SelectItem value="Chave Aleatória">Chave Aleatória</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </fieldset>

        <div className="flex justify-end space-x-3">
          {errorMessage && (
            <p className="text-sm text-red-600 mr-auto"><Badge variant="destructive">Erro:</Badge> {errorMessage}</p>
          )}
          <Button type="button" variant="outline" onClick={() => navigate('/colaboradores')} disabled={isLoading && !isColaboradorInativoParaEdicao}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || (isEdit && isColaboradorInativoParaEdicao && !formData.is_active)}>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Salvar Colaborador</>
            )}
          </Button>
        </div>
      </form>

      {isEdit && isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-semibold">Carregando dados do colaborador...</p>
          </div>
        </div>
      )}
    </div>
  );
} 