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
import { mockServicos, mockClientes } from '../../data/mockData';
import {
  Plus,
  Search,
  Settings,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp
} from 'lucide-react';

export default function Servicos() {
  const navigate = useNavigate();
  const [filtroPeriodicidade, setFiltroPeriodicidade] = useState<'todos' | string>('todos');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPeriodicidadeBadgeVariant = (periodicidade: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'mensal': 'default',
      'trimestral': 'secondary',
      'semestral': 'destructive',
      'anual': 'outline',
    };
    return variants[periodicidade] || 'default';
  };

  const servicosFiltrados = mockServicos.filter(servico => {
    if (filtroPeriodicidade === 'todos') return true;
    return servico.periodicidade === filtroPeriodicidade;
  });

  const totalServicos = mockServicos.length;
  const servicosAtivos = mockServicos.filter(s => s.is_active).length;

  const receitaPotencial = mockClientes.reduce((total, cliente) => {
    return total + cliente.servicos_contratados
      .filter(sc => sc.is_active)
      .reduce((sum, sc) => sum + sc.valor, 0);
  }, 0);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      console.log('Excluindo serviço:', id);
      // Aqui seria feita a chamada para API
    }
  };

  const getPeriodicidadeColor = (periodicidade: string) => {
    switch (periodicidade) {
      case 'mensal': return 'bg-blue-100 text-blue-800';
      case 'trimestral': return 'bg-green-100 text-green-800';
      case 'semestral': return 'bg-yellow-100 text-yellow-800';
      case 'anual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPeriodicidadeLabel = (periodicidade: string) => {
    const labels: { [key: string]: string } = {
      'mensal': 'Mensal',
      'trimestral': 'Trimestral',
      'semestral': 'Semestral',
      'anual': 'Anual'
    };
    return labels[periodicidade] || periodicidade;
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Serviços</h1>
        <Button onClick={() => navigate('/servicos/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>
      
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServicos}</div>
            <p className="text-xs text-muted-foreground">
              {servicosAtivos} ativos
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{servicosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((servicosAtivos / totalServicos) * 100)}% do total
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(mockServicos.reduce((total, servico) => total + servico.valor, 0) / totalServicos)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por serviço
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(receitaPotencial)}
            </div>
            <p className="text-xs text-muted-foreground">
              Mensal contratada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroPeriodicidade === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltroPeriodicidade('todos')}
              size="sm"
              className="hover:shadow-md transition-all"
            >
              Todos
            </Button>
            <Button
              variant={filtroPeriodicidade === 'mensal' ? 'default' : 'outline'}
              onClick={() => setFiltroPeriodicidade('mensal')}
              size="sm"
              className="hover:shadow-md transition-all"
            >
              Mensal
            </Button>
            <Button
              variant={filtroPeriodicidade === 'trimestral' ? 'default' : 'outline'}
              onClick={() => setFiltroPeriodicidade('trimestral')}
              size="sm"
              className="hover:shadow-md transition-all"
            >
              Trimestral
            </Button>
            <Button
              variant={filtroPeriodicidade === 'semestral' ? 'default' : 'outline'}
              onClick={() => setFiltroPeriodicidade('semestral')}
              size="sm"
              className="hover:shadow-md transition-all"
            >
              Semestral
            </Button>
            <Button
              variant={filtroPeriodicidade === 'anual' ? 'default' : 'outline'}
              onClick={() => setFiltroPeriodicidade('anual')}
              size="sm"
              className="hover:shadow-md transition-all"
            >
              Anual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicosFiltrados.map((servico) => (
          <Card key={servico.id} className="hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{servico.nome}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={`${getPeriodicidadeColor(servico.periodicidade)} font-semibold`}>
                      {getPeriodicidadeLabel(servico.periodicidade)}
                    </Badge>
                    {servico.is_active ? (
                      <Badge className="bg-green-100 text-green-800 font-semibold">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(servico.valor)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {servico.descricao}
              </p>
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/servicos/${servico.id}`)}
                  className="hover:bg-primary/10"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/servicos/editar/${servico.id}`)}
                  className="hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(servico.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table View */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Serviço</TableHead>
                <TableHead className="font-semibold">Descrição</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Periodicidade</TableHead>
                <TableHead className="font-semibold">Criado em</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
            </TableHeader>
          <TableBody>
              {servicosFiltrados.map((servico) => (
                <TableRow key={servico.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="font-medium">{servico.nome}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate text-sm text-muted-foreground" title={servico.descricao}>
                      {servico.descricao}
                    </div>
                </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(servico.valor)}
                </TableCell>
                <TableCell>
                    <Badge className={`${getPeriodicidadeColor(servico.periodicidade)} font-semibold`}>
                      {getPeriodicidadeLabel(servico.periodicidade)}
                    </Badge>
                </TableCell>
                <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(servico.created_at)}
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant={servico.is_active ? 'default' : 'secondary'}>
                      {servico.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={() => navigate(`/servicos/${servico.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={() => navigate(`/servicos/editar/${servico.id}`)}
                    >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(servico.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

          {servicosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Nenhum serviço encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou adicione um novo serviço.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 