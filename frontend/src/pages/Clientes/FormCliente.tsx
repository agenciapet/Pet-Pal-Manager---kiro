import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import mockData from '../../data/mockData';
import { employeeService, clientService } from '../../services/authService';
import { AddressForm } from '../../components/AddressForm';

interface FormRepresentante {
  id?: string;
  nome_completo: string;
  cpf: string;
  data_nascimento?: string;
  email: string;
  telefones: { numero: string; tipo?: 'principal' | 'celular' | 'trabalho' | 'outro' }[];
  cargo: string;
  is_socio: boolean;
  is_responsavel_tecnico: boolean;
  is_veterinario: boolean;
  crmv?: string;
  crmv_uf?: string;
}

interface FormUnidade {
  id?: string;
  nome_unidade: string;
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
  representantes: FormRepresentante[];
}

interface FormData {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefones: { numero: string; tipo?: 'principal' | 'celular' | 'trabalho' | 'outro' }[];
  tipo_empresa: 'Consultório' | 'Clínica' | 'Hospital' | 'Veterinário Volante' | 'Veterinário Autônomo' | 'PetShop' | 'Petshop com Clínica' | 'Parceria' | 'Outros';
  porte: 'Pequena' | 'Média' | 'Grande' | 'Multinacional';
  status: 'ativo' | 'inadimplente' | 'contrato_cancelado' | 'inativo' | 'em_negociacao' | 'prospect';
  // Novos campos da empresa
  numero_registro_cfmv_crmv?: string;
  data_abertura?: string;
  capital_social?: string;
  faturamento_anual?: string;
  situacao?: string;
  optante_simples_nacional?: boolean;
  unidades: FormUnidade[];
  historico_alteracoes?: { data_alteracao: string; usuario_responsavel: string; detalhes_alteracao: string[]; }[];
  servicos_contratados?: string[];
}

