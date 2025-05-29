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
  Search,
  Users,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Eye,
  Key,
  Mail,
  DollarSign
} from 'lucide-react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'financeiro' | 'colaborador' | 'cliente';
  status: 'ativo' | 'inativo';
  ultimo_acesso: string;
  created_at: string;
  associacao?: {
    tipo: 'colaborador' | 'socio';
    nome: string;
    empresa?: string;
  };
}

const mockUsuarios: Usuario[] = [
        {
          id: '1',
    nome: 'Administrador Sistema',
          email: 'admin@petpalmanager.com',
    perfil: 'admin',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T10:30:00Z',
    created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: '2',
    nome: 'Maria Oliveira Costa',
    email: 'maria.oliveira@petpalmanager.com',
    perfil: 'colaborador',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T09:15:00Z',
    created_at: '2023-03-01T00:00:00Z',
    associacao: {
      tipo: 'colaborador',
      nome: 'Maria Oliveira Costa'
    }
        },
        {
          id: '3',
    nome: 'Dr. João Silva Santos',
    email: 'joao.silva@petpalmanager.com',
    perfil: 'colaborador',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T08:45:00Z',
    created_at: '2023-01-15T00:00:00Z',
    associacao: {
      tipo: 'colaborador',
      nome: 'Dr. João Silva Santos'
    }
        },
        {
          id: '4',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos@petcare.com.br',
    perfil: 'cliente',
    status: 'ativo',
    ultimo_acesso: '2024-01-14T16:20:00Z',
    created_at: '2023-01-01T00:00:00Z',
    associacao: {
      tipo: 'socio',
      nome: 'Dr. Carlos Eduardo Mendes',
      empresa: 'Clínica Veterinária Pet Care Ltda'
    }
  },
  {
    id: '5',
    nome: 'Financeiro Sistema',
    email: 'financeiro@petpalmanager.com',
    perfil: 'financeiro',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T07:30:00Z',
    created_at: '2023-02-01T00:00:00Z'
  },
  {
    id: '6',
    nome: 'Mariana Rodrigues Silva',
    email: 'mariana@animallife.com.br',
    perfil: 'cliente',
    status: 'inativo',
    ultimo_acesso: '2024-01-10T14:15:00Z',
    created_at: '2023-02-01T00:00:00Z',
    associacao: {
      tipo: 'socio',
      nome: 'Dra. Mariana Rodrigues Silva',
      empresa: 'Hospital Veterinário Animal Life S.A.'
    }
  }
];

const Usuarios: React.FC = () => {
  const [usuarios] = useState<Usuario[]>(mockUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerfilLabel = (perfil: string) => {
    const labels: { [key: string]: string } = {
      admin: 'Administrador',
      financeiro: 'Financeiro',
      colaborador: 'Colaborador',
      cliente: 'Cliente'
    };
    return labels[perfil] || perfil;
  };

  const getPerfilBadgeVariant = (perfil: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      admin: 'destructive',
      financeiro: 'default',
      colaborador: 'secondary',
      cliente: 'outline'
    };
    return variants[perfil] || 'default';
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerfil = !filtroPerfil || usuario.perfil === filtroPerfil;
    const matchesStatus = !filtroStatus || usuario.status === filtroStatus;
    return matchesSearch && matchesPerfil && matchesStatus;
  });

  const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length;
  const administradores = usuarios.filter(u => u.perfil === 'admin').length;
  const ultimoAcesso = usuarios.reduce((latest, usuario) => {
    return new Date(usuario.ultimo_acesso) > new Date(latest) ? usuario.ultimo_acesso : latest;
  }, usuarios[0]?.ultimo_acesso || '');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/usuarios/novo')}>
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.length}</div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{usuariosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((usuariosAtivos / usuarios.length) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{administradores}</div>
            <p className="text-xs text-muted-foreground">
              Com acesso total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Acesso</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">Hoje</div>
            <p className="text-xs text-muted-foreground">
              {formatDate(ultimoAcesso)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filtroPerfil === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroPerfil('')}
                className="hover:shadow-md transition-all"
              >
                Todos
              </Button>
              <Button
                variant={filtroPerfil === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroPerfil('admin')}
                className="hover:shadow-md transition-all"
              >
                Admin
              </Button>
              <Button
                variant={filtroPerfil === 'financeiro' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroPerfil('financeiro')}
                className="hover:shadow-md transition-all"
              >
                Financeiro
              </Button>
              <Button
                variant={filtroPerfil === 'colaborador' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroPerfil('colaborador')}
                className="hover:shadow-md transition-all"
              >
                Colaborador
              </Button>
              <Button
                variant={filtroPerfil === 'cliente' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroPerfil('cliente')}
                className="hover:shadow-md transition-all"
              >
                Cliente
              </Button>
            </div>
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
                variant={filtroStatus === 'ativo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroStatus('ativo')}
                className="hover:shadow-md transition-all"
              >
                Ativos
              </Button>
              <Button
                variant={filtroStatus === 'inativo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroStatus('inativo')}
                className="hover:shadow-md transition-all"
              >
                Inativos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
          <CardDescription>
            {usuariosFiltrados.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Usuário</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Perfil</TableHead>
                <TableHead className="font-semibold">Associação</TableHead>
                <TableHead className="font-semibold">Último Acesso</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
            </TableHeader>
          <TableBody>
              {usuariosFiltrados.map((usuario) => (
                <TableRow key={usuario.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {usuario.perfil === 'admin' ? (
                          <Shield className="h-5 w-5 text-red-600" />
                        ) : usuario.perfil === 'financeiro' ? (
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{usuario.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          Criado em {formatDate(usuario.created_at)}
                        </div>
                      </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                      {usuario.email}
                    </div>
                </TableCell>
                <TableCell>
                    <Badge 
                      variant={getPerfilBadgeVariant(usuario.perfil)}
                      className="font-semibold"
                    >
                      {getPerfilLabel(usuario.perfil)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {usuario.associacao ? (
                      <div className="text-sm">
                        <div className="font-medium">{usuario.associacao.nome}</div>
                        {usuario.associacao.empresa && (
                          <div className="text-muted-foreground">{usuario.associacao.empresa}</div>
                        )}
                        <Badge variant="outline" className="text-xs mt-1">
                          {usuario.associacao.tipo === 'colaborador' ? 'Colaborador' : 'Sócio'}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                </TableCell>
                <TableCell>
                    <div className="text-sm">
                      {formatDate(usuario.ultimo_acesso)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                      {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                    >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {usuario.status === 'ativo' ? <UserX className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou adicione um novo usuário.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Usuarios; 