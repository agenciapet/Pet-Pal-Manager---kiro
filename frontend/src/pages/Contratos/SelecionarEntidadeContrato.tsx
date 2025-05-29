import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileSearch, User, Building } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { mockClientes, mockColaboradores, mockContratoTemplates } from '../../data/mockData';
import type { Cliente, Colaborador, ContratoTemplate } from '../../data/mockData';

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

    if (tipoTemplate === 'cliente') {
      setEntidades(mockClientes.filter(c => c.is_active));
    } else if (tipoTemplate === 'colaborador') {
      setEntidades(mockColaboradores.filter(c => c.is_active));
    }
    setLoading(false);
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
    // Navegar para a próxima etapa: pré-visualização e preenchimento do contrato
    navigate(`/contratos/gerar/preencher?templateId=${templateId}&entidadeId=${entidadeId}&tipo=${tipoTemplate}`);
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