export default function FormCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [initialData, setInitialData] = useState<FormData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    email: '',
    telefones: [{ numero: '+55 ', tipo: 'principal' }],
    tipo_empresa: 'Clínica',
    porte: 'Média',
    status: 'ativo',
    // Novos campos da empresa
    numero_registro_cfmv_crmv: '',
    data_abertura: '',
    capital_social: '',
    faturamento_anual: '',
    situacao: '',
    optante_simples_nacional: false,
    unidades: [
      {
        nome_unidade: 'Matriz',
        endereco: {
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          pais: 'Brasil'
        },
        telefones: [{ numero: '+55 ', tipo: 'principal' }],
        representantes: [{
          nome_completo: '',
          cpf: '',
          email: '',
          telefones: [{ numero: '+55 ', tipo: 'principal' }],
          cargo: '',
          is_socio: false,
          is_responsavel_tecnico: false,
          is_veterinario: false,
          crmv: '',
          crmv_uf: ''
        }]
      }
    ]
  });

  const [brazilianStates, setBrazilianStates] = useState<Array<{ code: string; name: string }>>([]);

  useEffect(() => {
    if (isEdit) {
      const clienteCarregado = mockData.mockClientes.find(c => c.id === id);
      if (clienteCarregado) {
        const dadosCarregados = JSON.parse(JSON.stringify(clienteCarregado)); // Cópia profunda
        setFormData(dadosCarregados);
        setInitialData(dadosCarregados);
      }
    }

    // Buscar estados brasileiros
    employeeService.getBrazilianStates()
      .then(response => {
        setBrazilianStates(response.states || []);
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
        setBrazilianStates(fallbackStates);
      });
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Converter dados do frontend para o formato do backend
      const clientData = {
        company_name: formData.razao_social,
        trade_name: formData.nome_fantasia,
        cnpj: formData.cnpj.replace(/\D/g, ''), // Remove formatação
        contact_email: formData.email,
        company_type: formData.tipo_empresa,
        // Adicionar outros campos conforme necessário
        is_active: true
      };

      let response;
      if (isEdit && id) {
        response = await clientService.updateClient(id, clientData);
        alert('Cliente atualizado com sucesso!');
      } else {
        response = await clientService.createClient(clientData);
        alert('Cliente criado com sucesso!');
      }

      console.log('Cliente salvo:', response);
      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente.');
    }
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
    const cleaned = value.replace(/[^\d+\s]/g, '');
    
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    return cleaned
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

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    
    const number = parseInt(numericValue) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const addUnidade = () => {
    setFormData(prev => ({
      ...prev,
      unidades: [
        ...prev.unidades,
        {
          nome_unidade: `Filial ${prev.unidades.length + 1}`,
          endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '', pais: 'Brasil' },
          telefones: [{ numero: '+55 ', tipo: 'principal' }],
          representantes: [{
            nome_completo: '',
            cpf: '',
            email: '',
            telefones: [{ numero: '+55 ', tipo: 'principal' }],
            cargo: '',
            is_socio: false,
            is_responsavel_tecnico: false,
            is_veterinario: false,
            crmv: '',
            crmv_uf: ''
          }]
        }
      ]
    }));
  };

  const removeUnidade = (unidadeIndex: number) => {
    if (formData.unidades.length === 1) {
      alert("É necessário ter pelo menos uma unidade.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      unidades: prev.unidades.filter((_, i) => i !== unidadeIndex)
    }));
  };

  const updateUnidade = (unidadeIndex: number, field: string, value: any) => {
    const newUnidades = [...formData.unidades];
    (newUnidades[unidadeIndex] as any)[field] = value;
    setFormData({ ...formData, unidades: newUnidades });
  };
  
  const updateUnidadeEndereco = (unidadeIndex: number, field: string, value: string) => {
    const newUnidades = [...formData.unidades];
    (newUnidades[unidadeIndex].endereco as any)[field] = value;
    setFormData({ ...formData, unidades: newUnidades });
  };

  const addRepresentante = (unidadeIndex: number) => {
    const newUnidades = [...formData.unidades];
    newUnidades[unidadeIndex].representantes.push({
      nome_completo: '',
      cpf: '',
      email: '',
      telefones: [{ numero: '+55 ', tipo: 'principal' }],
      cargo: '',
      is_socio: false,
      is_responsavel_tecnico: false,
      is_veterinario: false,
      crmv: '',
      crmv_uf: ''
    });
    setFormData({ ...formData, unidades: newUnidades });
  };

  const removeRepresentante = (unidadeIndex: number, repIndex: number) => {
    const newUnidades = [...formData.unidades];
    if (newUnidades[unidadeIndex].representantes.length === 1 && formData.unidades.length > 1 && newUnidades[unidadeIndex].representantes.length === 1) {
        // Não permite remover o último representante se for a única unidade com representante.
        // Ou se for a última unidade, não permite remover o último representante.
        // A lógica exata depende do requisito, mas por segurança, não deixamos a unidade sem representante se for a única.
    }
    newUnidades[unidadeIndex].representantes = newUnidades[unidadeIndex].representantes.filter((_, i) => i !== repIndex);
    setFormData({ ...formData, unidades: newUnidades });
  };

  const updateRepresentante = (unidadeIndex: number, repIndex: number, field: string, value: any) => {
    const newUnidades = [...formData.unidades];
    (newUnidades[unidadeIndex].representantes[repIndex] as any)[field] = value;
    setFormData({ ...formData, unidades: newUnidades });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
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
              <label className="text-sm font-medium">Nome Fantasia *</label>
              <Input
                value={formData.nome_fantasia}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                required
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
              <label className="text-sm font-medium">E-mail *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefone (Principal) *</label>
              <Input
                value={formData.telefones[0].numero}
                onChange={(e) => setFormData({ ...formData, telefones: [{ ...formData.telefones[0], numero: formatPhone(e.target.value) }] })}
                maxLength={15}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo da Empresa *</label>
              <select
                value={formData.tipo_empresa}
                onChange={(e) => setFormData({ ...formData, tipo_empresa: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="Consultório">Consultório</option>
                <option value="Clínica">Clínica</option>
                <option value="Hospital">Hospital</option>
                <option value="Veterinário Volante">Veterinário Volante</option>
                <option value="Veterinário Autônomo">Veterinário Autônomo</option>
                <option value="PetShop">PetShop</option>
                <option value="Petshop com Clínica">Petshop com Clínica</option>
                <option value="Parceria">Parceria</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Porte *</label>
              <select
                value={formData.porte}
                onChange={(e) => setFormData({ ...formData, porte: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="Pequena">Pequena</option>
                <option value="Média">Média</option>
                <option value="Grande">Grande</option>
                <option value="Multinacional">Multinacional</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status do Cliente</label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as FormData['status']}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inadimplente">Inadimplente</SelectItem>
                  <SelectItem value="contrato_cancelado">Contrato Cancelado</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Número de Registro CFMV/CRMV</label>
              <Input
                value={formData.numero_registro_cfmv_crmv || ''}
                onChange={(e) => setFormData({ ...formData, numero_registro_cfmv_crmv: e.target.value })}
                placeholder="Ex: 12345/SP"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Abertura</label>
              <Input
                type="date"
                value={formData.data_abertura || ''}
                onChange={(e) => setFormData({ ...formData, data_abertura: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capital Social</label>
              <Input
                value={formData.capital_social || ''}
                onChange={(e) => setFormData({ ...formData, capital_social: formatCurrency(e.target.value) })}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Faturamento Anual</label>
              <Input
                value={formData.faturamento_anual || ''}
                onChange={(e) => setFormData({ ...formData, faturamento_anual: formatCurrency(e.target.value) })}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Situação</label>
              <Select 
                value={formData.situacao || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, situacao: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="suspensa">Suspensa</SelectItem>
                  <SelectItem value="baixada">Baixada</SelectItem>
                  <SelectItem value="inapta">Inapta</SelectItem>
                  <SelectItem value="nula">Nula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="optante_simples_nacional"
                checked={formData.optante_simples_nacional || false}
                onChange={(e) => setFormData({ ...formData, optante_simples_nacional: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="optante_simples_nacional" className="text-sm font-medium">
                Optante pelo Simples Nacional
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Unidades */}
        {formData.unidades.map((unidade, unidadeIndex) => (
          <Card key={unidade.id || unidadeIndex} className="border-l-4 border-primary">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Unidade: {unidade.nome_unidade || `Unidade ${unidadeIndex + 1}`}
              </CardTitle>
              {formData.unidades.length > 1 && (
                 <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeUnidade(unidadeIndex)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover Unidade
                  </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Nome da Unidade *</label>
                <Input
                  value={unidade.nome_unidade}
                  onChange={(e) => updateUnidade(unidadeIndex, 'nome_unidade', e.target.value)}
                  required
                />
              </div>
              
              {/* Endereço da Unidade */}
              <div className="border p-4 rounded-md space-y-4">
                <h4 className="font-medium">Endereço da Unidade</h4>
                <AddressForm
                  data={{
                    zip_code: unidade.endereco.cep,
                    country: unidade.endereco.pais,
                    street: unidade.endereco.logradouro,
                    address_number: unidade.endereco.numero,
                    address_complement: unidade.endereco.complemento,
                    neighborhood: unidade.endereco.bairro,
                    city: unidade.endereco.cidade,
                    state: unidade.endereco.estado
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
                    updateUnidadeEndereco(unidadeIndex, fieldMapping[field], value);
                  }}
                />
              </div>

              {/* Telefone da Unidade */}
              <div>
                <label className="text-sm font-medium">Telefone da Unidade *</label>
                <Input
                  value={unidade.telefones[0].numero}
                  onChange={(e) => setFormData({ ...formData, unidades: formData.unidades.map(u => u.id === unidade.id ? { ...u, telefones: [{ ...u.telefones[0], numero: formatPhone(e.target.value) }] } : u) })}
                  maxLength={15}
                  required
                />
              </div>

              {/* Representantes da Unidade */}
              <div className="space-y-4">
                <h4 className="font-medium">Representantes da Unidade</h4>
                {unidade.representantes.map((rep, repIndex) => (
                  <div key={rep.id || repIndex} className="border p-4 rounded-md space-y-4 relative">
                    {unidade.representantes.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2 text-destructive hover:text-destructive h-7 w-7"
                        onClick={() => removeRepresentante(unidadeIndex, repIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Nome Completo *</label>
                        <Input
                          value={rep.nome_completo}
                          onChange={(e) => updateRepresentante(unidadeIndex, repIndex, 'nome_completo', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">CPF *</label>
                        <Input
                          value={rep.cpf}
                          onChange={(e) => updateRepresentante(unidadeIndex, repIndex, 'cpf', formatCPF(e.target.value))}
                          maxLength={14}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Data de Nascimento</label>
                        <Input
                          type="date"
                          value={rep.data_nascimento || ''}
                          onChange={(e) => updateRepresentante(unidadeIndex, repIndex, 'data_nascimento', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">E-mail *</label>
                        <Input
                          type="email"
                          value={rep.email}
                          onChange={(e) => updateRepresentante(unidadeIndex, repIndex, 'email', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Telefone *</label>
                        <Input
                          value={rep.telefones[0].numero}
                          onChange={(e) => setFormData({ ...formData, unidades: formData.unidades.map(u => u.id === unidade.id ? { ...u, representantes: u.representantes.map(r => r.id === rep.id ? { ...r, telefones: [{ ...r.telefones[0], numero: formatPhone(e.target.value) }] } : r) } : u) })}
                          maxLength={15}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Cargo *</label>
                        <Input
                          value={rep.cargo}
                          onChange={(e) => updateRepresentante(unidadeIndex, repIndex, 'cargo', e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-4 pt-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rep.is_socio}
                            onChange={(e) => updateRepresentante(unidadeIndex, repIndex, 'is_socio', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span>Sócio</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rep.is_responsavel_tecnico}
                            onChange={(e) => updateRepresentante(unidadeIndex, repIndex, 'is_responsavel_tecnico', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span>Responsável Técnico</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rep.is_veterinario}
                            onChange={(e) => {
                              updateRepresentante(unidadeIndex, repIndex, 'is_veterinario', e.target.checked);
                              if (!e.target.checked) {
                                updateRepresentante(unidadeIndex, repIndex, 'crmv', '');
                                updateRepresentante(unidadeIndex, repIndex, 'crmv_uf', '');
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span>Veterinário</span>
                        </label>
                      </div>
                      {rep.is_veterinario && (
                        <>
                          <div>
                            <label className="text-sm font-medium">CRMV *</label>
                            <Input
                              value={rep.crmv}
                              onChange={(e) => updateRepresentante(unidadeIndex, repIndex, 'crmv', e.target.value)}
                              required={rep.is_veterinario}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">UF do CRMV *</label>
                            <Select
                              value={rep.crmv_uf || ''}
                              onValueChange={(value) => updateRepresentante(unidadeIndex, repIndex, 'crmv_uf', value)}
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
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addRepresentante(unidadeIndex)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Representante
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addUnidade}
          className="w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Nova Unidade
        </Button>
        
        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/clientes')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </form>
    </div>
  );
} 