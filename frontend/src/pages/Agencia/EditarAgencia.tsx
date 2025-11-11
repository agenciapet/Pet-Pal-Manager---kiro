import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockAgencia } from '../../data/mockData';
import type { Agencia as AgenciaType } from '../../data/mockData';
import { employeeService } from '../../services/authService';
import { AddressForm } from '../../components/AddressForm';

interface FormSocio {
  nome_completo: string;
  cpf: string;
  data_nascimento?: string;
  email: string;
  telefone: string;
  is_veterinario: boolean;
  crmv?: string;
  crmv_uf?: string;
}

interface FormData {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  data_fundacao: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    pais: string;
  };
  telefones: { numero: string; tipo?: 'principal' | 'celular' | 'trabalho' | 'outro' }[];
  socios: FormSocio[];
  logo_url?: string;
  favicon_url?: string;
}

export default function EditarAgencia() {
  const navigate = useNavigate();

  const [initialAgenciaData] = React.useState<AgenciaType>(() => {
    try {
      const agenciaSalva = localStorage.getItem('agenciaPPM');
      if (agenciaSalva) {
        return JSON.parse(agenciaSalva);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da agência do localStorage para edição:", error);
    }
    return mockAgencia;
  });

  const [formData, setFormData] = useState<FormData>({
    razao_social: initialAgenciaData.razao_social,
    nome_fantasia: initialAgenciaData.nome_fantasia || '',
    cnpj: initialAgenciaData.cnpj,
    data_fundacao: initialAgenciaData.data_fundacao,
    endereco: {
      ...initialAgenciaData.endereco,
      complemento: initialAgenciaData.endereco.complemento || '',
      pais: initialAgenciaData.endereco.pais || ''
    },
    telefones: initialAgenciaData.telefones.map(telefone => ({
      numero: telefone.numero,
      tipo: telefone.tipo
    })),
    socios: initialAgenciaData.socios.map(socio => ({
      nome_completo: socio.nome_completo,
      cpf: socio.cpf,
      data_nascimento: socio.data_nascimento || '',
      email: socio.email,
      telefone: socio.telefone,
      is_veterinario: socio.is_veterinario,
      crmv: socio.crmv,
      crmv_uf: socio.crmv_uf
    })),
    logo_url: initialAgenciaData.logo_url || '',
    favicon_url: initialAgenciaData.favicon_url || ''
  });

  const [brazilianStates, setBrazilianStates] = useState<Array<{ code: string; name: string }>>([]);

  useEffect(() => {
    // Buscar estados brasileiros
    employeeService.getBrazilianStates()
      .then(response => {
        setBrazilianStates(response.states || []);
      })
      .catch(err => {
        console.error("Erro ao buscar estados brasileiros:", err);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Atualizar mockAgencia (simulando salvamento no backend)
    mockAgencia.razao_social = formData.razao_social;
    mockAgencia.nome_fantasia = formData.nome_fantasia;
    mockAgencia.cnpj = formData.cnpj;
    mockAgencia.data_fundacao = formData.data_fundacao;
    mockAgencia.endereco = { ...formData.endereco };
    mockAgencia.telefones = formData.telefones.map(telefone => ({
      numero: telefone.numero,
      tipo: telefone.tipo
    }));
    mockAgencia.socios = formData.socios.map(s => ({
        ...s,
        id: s.cpf,
        data_entrada_sociedade: new Date().toISOString(),
        participacao_cotas: 0,
        is_administrador: false,
        is_responsavel_tecnico: s.is_veterinario && !!s.crmv,
        crmv_status: s.is_veterinario && s.crmv ? 'verificado' : undefined
    }));
    mockAgencia.logo_url = formData.logo_url;
    mockAgencia.favicon_url = formData.favicon_url;

    // Simular persistência em localStorage para a agência
    try {
      localStorage.setItem('agenciaPPM', JSON.stringify(mockAgencia));
      console.log('Dados da agência salvos no localStorage:', mockAgencia);
      alert('Dados da agência atualizados com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar dados da agência no localStorage:", error);
      alert('Erro ao salvar dados da agência.');
    }

    navigate('/agencia');
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const addTelefone = () => {
    setFormData({
      ...formData,
      telefones: [...formData.telefones, { numero: '', tipo: 'principal' }]
    });
  };

  const removeTelefone = (index: number) => {
    setFormData({
      ...formData,
      telefones: formData.telefones.filter((_, i) => i !== index)
    });
  };

  const updateTelefone = (index: number, field: 'numero' | 'tipo', value: string) => {
    const newTelefones = [...formData.telefones];
    newTelefones[index] = { 
      ...newTelefones[index], 
      [field]: field === 'numero' ? formatPhone(value) : value 
    };
    setFormData({ ...formData, telefones: newTelefones });
  };

  const addSocio = () => {
    setFormData({
      ...formData,
      socios: [
        ...formData.socios,
        {
          nome_completo: '',
          cpf: '',
          data_nascimento: '',
          email: '',
          telefone: '',
          is_veterinario: false
        }
      ]
    });
  };

  const removeSocio = (index: number) => {
    setFormData({
      ...formData,
      socios: formData.socios.filter((_, i) => i !== index)
    });
  };

  const updateSocio = (index: number, field: string, value: any) => {
    const newSocios = [...formData.socios];
    newSocios[index] = {
      ...newSocios[index],
      [field]: value
    };
    setFormData({ ...formData, socios: newSocios });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/agencia')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Editar Dados da Agência</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Razão Social *</label>
              <Input
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nome Fantasia</label>
              <Input
                value={formData.nome_fantasia}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">CNPJ *</label>
              <Input
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                maxLength={18}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL da Logo</label>
              <Input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL do Favicon</label>
              <Input
                type="url"
                value={formData.favicon_url}
                onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                placeholder="https://exemplo.com/favicon.ico"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Fundação *</label>
              <Input
                type="date"
                value={formData.data_fundacao}
                onChange={(e) => setFormData({ ...formData, data_fundacao: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm
              data={{
                zip_code: formData.endereco.cep,
                country: formData.endereco.pais,
                street: formData.endereco.logradouro,
                address_number: formData.endereco.numero,
                address_complement: formData.endereco.complemento,
                neighborhood: formData.endereco.bairro,
                city: formData.endereco.cidade,
                state: formData.endereco.estado
              }}
              onChange={(field, value) => {
                const fieldMapping: Record<string, string> = {
                  zip_code: 'cep',
                  country: 'pais',
                  street: 'logradouro',
                  address_number: 'numero',
                  address_complement: 'complemento',
                  neighborhood: 'bairro',
                  city: 'cidade',
                  state: 'estado'
                };
                setFormData({
                  ...formData,
                  endereco: { ...formData.endereco, [fieldMapping[field]]: value }
                });
              }}
            />
          </CardContent>
        </Card>

        {/* Telefones */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Telefones</CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={addTelefone}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Telefone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.telefones.map((telefone, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={telefone.numero}
                  onChange={(e) => updateTelefone(index, 'numero', e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
                <Input
                  value={telefone.tipo || 'principal'}
                  onChange={(e) => updateTelefone(index, 'tipo', e.target.value)}
                  placeholder="Tipo"
                />
                {formData.telefones.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTelefone(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sócios */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sócios</CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={addSocio}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Sócio
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.socios.map((socio, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Sócio {index + 1}</h4>
                  {formData.socios.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSocio(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome Completo *</label>
                    <Input
                      value={socio.nome_completo}
                      onChange={(e) => updateSocio(index, 'nome_completo', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">CPF *</label>
                    <Input
                      value={socio.cpf}
                      onChange={(e) => updateSocio(index, 'cpf', formatCPF(e.target.value))}
                      maxLength={14}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data de Nascimento</label>
                    <Input
                      type="date"
                      value={socio.data_nascimento || ''}
                      onChange={(e) => updateSocio(index, 'data_nascimento', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-mail *</label>
                    <Input
                      type="email"
                      value={socio.email}
                      onChange={(e) => updateSocio(index, 'email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefone *</label>
                    <Input
                      value={socio.telefone}
                      onChange={(e) => updateSocio(index, 'telefone', formatPhone(e.target.value))}
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={socio.is_veterinario}
                      onChange={(e) => updateSocio(index, 'is_veterinario', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>É Veterinário</span>
                  </label>

                  {socio.is_veterinario && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium">CRMV *</label>
                        <Input
                          value={socio.crmv || ''}
                          onChange={(e) => updateSocio(index, 'crmv', e.target.value)}
                          placeholder="Número do CRMV"
                          required={socio.is_veterinario}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">UF do CRMV *</label>
                        <Select
                          value={socio.crmv_uf || ''}
                          onValueChange={(value) => updateSocio(index, 'crmv_uf', value)}
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
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/agencia')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
} 