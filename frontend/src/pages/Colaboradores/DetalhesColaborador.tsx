import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/authService'; // Importa de authService
// import { Colaborador } from './types'; // Removendo a importação problemática
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Edit, Mail, Phone, MapPin, CreditCard, AlertTriangle, UserCheck, Loader2, UserX, History } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

// Definindo a interface diretamente no arquivo para evitar problemas de importação
interface Colaborador {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string | null;
  contact_email: string;
  telefones?: Array<{ id: string; phone_number: string; is_primary: boolean; country_code: string; }> | null;
  endereco?: any;
  cargo: string;
  salario: number;
  data_contratacao: string;
  is_active: boolean;
  is_veterinario?: boolean;
  crmv?: string | null;
  crmv_uf?: string | null;
  crmv_status?: 'verificado' | 'pendente' | 'invalido' | 'nao_aplicavel' | null | undefined;
  dados_bancarios?: {
    banco: string | null;
    agencia: string | null;
    conta: string | null;
    tipo_conta?: string | null;
    chave_pix: string | null;
    tipo_chave_pix: string | null;
  };
  contrato_id?: string | null;
  created_at?: string;
  updated_at?: string;
  contract_name?: string | null;
  contract_version?: string | null;
  pix_key_type?: string | null;
}

// Interface para o formato esperado do colaborador no frontend
interface ColaboradorDetalhes extends Colaborador {
  // Adicione quaisquer campos específicos que vêm da API de detalhes e não estão no tipo Colaborador base
}

// Interface para o histórico de atividades
interface ActivityLog {
  id: string;
  created_at: string;
  action: string;
  resource_type: string;
  resource_id: string;
  user_email: string | null;
}

