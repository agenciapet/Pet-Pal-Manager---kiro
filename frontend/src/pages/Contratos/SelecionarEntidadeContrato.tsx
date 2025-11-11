import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileSearch, User, Building } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { mockContratoTemplates } from '../../data/mockData';
import type { Cliente, Colaborador, ContratoTemplate } from '../../data/mockData';
import { clientService, employeeService } from '../../services/authService';

export default function SelecionarEntidadeContrato() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');
  const tipoTemplate = searchParams.get('tipo') as 'cliente' | 'colaborador' | null;

  const [template, setTemplate] = useState<ContratoTemplate | null>(null);
  const [entidades, setEntidades] = useState<(Cliente | Colaborador)[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!templateId || !tipoTemplate) {
        alert('ID do template ou tipo não fornecido.');
        navigate('/contratos/templates');
        return;
      }

      const foundTemplate = mockContratoTemplates.find(t => t.id === templateId);
      if (!foundTemplate || foundTemplate.tipo !== tipoTemplate) {
        alert('Template inválido ou tipo não corresponde.');
        navigate('/contratos/templates');
        return;
      }
      setTemplate(foundTemplate);

      try {
        if (tipoTemplate === 'cliente') {
          try {
            const { companies } = await clientService.getAllClients('active');
            // Converter dados do backend para o formato esperado
            const clientesFormatados = companies.map((company: any) => ({
              id: company.id,
              razao_social: company.company_name,
              nome_fantasia: company.trade_name || company.company_name,
              cnpj: company.cnpj,
              is_active: company.is_active,
              // Adicionar outros campos necessários
              unidades: company.units || [],
              servicos_contratados: company.services || [],
              email: company.contact_email
            }));
            setEntidades(clientesFormatados);
          } catch (apiError) {
            console.warn('API não disponível, usando dados mock para clientes:', apiError);
            // Fallback para mock data se API não estiver disponível
            const { mockClientes } = await import('../../data/mockData');
            setEntidades(mockClientes.filter(c => c.is_active));
          }
        } else if (tipoTemplate === 'colaborador') {
          try {
            const { employees } = await employeeService.getAllEmployees('active');
            // Converter dados do backend para o formato esperado
            const colaboradoresFormatados = employees.map((employee: any) => ({
              id: employee.id,
              nome_completo: employee.full_name,
              cpf: employee.cpf,
              is_active: employee.is_active,
              email: employee.contact_email,
              // Adicionar outros campos necessários
              cargo: employee.position,
              salario: employee.salary,
              data_contratacao: employee.hire_date,
              endereco: {
                logradouro: employee.street,
                numero: employee.address_number,
                bairro: employee.neighborhood,
                cidade: employee.city,
                estado: employee.state,
                cep: employee.zip_code
              }
            }));
            setEntidades(colaboradoresFormatados);
          } catch (apiError) {
            console.warn('API não disponível, usando dados mock para colaboradores:', apiError);
            // Fallback para mock data se API não estiver disponível
            const { mockColaboradores } = await import('../../data/mockData');
            setEntidades(mockColaboradores.filter(c => c.is_active));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar entidades:', error);
        alert('Erro ao carregar dados. Verifique sua conexão.');
      }
      
      setLoading(false);
    };

    loadData();
  }, [templateId, tipoTemplate, navigate]);

  const entidadesFiltradas = entidades.filter(entidade => {
    if (tipoTemplate === 'cliente') {
      const cliente = entidade as Cliente;
      return cliente.razao_social.toLowerCase().includes(filtro.toLowerCase()) || 
             cliente.nome_fantasia.toLowerCase().includes(filtro.toLowerCase()) || 
             cliente.cnpj.includes(filtro);
    }
    if (tipoTemplate === 'colaborador') {
      const colaborador = entidade as Colaborador;
      return colaborador.nome_completo.toLowerCase().includes(filtro.toLowerCase()) || 
             colaborador.cpf.includes(filtro);
    }
    return false;
  });

  const handleSelecionarEntidade = (entidadeId: string) => {
    // Navegar para seleção de serviços (apenas para clientes)
    if (tipoTemplate === 'cliente') {
      navigate(`/contratos/gerar/selecionar-servicos?templateId=${templateId}&entidadeId=${entidadeId}&tipo=${tipoTemplate}`);
    } else {
      // Para colaboradores, ir direto para preenchimento
      navigate(`/contratos/gerar/preencher?templateId=${templateId}&entidadeId=${entidadeId}&tipo=${tipoTemplate}`);
    }
  };

  if (loading || !template) {
    return <div className="flex-1 p-8 pt-6 text-center">Carregando informações do template...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/contratos/templates')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Templates
        </Button>
        <h1 className="text-2xl font-bold">
          Gerar Contrato: <span className="text-primary">{template.nome}</span>
        </h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            {tipoTemplate === 'cliente' ? <Building className="mr-2 h-5 w-5" /> : <User className="mr-2 h-5 w-5" />}
            Selecione {tipoTemplate === 'cliente' ? 'o Cliente' : 'o Colaborador'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-1">
            Você está gerando um contrato do tipo "{template.tipo}" versão {template.versao}.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Escolha {tipoTemplate === 'cliente' ? 'o cliente' : 'o colaborador'} para o qual este contrato será gerado.
          </p>
          <div className="mb-4">
            <Input 
              placeholder={`Buscar por nome, CNPJ/CPF...`}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {entidadesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSearch className="mx-auto h-12 w-12 mb-4" />
              <p>Nenhuma {tipoTemplate === 'cliente' ? 'cliente' : 'colaborador'} encontrado com os filtros atuais.</p>
              {tipoTemplate === 'cliente' && 
                <Link to="/clientes/novo" className="text-primary hover:underline mt-2 block">Cadastrar Novo Cliente</Link> }
              {tipoTemplate === 'colaborador' && 
                <Link to="/colaboradores/novo" className="text-primary hover:underline mt-2 block">Cadastrar Novo Colaborador</Link> }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {entidadesFiltradas.map(entidade => (
                <Card 
                  key={entidade.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelecionarEntidade(entidade.id)}
                >
                  <CardContent className="pt-4">
                    <div className="font-semibold">
                      {tipoTemplate === 'cliente' ? (entidade as Cliente).razao_social : (entidade as Colaborador).nome_completo}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tipoTemplate === 'cliente' ? `CNPJ: ${(entidade as Cliente).cnpj}` : `CPF: ${(entidade as Colaborador).cpf}`}
                    </div>
                    {tipoTemplate === 'cliente' && (
                      <div className="text-xs text-muted-foreground">
                        {(entidade as Cliente).nome_fantasia}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 