import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { mockColaboradores, mockClientes } from '../../data/mockData';

interface FormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  perfil: 'admin' | 'financeiro' | 'colaborador' | 'cliente';
  status: 'ativo' | 'inativo';
  associacao?: {
    tipo: 'colaborador' | 'socio';
    id: string;
    nome: string;
    empresa?: string;
  };
}

export default function FormUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    perfil: 'colaborador',
    status: 'ativo'
  });

  const [searchColaborador, setSearchColaborador] = useState('');
  const [searchCliente, setSearchCliente] = useState('');
  const [showColaboradores, setShowColaboradores] = useState(false);
  const [showClientes, setShowClientes] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEdit && formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if ((formData.perfil === 'colaborador' || formData.perfil === 'cliente') && !formData.associacao) {
      alert('Selecione um colaborador ou sócio para associar ao usuário!');
      return;
    }

    console.log('Salvando usuário:', formData);
    navigate('/usuarios');
  };

  const handleSelectColaborador = (colaborador: any) => {
    setFormData({
      ...formData,
      nome: colaborador.nome_completo,
      email: colaborador.email,
      associacao: {
        tipo: 'colaborador',
        id: colaborador.id,
        nome: colaborador.nome_completo
      }
    });
    setShowColaboradores(false);
    setSearchColaborador('');
  };

  const handleSelectSocio = (cliente: any, representante: any) => {
    setFormData({
      ...formData,
      nome: representante.nome_completo,
      email: representante.email,
      associacao: {
        tipo: 'socio',
        id: representante.id,
        nome: representante.nome_completo,
        empresa: cliente.razao_social
      }
    });
    setShowClientes(false);
    setSearchCliente('');
  };

  const colaboradoresFiltrados = mockColaboradores.filter(c => 
    c.nome_completo.toLowerCase().includes(searchColaborador.toLowerCase()) ||
    c.cpf.includes(searchColaborador)
  );

  const clientesFiltradosParaSocios = mockClientes.flatMap(cliente => 
    cliente.unidades.flatMap(unidade => 
      unidade.representantes
        .filter(rep => 
          rep.nome_completo.toLowerCase().includes(searchCliente.toLowerCase()) ||
          rep.cpf.includes(searchCliente) ||
          cliente.nome_fantasia.toLowerCase().includes(searchCliente.toLowerCase())
        )
        .map(rep => ({ ...rep, clienteId: cliente.id, clienteNomeFantasia: cliente.nome_fantasia, unidadeNome: unidade.nome_unidade }))
    )
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/usuarios')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do Usuário */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome Completo *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  disabled={!!formData.associacao}
                />
              </div>
              <div>
                <label className="text-sm font-medium">E-mail *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!formData.associacao}
                />
              </div>
              {!isEdit && (
                <>
                  <div>
                    <label className="text-sm font-medium">Senha *</label>
                    <Input
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Confirmar Senha *</label>
                    <Input
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Perfil e Permissões */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Perfil e Permissões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Perfil *</label>
                <select
                  value={formData.perfil}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    perfil: e.target.value as any,
                    associacao: undefined 
                  })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="colaborador">Colaborador</option>
                  <option value="cliente">Cliente (Sócio)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            {/* Descrição das permissões */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Permissões do Perfil</h4>
              {formData.perfil === 'admin' && (
                <p className="text-sm text-muted-foreground">
                  Acesso total a todas as telas e funcionalidades do sistema.
                </p>
              )}
              {formData.perfil === 'financeiro' && (
                <p className="text-sm text-muted-foreground">
                  Acesso às telas de gestão financeira, reembolsos, faturas e histórico financeiro.
                </p>
              )}
              {formData.perfil === 'colaborador' && (
                <p className="text-sm text-muted-foreground">
                  Acesso aos dados pessoais, contrato e tela de reembolsos.
                </p>
              )}
              {formData.perfil === 'cliente' && (
                <p className="text-sm text-muted-foreground">
                  Acesso aos dados da empresa, dados pessoais, contratos e histórico de faturas.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Associação para Colaborador */}
        {formData.perfil === 'colaborador' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Associar a Colaborador</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.associacao ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Colaborador Selecionado:</p>
                  <p className="text-lg font-semibold">{formData.associacao.nome}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setFormData({ ...formData, associacao: undefined, nome: '', email: '' })}
                  >
                    Remover Associação
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar colaborador por nome ou CPF..."
                      value={searchColaborador}
                      onChange={(e) => {
                        setSearchColaborador(e.target.value);
                        setShowColaboradores(e.target.value.length > 0);
                      }}
                      className="pl-8"
                    />
                  </div>
                  
                  {showColaboradores && (
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {colaboradoresFiltrados.map((colaborador) => (
                        <div
                          key={colaborador.id}
                          className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleSelectColaborador(colaborador)}
                        >
                          <p className="font-medium">{colaborador.nome_completo}</p>
                          <p className="text-sm text-muted-foreground">
                            CPF: {colaborador.cpf}
                          </p>
                        </div>
                      ))}
                      {colaboradoresFiltrados.length === 0 && (
                        <p className="p-3 text-center text-muted-foreground">
                          Nenhum colaborador encontrado
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Associação para Cliente (Sócio) */}
        {formData.perfil === 'cliente' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Associar a Sócio de Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.associacao ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Sócio Selecionado:</p>
                  <p className="text-lg font-semibold">{formData.associacao.nome}</p>
                  <p className="text-sm text-muted-foreground">{formData.associacao.empresa}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setFormData({ ...formData, associacao: undefined, nome: '', email: '' })}
                  >
                    Remover Associação
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar empresa por razão social ou CNPJ..."
                      value={searchCliente}
                      onChange={(e) => {
                        setSearchCliente(e.target.value);
                        setShowClientes(e.target.value.length > 0);
                      }}
                      className="pl-8"
                    />
                  </div>
                  
                  {showClientes && (
                    <div className="border rounded-lg max-h-80 overflow-y-auto">
                      {clientesFiltradosParaSocios.length > 0 ? (
                        <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                          {clientesFiltradosParaSocios.map((rep) => (
                            <li 
                              key={rep.id} 
                              className="p-2 hover:bg-muted rounded-md cursor-pointer"
                              onClick={() => handleSelectSocio(mockClientes.find(c=>c.id === rep.clienteId), rep)}
                            >
                              <p className="font-medium">{rep.nome_completo}</p>
                              <p className="text-xs text-muted-foreground">{rep.cargo} em {rep.clienteNomeFantasia} ({rep.unidadeNome})</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">Nenhum sócio encontrado.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/usuarios')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </div>
      </form>
    </div>
  );
} 