import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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
import {
  Plus,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  FileText,
  Upload,
  Download,
  Eye
} from 'lucide-react';

interface Reembolso {
  id: string;
  colaborador_id: string;
  colaborador_nome: string;
  descricao: string;
  valor: number;
  data_pedido: string;
  data_compra: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  comprovante_url?: string;
  motivo_rejeicao?: string;
  data_processamento?: string;
  processado_por?: string;
}

const mockReembolsos: Reembolso[] = [
  {
    id: '1',
    colaborador_id: '2',
    colaborador_nome: 'Maria Oliveira Costa',
    descricao: 'Uber para visita cliente',
    valor: 45.90,
    data_pedido: '2024-01-15T10:30:00Z',
    data_compra: '2024-01-14',
    status: 'pendente',
    comprovante_url: '/comprovante1.pdf'
  },
  {
    id: '2',
    colaborador_id: '2',
    colaborador_nome: 'Maria Oliveira Costa',
    descricao: 'Almoço com cliente',
    valor: 120.00,
    data_pedido: '2024-01-10T14:20:00Z',
    data_compra: '2024-01-10',
    status: 'aprovado',
    comprovante_url: '/comprovante2.pdf',
    data_processamento: '2024-01-11T09:00:00Z',
    processado_por: 'Financeiro Sistema'
  },
  {
    id: '3',
    colaborador_id: '1',
    colaborador_nome: 'Dr. João Silva Santos',
    descricao: 'Material de escritório',
    valor: 87.50,
    data_pedido: '2024-01-08T16:45:00Z',
    data_compra: '2024-01-08',
    status: 'rejeitado',
    comprovante_url: '/comprovante3.pdf',
    data_processamento: '2024-01-09T10:30:00Z',
    processado_por: 'Financeiro Sistema',
    motivo_rejeicao: 'Comprovante ilegível'
  },
  {
    id: '4',
    colaborador_id: '3',
    colaborador_nome: 'Dra. Ana Paula Ferreira',
    descricao: 'Estacionamento reunião',
    valor: 25.00,
    data_pedido: '2024-01-15T08:00:00Z',
    data_compra: '2024-01-15',
    status: 'pendente',
    comprovante_url: '/comprovante4.pdf'
  }
];

const Reembolsos: React.FC = () => {
  const navigate = useNavigate();
  const [reembolsos] = useState<Reembolso[]>(mockReembolsos);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [showNovoReembolso, setShowNovoReembolso] = useState(false);

  // Simulando usuário logado
  const usuarioLogado = {
    id: '2',
    nome: 'Maria Oliveira Costa',
    perfil: 'colaborador'
  };

  const reembolsosFiltrados = reembolsos.filter(reembolso => {
    const matchesStatus = !filtroStatus || reembolso.status === filtroStatus;
    const matchesUser = usuarioLogado.perfil === 'admin' || 
                       usuarioLogado.perfil === 'financeiro' || 
                       reembolso.colaborador_id === usuarioLogado.id;
    return matchesStatus && matchesUser;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalPendente = reembolsosFiltrados
    .filter(r => r.status === 'pendente')
    .reduce((sum, r) => sum + r.valor, 0);

  const totalAprovado = reembolsosFiltrados
    .filter(r => r.status === 'aprovado')
    .reduce((sum, r) => sum + r.valor, 0);

  const totalRejeitado = reembolsosFiltrados
    .filter(r => r.status === 'rejeitado')
    .reduce((sum, r) => sum + r.valor, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reembolsos</h2>
          <p className="text-muted-foreground">
            Gerencie suas solicitações de reembolso
          </p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => setShowNovoReembolso(true)}
        >
          <Plus className="h-4 w-4" />
          Nova Solicitação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reembolsosFiltrados.length}</div>
            <p className="text-xs text-muted-foreground">
              Todas as solicitações
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-muted-foreground">
              {reembolsosFiltrados.filter(r => r.status === 'pendente').length} solicitações
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAprovado)}</div>
            <p className="text-xs text-muted-foreground">
              {reembolsosFiltrados.filter(r => r.status === 'aprovado').length} solicitações
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalRejeitado)}</div>
            <p className="text-xs text-muted-foreground">
              {reembolsosFiltrados.filter(r => r.status === 'rejeitado').length} solicitações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroStatus === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('')}
              className="hover:shadow-md transition-all"
            >
              Todos
            </Button>
            <Button
              variant={filtroStatus === 'pendente' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('pendente')}
              className="hover:shadow-md transition-all"
            >
              <Clock className="h-3 w-3 mr-1" />
              Pendentes
            </Button>
            <Button
              variant={filtroStatus === 'aprovado' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('aprovado')}
              className="hover:shadow-md transition-all"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Aprovados
            </Button>
            <Button
              variant={filtroStatus === 'rejeitado' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('rejeitado')}
              className="hover:shadow-md transition-all"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rejeitados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Histórico de Reembolsos
          </CardTitle>
          <CardDescription>
            {reembolsosFiltrados.length} reembolso(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Data</TableHead>
                {(usuarioLogado.perfil === 'admin' || usuarioLogado.perfil === 'financeiro') && (
                  <TableHead className="font-semibold">Colaborador</TableHead>
                )}
                <TableHead className="font-semibold">Descrição</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Comprovante</TableHead>
                {(usuarioLogado.perfil === 'admin' || usuarioLogado.perfil === 'financeiro') && (
                  <TableHead className="text-center font-semibold">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reembolsosFiltrados.map((reembolso) => (
                <TableRow key={reembolso.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {new Date(reembolso.data_compra).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Solicitado em {formatDate(reembolso.data_pedido)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {(usuarioLogado.perfil === 'admin' || usuarioLogado.perfil === 'financeiro') && (
                    <TableCell>{reembolso.colaborador_nome}</TableCell>
                  )}
                  <TableCell>
                    <div>
                      <div className="font-medium">{reembolso.descricao}</div>
                      {reembolso.motivo_rejeicao && (
                        <div className="text-xs text-red-600 mt-1">
                          Motivo: {reembolso.motivo_rejeicao}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-primary">
                      {formatCurrency(reembolso.valor)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {getStatusBadge(reembolso.status)}
                      {reembolso.data_processamento && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(reembolso.data_processamento)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Baixar
                    </Button>
                  </TableCell>
                  {(usuarioLogado.perfil === 'admin' || usuarioLogado.perfil === 'financeiro') && reembolso.status === 'pendente' && (
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {reembolsosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Nenhum reembolso encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou crie uma nova solicitação.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova Solicitação */}
      {showNovoReembolso && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Nova Solicitação de Reembolso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Descrição *</label>
                <Input placeholder="Ex: Uber para reunião com cliente" />
              </div>
              <div>
                <label className="text-sm font-medium">Valor *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-10"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Data da Compra *</label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium">Comprovante *</label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para enviar ou arraste o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF ou imagem (máx. 5MB)
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowNovoReembolso(false)}>
                  Cancelar
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Enviar Solicitação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reembolsos; 