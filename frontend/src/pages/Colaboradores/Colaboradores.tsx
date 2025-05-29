import React, { useState, useEffect, type JSX } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockColaboradores, type Colaborador } from '../../data/mockData';
import { employeeService } from '../../services/authService';
import {
  Plus,
  Search,
  Users,
  UserCheck,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Stethoscope,
  TrendingUp,
  UserX
} from 'lucide-react';

// Definição local da interface Colaborador para a listagem
interface ColaboradorLista {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento?: string;
  contact_email: string;
  telefones?: { numero: string; tipo?: string }[]; // Mantido opcional para compatibilidade, mas não usado diretamente na lista
  main_phone_number?: string; // Adicionado para o telefone principal da lista
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
  };
  cargo: string;
  salario: number;
  data_contratacao: string;
  is_active: boolean;
  is_veterinario: boolean;
  crmv?: string;
  crmv_uf?: string;
  crmv_status?: 'verificado' | 'pendente' | 'invalido' | undefined;
  dados_bancarios: {
    banco: string;
    agencia: string;
    conta: string;
    chave_pix?: string;
  };
  created_at?: string;
  updated_at?: string;
}

const Colaboradores: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<ColaboradorLista[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'veterinarios' | 'nao-veterinarios'>('todos');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Carregar colaboradores do backend
  useEffect(() => {
    const loadColaboradores = async () => {
      try {
        setIsLoadingData(true);
        const response = await employeeService.getAllEmployees(statusFilter);
        
        // Converter dados do backend para o formato esperado pelo frontend
        const colaboradoresFormatados = response.employees.map((emp: any): ColaboradorLista => ({
          id: emp.id,
          nome_completo: emp.full_name,
          cpf: emp.cpf,
          data_nascimento: emp.birth_date,
          contact_email: emp.contact_email || 'Não informado',
          main_phone_number: emp.main_phone_number || 'N/A',
          endereco: {
            cep: emp.zip_code,
            logradouro: emp.street,
            numero: 'S/N',
            bairro: emp.neighborhood,
            cidade: emp.city,
            estado: emp.state,
            pais: emp.country || 'Brasil',
          },
          cargo: emp.position || (emp.is_veterinarian ? 'Veterinário' : 'Colaborador'),
          salario: parseFloat(emp.salary) || 0,
          data_contratacao: emp.hire_date,
          is_active: emp.is_active,
          is_veterinario: emp.is_veterinarian,
          crmv: emp.crmv_number,
          crmv_uf: emp.crmv_state,
          crmv_status: emp.crmv_status as 'verificado' | 'pendente' | 'invalido' | undefined,
          dados_bancarios: {
            banco: emp.bank_name || 'N/A',
            agencia: emp.bank_agency || 'N/A',
            conta: emp.bank_account || 'N/A',
            chave_pix: emp.pix_key,
          },
          created_at: emp.created_at,
          updated_at: emp.updated_at,
        }));
        
        setColaboradores(colaboradoresFormatados);
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        // Em caso de erro, usar dados mock como fallback
        setColaboradores(mockColaboradores);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadColaboradores();
  }, [statusFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPhoneNumber = (phoneNumber: string | undefined | null): string => {
    if (!phoneNumber || phoneNumber === 'N/A') return 'N/A';
    const cleaned = (phoneNumber).replace(/D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    return phoneNumber; // Retorna original se não for 10 ou 11 dígitos
  };

  const colaboradoresFiltrados = colaboradores.filter(colaborador => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = colaborador.nome_completo.toLowerCase().includes(searchTermLower) ||
                         (colaborador.contact_email && colaborador.contact_email.toLowerCase().includes(searchTermLower)) ||
                         colaborador.cargo.toLowerCase().includes(searchTermLower);
    
    let matchesTipo = true;
    if (filtroTipo === 'veterinarios') {
      matchesTipo = colaborador.is_veterinario;
    } else if (filtroTipo === 'nao-veterinarios') {
      matchesTipo = !colaborador.is_veterinario;
    }
    
    return matchesSearch && matchesTipo;
  });

  const totalColaboradores = colaboradores.length;
  const colaboradoresAtivos = colaboradores.filter(c => c.is_active).length;
  const veterinarios = colaboradores.filter(c => c.is_veterinario).length;
  const folhaPagamento = colaboradores
    .filter(c => c.is_active)
    .reduce((total, c) => total + c.salario, 0);

  const handleInativarColaborador = async (id: string): Promise<void> => {
    if (confirm('Tem certeza que deseja INATIVAR este colaborador?')) {
      setLoading(prev => ({ ...prev, [id]: true }));
      try {
        const response = await employeeService.inactivateEmployee(id);
        console.log('Colaborador inativado com sucesso:', response.message);
        
        setColaboradores(prevColaboradores => 
          prevColaboradores.map(col => 
            col.id === id ? { ...col, is_active: false } : col
          )
        );
        
        alert('Colaborador inativado com sucesso!');
      } catch (error: any) {
        console.error('Erro ao inativar colaborador:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao inativar colaborador';
        alert(`Erro: ${errorMessage}`);
      } finally {
        setLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleReativarColaborador = async (id: string): Promise<void> => {
    if (confirm('Tem certeza que deseja REATIVAR este colaborador?')) {
      setLoading(prev => ({ ...prev, [id]: true }));
      try {
        const response = await employeeService.reactivateEmployee(id);
        console.log('Colaborador reativado com sucesso:', response.message);
        
        setColaboradores(prevColaboradores => 
          prevColaboradores.map(col => 
            col.id === id ? { ...col, is_active: true } : col
          )
        );
        
        alert('Colaborador reativado com sucesso!');
      } catch (error: any) {
        console.error('Erro ao reativar colaborador:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao reativar colaborador';
        alert(`Erro: ${errorMessage}`);
      } finally {
        setLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Colaboradores</h1>
        <Button onClick={() => navigate('/colaboradores/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>
      
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalColaboradores}</div>
            <p className="text-xs text-muted-foreground">
              {colaboradoresAtivos} ativos
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{colaboradoresAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((colaboradoresAtivos / totalColaboradores) * 100)}% do total
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veterinários</CardTitle>
            <Stethoscope className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{veterinarios}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((veterinarios / totalColaboradores) * 100)}% do total
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folha de Pagamento</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {folhaPagamento.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Mensal dos ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroTipo === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltroTipo('todos')}
              className="flex items-center gap-1"
            >
              <Users className="h-4 w-4" /> Todos
            </Button>
            <Button
              variant={filtroTipo === 'veterinarios' ? 'default' : 'outline'}
              onClick={() => setFiltroTipo('veterinarios')}
              className="flex items-center gap-1"
            >
              <Stethoscope className="h-4 w-4" /> Veterinários
            </Button>
            <Button
              variant={filtroTipo === 'nao-veterinarios' ? 'default' : 'outline'}
              onClick={() => setFiltroTipo('nao-veterinarios')}
              className="flex items-center gap-1"
            >
              <UserCheck className="h-4 w-4" /> Não Veterinários
            </Button>

            {/* Novo Select para filtro de status */}
            <Select value={statusFilter} onValueChange={(value: 'active' | 'inactive' | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Colaboradores */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium">Carregando colaboradores...</p>
            </div>
          ) : colaboradoresFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum colaborador encontrado</p>
              <p className="text-sm">Tente ajustar os filtros ou adicione um novo colaborador.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Nome</th>
                    <th className="text-left p-3 font-semibold">Cargo</th>
                    <th className="text-left p-3 font-semibold">E-mail</th>
                    <th className="text-left p-3 font-semibold">Telefone</th>
                    <th className="text-left p-3 font-semibold">Local</th>
                    <th className="text-left p-3 font-semibold">Salário</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-center p-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {colaboradoresFiltrados.map((colaborador) => (
                    <tr key={colaborador.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {colaborador.nome_completo.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{colaborador.nome_completo}</p>
                            <p className="text-xs text-muted-foreground">{colaborador.cpf}</p>
                          </div>
                          {colaborador.is_veterinario && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <Stethoscope className="h-3 w-3 mr-1" />
                              CRMV
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{colaborador.cargo}</td>
                      <td className="p-3 text-sm">{colaborador.contact_email}</td>
                      <td className="p-3 text-sm">
                        {formatPhoneNumber(colaborador.main_phone_number)}
                      </td>
                      <td className="p-3 text-sm">
                        {colaborador.endereco.cidade} - {colaborador.endereco.estado}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-blue-600">
                          {colaborador.salario.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={colaborador.is_active ? 'default' : 'secondary'}>
                          {colaborador.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/colaboradores/${colaborador.id}`)}
                            className="hover:bg-primary/10"
                            title="Visualizar Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/colaboradores/editar/${colaborador.id}`)}
                            className="hover:bg-primary/10"
                            title="Editar Colaborador"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {colaborador.is_active ? (
                            <Button 
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleInativarColaborador(colaborador.id)}
                              title="Inativar Colaborador"
                              disabled={loading[colaborador.id]}
                            >
                              {loading[colaborador.id] ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <UserX className="h-4 w-4" />
                              )}
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-500/10"
                              onClick={() => handleReativarColaborador(colaborador.id)}
                              title="Reativar Colaborador"
                              disabled={loading[colaborador.id]}
                            >
                              {loading[colaborador.id] ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Colaboradores; 