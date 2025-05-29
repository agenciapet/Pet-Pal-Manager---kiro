import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import mockData, { type Cliente } from '../../data/mockData';
import {
  Plus,
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  Filter,
  TrendingUp
} from 'lucide-react';

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const [clientes] = useState<Cliente[]>(mockData.mockClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipoEmpresa, setFiltroTipoEmpresa] = useState<string>('todos');

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const matchesSearch = cliente.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.cnpj.includes(searchTerm) ||
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipoEmpresa = filtroTipoEmpresa === 'todos' || cliente.tipo_empresa === filtroTipoEmpresa;
    return matchesSearch && matchesTipoEmpresa;
  });

  const totalFaturamento = clientes.reduce((total, cliente) => {
    return total + cliente.servicos_contratados.reduce((subtotal, servico) => {
      return subtotal + (servico.is_active ? servico.valor : 0);
    }, 0);
  }, 0);

  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
  const faturamentoMensal = clientes.reduce((total, cliente) => {
    return total + cliente.servicos_contratados
      .filter(s => s.is_active)
      .reduce((sum, s) => sum + s.valor, 0);
  }, 0);
  const totalRepresentantes = clientes.reduce((total, cliente) => 
    total + cliente.unidades.reduce((subTotal, unidade) => subTotal + unidade.representantes.length, 0), 0
  );

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      console.log('Excluindo cliente:', id);
      // Aqui seria feita a chamada para API
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={() => navigate('/clientes/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              {clientesAtivos} ativos
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((clientesAtivos / totalClientes) * 100)}% do total
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {faturamentoMensal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              De serviços ativos
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Representantes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalRepresentantes}</div>
            <p className="text-xs text-muted-foreground">
              Pessoas de contato
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros por Tipo de Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroTipoEmpresa === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltroTipoEmpresa('todos')}
              size="sm"
              className="hover:shadow-md transition-all"
            >
              Todos
            </Button>
            {['Consultório', 'Clínica', 'Hospital', 'Veterinário Volante', 'Veterinário Autônomo', 'PetShop', 'Petshop com Clínica', 'Parceria', 'Outros'].map(tipo => (
              <Button
                key={tipo}
                variant={filtroTipoEmpresa === tipo ? 'default' : 'outline'}
                onClick={() => setFiltroTipoEmpresa(tipo)}
                size="sm"
                className="hover:shadow-md transition-all"
              >
                {tipo}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Clientes */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Nome Fantasia</th>
                    <th className="text-left p-3 font-semibold">CNPJ</th>
                    <th className="text-left p-3 font-semibold">Local</th>
                    <th className="text-left p-3 font-semibold">Tipo</th>
                    <th className="text-left p-3 font-semibold">Telefone</th>
                    <th className="text-left p-3 font-semibold">Faturamento</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-center p-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clientesFiltrados.map((cliente) => {
                    const faturamentoCliente = cliente.servicos_contratados
                      .filter(s => s.is_active)
                      .reduce((sum, s) => sum + s.valor, 0);
                    
                    return (
                      <tr key={cliente.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{cliente.razao_social}</p>
                            <p className="text-xs text-muted-foreground">{cliente.email}</p>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-sm">{cliente.cnpj}</td>
                        <td className="p-3 text-sm">
                          {cliente.unidades[0].endereco.cidade} - {cliente.unidades[0].endereco.estado}
                        </td>
                        <td className="p-3">
                          {cliente.tipo_empresa}
                        </td>
                        <td className="p-3 text-sm">
                          {cliente.telefones && cliente.telefones.length > 0 
                            ? cliente.telefones[0].numero 
                            : 'Não informado'}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-blue-600">
                            {faturamentoCliente.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}/mês
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={
                              cliente.status === 'ativo' ? 'default' :
                              cliente.status === 'inadimplente' ? 'destructive' :
                              cliente.status === 'contrato_cancelado' ? 'destructive' :
                              cliente.status === 'inativo' ? 'secondary' :
                              cliente.status === 'em_negociacao' ? 'outline' :
                              cliente.status === 'prospect' ? 'outline' :
                              'secondary'
                            }
                            className="capitalize"
                          >
                            {cliente.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/clientes/${cliente.id}`)}
                              className="hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
          <Button 
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(cliente.id)}
                            >
                              <Trash2 className="h-4 w-4" />
          </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes; 