export default function DetalhesColaborador() {
  console.log('[DetalhesColaborador] Componente MONTADO.');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [colaborador, setColaborador] = useState<ColaboradorDetalhes | null>(null);
  const [loading, setLoading] = useState(true); // Loading da página inicial
  const [actionLoading, setActionLoading] = useState(false); // Loading para botões de Inativar/Reativar
  const [error, setError] = useState<string | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Função para buscar e atualizar os dados do colaborador
  const fetchColaborador = async () => {
    if (!id) {
      console.warn('[DetalhesColaborador] ID do colaborador não fornecido na URL.');
      setError('ID do colaborador não fornecido.');
      setLoading(false);
      return;
    }

    console.log('[DetalhesColaborador] Iniciando fetchColaborador para o ID:', id);
    setLoading(true); // Ativa o loading da página ao buscar
    setError(null);
    try {
      console.log('[DetalhesColaborador] Buscando dados da API para o ID:', id);
      const response = await employeeService.getEmployeeById(id);
      console.log('[DetalhesColaborador] Resposta da API:', response);

      if (response && response.employee) {
        const dadosApi = response.employee;
        console.log('[DetalhesColaborador] Dados recebidos da API (employee):', JSON.stringify(dadosApi, null, 2)); // Log para depuração

        // Mapeamento dos dados da API para a estrutura do frontend
        const dadosFormatados: Colaborador = {
          id: dadosApi.id,
          nome_completo: dadosApi.full_name,
          cpf: dadosApi.cpf,
          data_nascimento: dadosApi.birth_date,
          contact_email: dadosApi.contact_email || 'Não informado',
          telefones: dadosApi.phones && Array.isArray(dadosApi.phones) ? dadosApi.phones.map((p: any) => ({
            id: p.id,
            phone_number: p.phone_number,
            is_primary: p.is_primary,
            country_code: p.country_code
          })) : [],
          endereco: {
            cep: dadosApi.zip_code,
            logradouro: dadosApi.street,
            numero: dadosApi.address_number || 'S/N',
            bairro: dadosApi.neighborhood,
            cidade: dadosApi.city,
            estado: dadosApi.state,
            pais: dadosApi.country || 'Brasil',
            complemento: dadosApi.address_complement || '',
          },
          cargo: dadosApi.position || (dadosApi.is_veterinarian ? 'Veterinário(a)' : 'Colaborador(a)'),
          salario: parseFloat(dadosApi.salary) || 0,
          data_contratacao: dadosApi.hire_date,
          is_active: dadosApi.is_active,
          is_veterinario: dadosApi.is_veterinarian,
          crmv: dadosApi.crmv_number,
          crmv_uf: dadosApi.crmv_state,
          crmv_status: dadosApi.crmv_status as Colaborador['crmv_status'],
          dados_bancarios: {
            banco: dadosApi.bank_name || 'N/A',
            agencia: dadosApi.bank_agency || 'N/A',
            conta: dadosApi.bank_account || 'N/A',
            chave_pix: dadosApi.pix_key,
            tipo_chave_pix: dadosApi.pix_key_type,
          },
          created_at: dadosApi.created_at,
          updated_at: dadosApi.updated_at,
          contract_name: dadosApi.contract_name,
          contract_version: dadosApi.contract_version,
          pix_key_type: dadosApi.pix_key_type,
        };
        console.log('[DetalhesColaborador] Dados formatados:', dadosFormatados);
        setColaborador(dadosFormatados);
      } else {
        console.warn('[DetalhesColaborador] Nenhum colaborador encontrado na resposta da API para o ID:', id);
        setError('Colaborador não encontrado na base de dados.');
        setColaborador(null);
      }
    } catch (err: any) {
      console.error('[DetalhesColaborador] Erro ao buscar colaborador:', err);
      const apiError = err.response?.data?.error || err.response?.data?.message;
      setError(apiError || err.message || 'Erro ao buscar dados do colaborador.');
      setColaborador(null);
    } finally {
      setLoading(false); // Desativa o loading da página
      console.log('[DetalhesColaborador] Finalizou fetchColaborador. Loading:', false);
    }
  };

  // Função para buscar o histórico de atividades
  const fetchActivityHistory = async () => {
    if (!id) return;
    setLoadingHistory(true);
    try {
      const response = await employeeService.getEmployeeHistory(id);
      setActivityHistory(response.history || []);
    } catch (err: any) {
      console.error('[DetalhesColaborador] Erro ao buscar histórico de atividades:', err);
      // Poderia setar um erro específico para o histórico se necessário
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    console.log('[DetalhesColaborador] useEffect EXECUTADO. ID recebido:', id);
    fetchColaborador(); // Chama a função para buscar os dados
    fetchActivityHistory(); // Chama a função para buscar o histórico
  }, [id]); // Dependência no ID para rebuscar se o ID na URL mudar

  // Funções para inativar/reativar
  const handleInativar = async () => {
    if (!colaborador) return;
    if (window.confirm('Tem certeza que deseja INATIVAR este colaborador?')) {
      setActionLoading(true);
      try {
        await employeeService.inactivateEmployee(colaborador.id);
        alert('Colaborador inativado com sucesso!');
        fetchColaborador(); // Recarrega os dados para refletir a mudança
      } catch (error: any) {
        console.error('Erro ao inativar:', error);
        alert(`Erro ao inativar: ${error.response?.data?.message || error.message}`);
      } finally {
        setActionLoading(false);
        fetchActivityHistory(); // Recarrega o histórico após a ação
      }
    }
  };

  const handleReativar = async () => {
    if (!colaborador) return;
    if (window.confirm('Tem certeza que deseja REATIVAR este colaborador?')) {
      setActionLoading(true);
      try {
        await employeeService.reactivateEmployee(colaborador.id);
        alert('Colaborador reativado com sucesso!');
        fetchColaborador(); // Recarrega os dados para refletir a mudança
      } catch (error: any) {
        console.error('Erro ao reativar:', error);
        alert(`Erro ao reativar: ${error.response?.data?.message || error.message}`);
      } finally {
        setActionLoading(false);
        fetchActivityHistory(); // Recarrega o histórico após a ação
      }
    }
  };

  const calcularIdade = (dataNascimentoStr: string | null | undefined) => {
    if (!dataNascimentoStr) return null;
    const dataNascimento = new Date(dataNascimentoStr);
    if (isNaN(dataNascimento.getTime())) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mes = hoje.getMonth() - dataNascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  // Função para formatar data
  const formatarData = (dataStr: string | null | undefined) => {
    if (!dataStr) return 'Não informado';
    try {
      const data = new Date(dataStr);
      if (isNaN(data.getTime())) return 'Data inválida';
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen"> {/* Alterado para min-h-screen */}
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Carregando detalhes do colaborador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen"> {/* Alterado para min-h-screen */}
        <Alert variant="destructive" className="max-w-lg w-full"> {/* Adicionado w-full */}
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erro ao Carregar Colaborador</AlertTitle>
          <AlertDescription>
            {error}
            <Button onClick={() => navigate('/colaboradores')} variant="link" className="mt-2 text-sm pl-0"> {/* Adicionado pl-0 */}
              Voltar para lista de colaboradores
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!colaborador) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen"> {/* Alterado para min-h-screen */}
        <Alert className="max-w-lg w-full"> {/* Adicionado w-full */}
          <UserCheck className="h-5 w-5" />
          <AlertTitle>Colaborador Não Encontrado</AlertTitle>
          <AlertDescription>
            O colaborador com o ID fornecido não foi encontrado ou não existe.
            <Button onClick={() => navigate('/colaboradores')} variant="link" className="mt-2 text-sm pl-0"> {/* Adicionado pl-0 */}
              Voltar para lista de colaboradores
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Renderização dos detalhes do colaborador
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4"> {/* Adicionado flex-wrap e gap */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/colaboradores')} disabled={actionLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{colaborador.nome_completo}</h1>
          <Badge className={colaborador.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {colaborador.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
          {colaborador.is_veterinario && colaborador.crmv_status === 'verificado' && (
            <Badge className="bg-purple-100 text-purple-800">CRMV Verificado</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/colaboradores/editar/${id}`)} disabled={actionLoading}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          {colaborador.is_active ? (
            <Button variant="destructive" onClick={handleInativar} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserX className="mr-2 h-4 w-4" />}
              Inativar
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="text-green-600 border-green-600 hover:bg-green-500/10 hover:text-green-700" // Ajustado para melhor visual
              onClick={handleReativar} 
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
              Reativar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{colaborador.cpf || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">
                  {colaborador.data_nascimento
                    ? `${formatarData(colaborador.data_nascimento)} (${calcularIdade(colaborador.data_nascimento)} anos)`
                    : 'Não informado'}
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">E-mail:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{colaborador.contact_email || 'Não informado'}</span>
                </div>
              </div>
              <div className="md:col-span-2 pt-2">
                <p className="text-sm text-muted-foreground mb-1">Telefones</p>
                {colaborador.telefones && colaborador.telefones.length > 0 && colaborador.telefones[0].phone_number !== 'N/A' ? (
                  colaborador.telefones.map((tel, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{tel.phone_number}</span>
                    </div>
                  ))
                ) : (
                  <p className="font-medium text-muted-foreground">Não informado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informações Profissionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Cargo</p>
              <p className="font-medium">{colaborador.cargo || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salário</p>
              <p className="font-medium">
                {colaborador.salario ? colaborador.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Admissão</p>
              <p className="font-medium">
                {formatarData(colaborador.data_contratacao)}
              </p>
            </div>
            {colaborador.is_veterinario && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">CRMV</p>
                  <p className="font-medium">{colaborador.crmv || 'N/A'} {colaborador.crmv_uf ? `(${colaborador.crmv_uf})` : ''}</p>
                </div>
                {colaborador.crmv_status && (
                  <div>
                    <p className="text-sm text-muted-foreground">Status CRMV</p>
                    <p className="font-medium capitalize">{colaborador.crmv_status}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">
              {colaborador.endereco.logradouro || 'Logradouro não informado'}, {colaborador.endereco.numero || 'S/N'}
              {colaborador.endereco.complemento && `, ${colaborador.endereco.complemento}`}
            </p>
            <p className="text-muted-foreground">
              {colaborador.endereco.bairro || 'Bairro não informado'} - {colaborador.endereco.cidade || 'Cidade não informada'}/{colaborador.endereco.estado || 'UF'}
            </p>
            <p className="text-muted-foreground">CEP: {colaborador.endereco.cep || 'Não informado'}</p>
            <p className="text-sm text-muted-foreground">
              País: <span className="font-medium text-foreground">{colaborador.endereco.pais || 'Brasil'}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Dados Bancários</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {colaborador.dados_bancarios && colaborador.dados_bancarios.banco && colaborador.dados_bancarios.banco !== 'N/A' ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Banco</p>
                  <p className="font-medium">{colaborador.dados_bancarios.banco}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agência</p>
                  <p className="font-medium">{colaborador.dados_bancarios.agencia}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conta</p>
                  <p className="font-medium">{colaborador.dados_bancarios.conta} {colaborador.dados_bancarios.tipo_conta ? `(${colaborador.dados_bancarios.tipo_conta})` : ''}</p>
                </div>
                {colaborador.dados_bancarios.chave_pix && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Chave PIX</p>
                      {colaborador.dados_bancarios.chave_pix ? (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{colaborador.dados_bancarios.chave_pix}</span>
                          {colaborador.dados_bancarios.tipo_chave_pix && (
                            <Badge variant="secondary" className="text-xs">
                              Tipo: {colaborador.dados_bancarios.tipo_chave_pix}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-500">Não informado</p>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="font-medium text-muted-foreground">Dados bancários não informados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção de Histórico de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Histórico de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : activityHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityHistory.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatarData(log.created_at)} {new Date(log.created_at).toLocaleTimeString('pt-BR')}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user_email || 'Sistema'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhuma atividade registrada para este colaborador.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}