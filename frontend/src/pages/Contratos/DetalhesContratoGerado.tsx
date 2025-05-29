import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, FileText, Users, ListChecks, Download, Mail, Edit } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import type { ContratoGerado, SignatarioContrato } from '../../data/mockData';

// Função para obter badge de status do contrato (similar à de ContratosGerados.tsx)
const statusContratoParaBadge = (
    status: ContratoGerado['status_geral']
  ): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string; className?: string } => {
    switch (status) {
      case 'rascunho': return { variant: 'outline', text: 'Rascunho', className: 'border-yellow-500 text-yellow-600' };
      case 'aguardando_assinaturas': return { variant: 'outline', text: 'Aguardando Assinaturas', className: 'border-blue-500 text-blue-600' };
      case 'parcialmente_assinado': return { variant: 'outline', text: 'Parcialmente Assinado', className: 'border-purple-500 text-purple-600' };
      case 'assinado': return { variant: 'default', text: 'Assinado', className: 'bg-green-100 text-green-700' };
      case 'expirado': return { variant: 'secondary', text: 'Expirado', className: 'bg-gray-100 text-gray-600' };
      case 'cancelado': return { variant: 'destructive', text: 'Cancelado', className: 'bg-red-100 text-red-700' };
      default: return { variant: 'secondary', text: String(status).toUpperCase(), className: 'bg-gray-200 text-gray-800' };
    }
  };

// Função para obter badge de status de assinatura do signatário
const statusSignatarioParaBadge = (
    status: SignatarioContrato['status_assinatura']
  ): { variant: 'default' | 'secondary'; text: string; className?: string } => {
    switch (status) {
      case 'pendente': return { variant: 'secondary', text: 'Pendente', className: 'bg-yellow-100 text-yellow-700' };
      case 'assinado': return { variant: 'default', text: 'Assinado', className: 'bg-green-100 text-green-700' };
      default: return { variant: 'secondary', text: String(status).toUpperCase() };
    }
  };

// Função auxiliar para substituir variáveis no template (a mesma de PreencherContrato)
const preencherTemplate = (conteudo: string, variaveis: Record<string, string | undefined>): string => {
    let conteudoPreenchido = conteudo;
    for (const chave in variaveis) {
      const valor = variaveis[chave] || '[DADO_NAO_DISPONIVEL_NO_SNAPSHOT]';
      // Escapa caracteres especiais na chave para uso seguro em new RegExp
      const chaveEscapada = chave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conteudoPreenchido = conteudoPreenchido.replace(new RegExp(chaveEscapada, 'g'), valor);
    }
    return conteudoPreenchido;
  };

export default function DetalhesContratoGerado() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState<ContratoGerado | null>(null);
  const [loading, setLoading] = useState(true);
  const [conteudoHtmlRenderizado, setConteudoHtmlRenderizado] = useState('');

  useEffect(() => {
    if (!id) {
      alert('ID do contrato não fornecido.');
      navigate('/contratos/gerados');
      return;
    }
    try {
      const contratosSalvos: ContratoGerado[] = JSON.parse(localStorage.getItem('contratosGeradosPPM') || '[]');
      const foundContrato = contratosSalvos.find(c => c.id === id);
      if (foundContrato) {
        setContrato(foundContrato);
        // Renderizar o HTML do contrato a partir do snapshot
        if (foundContrato.dados_snapshot && foundContrato.dados_snapshot.template && foundContrato.dados_snapshot.template.conteudo && foundContrato.dados_snapshot.variaveisUsadas) {
            setConteudoHtmlRenderizado(preencherTemplate(foundContrato.dados_snapshot.template.conteudo, foundContrato.dados_snapshot.variaveisUsadas));
        } else {
            // Fallback se a estrutura do snapshot não for a esperada ou se for um contrato antigo sem snapshot completo
            setConteudoHtmlRenderizado('<p>Conteúdo do contrato não pôde ser renderizado a partir do snapshot.</p>');
        }
      } else {
        alert('Contrato não encontrado.');
        navigate('/contratos/gerados');
      }
    } catch (error) {
      console.error("Erro ao carregar contrato do localStorage:", error);
      alert('Erro ao carregar contrato.');
      navigate('/contratos/gerados');
    }
    setLoading(false);
  }, [id, navigate]);

  const handleEditarRascunho = () => {
    if (contrato && contrato.status_geral === 'rascunho') {
        navigate(`/contratos/gerar/preencher?templateId=${contrato.template_id}&entidadeId=${contrato.entidade_id}&tipo=${contrato.tipo_contrato}&contratoId=${contrato.id}`);
    }
  };

  if (loading) {
    return <div className="flex-1 p-8 pt-6 text-center">Carregando detalhes do contrato...</div>;
  }

  if (!contrato) {
    // Este caso já deve ser tratado pelo useEffect, mas é um fallback.
    return <div className="flex-1 p-8 pt-6 text-center">Contrato não encontrado.</div>;
  }

  const statusInfo = statusContratoParaBadge(contrato.status_geral);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/contratos/gerados')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-3 h-8 w-8 text-primary" />
            Detalhes do Contrato
          </h1>
        </div>
        <div>
            {contrato.status_geral === 'rascunho' && (
                <Button onClick={handleEditarRascunho} className="mr-2">
                    <Edit className="mr-2 h-4 w-4"/> Editar Rascunho
                </Button>
            )}
            <Button variant="outline" onClick={() => alert('Download PDF (a ser implementado)')} className="mr-2">
                <Download className="mr-2 h-4 w-4"/> Baixar PDF
            </Button>
            {(contrato.status_geral === 'rascunho' || contrato.status_geral === 'aguardando_assinaturas') && (
                <Button onClick={() => alert('Enviar para assinatura (a ser implementado)')}>
                    <Mail className="mr-2 h-4 w-4"/> Enviar para Assinatura
                </Button>
            )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl">{contrato.template_nome} (v{contrato.template_versao})</CardTitle>
                <p className="text-sm text-muted-foreground">Para: {contrato.entidade_nome} ({contrato.tipo_contrato === 'cliente' ? 'Cliente' : 'Colaborador'})</p>
            </div>
            <Badge variant={statusInfo.variant} className={statusInfo.className + ' px-3 py-1 text-sm'}>{statusInfo.text}</Badge>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>ID do Contrato:</strong> {contrato.id}</div>
                <div><strong>Gerado em:</strong> {new Date(contrato.data_geracao).toLocaleString('pt-BR')}</div>
                <div><strong>Última Atualização:</strong> {new Date(contrato.updated_at).toLocaleString('pt-BR')}</div>
                {contrato.servico_contratado_nome && <div><strong>Serviço Vinculado:</strong> {contrato.servico_contratado_nome}</div>}
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="conteudo" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:max-w-md mb-4">
          <TabsTrigger value="conteudo"><FileText className="mr-2 h-4 w-4 inline-block"/>Conteúdo</TabsTrigger>
          <TabsTrigger value="signatarios"><Users className="mr-2 h-4 w-4 inline-block"/>Signatários</TabsTrigger>
          <TabsTrigger value="auditoria"><Info className="mr-2 h-4 w-4 inline-block"/>Dados de Auditoria</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conteudo">
          <Card>
            <CardHeader><CardTitle>Conteúdo do Contrato</CardTitle></CardHeader>
            <CardContent>
              <div 
                className="border rounded-md p-6 min-h-[400px] max-h-[70vh] overflow-y-auto bg-white text-black prose prose-sm"
                dangerouslySetInnerHTML={{ __html: conteudoHtmlRenderizado }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatarios">
          <Card>
            <CardHeader><CardTitle>Signatários</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {contrato.signatarios.map((signatario, index) => {
                const signatarioStatusInfo = statusSignatarioParaBadge(signatario.status_assinatura);
                return (
                  <div key={index} className="p-4 border rounded-md flex flex-col sm:flex-row justify-between sm:items-center bg-muted/30 gap-2">
                    <div className="flex-grow">
                        <p className="font-semibold">{signatario.nome}</p>
                        <p className="text-sm text-muted-foreground">{signatario.email}</p>
                        {signatario.tipo && <p className="text-xs text-muted-foreground uppercase">{signatario.tipo.replace('_',' ')}</p>}
                        {signatario.status_assinatura === 'assinado' && signatario.data_assinatura && (
                          <p className="text-xs text-green-600 mt-1">
                            Assinado em: {new Date(signatario.data_assinatura).toLocaleString('pt-BR')}
                          </p>
                        )}
                    </div>
                    <Badge variant={signatarioStatusInfo.variant} className={signatarioStatusInfo.className + ' self-start sm:ml-auto'}>
                        {signatarioStatusInfo.text}
                    </Badge>
                  </div>
                );
              })}
              {contrato.signatarios.length === 0 && <p>Nenhum signatário definido para este contrato.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auditoria">
          <Card>
            <CardHeader><CardTitle>Dados de Auditoria das Assinaturas</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {contrato.signatarios.map((signatario, index) => (
                <div key={`audit-${index}`} className="p-4 border rounded-md bg-muted/5">
                  <h3 className="font-semibold text-md mb-2">{signatario.nome} ({signatario.email})</h3>
                  {signatario.status_assinatura === 'assinado' && signatario.dadosAuditoria ? (
                    <ul className="space-y-1 text-sm">
                      <li><strong>Status:</strong> <Badge variant="default" className="bg-green-100 text-green-700">Assinado</Badge></li>
                      <li><strong>Nome Confirmado:</strong> {signatario.dadosAuditoria.nome_confirmado || 'Não registrado'}</li>
                      <li><strong>Data da Assinatura (Servidor):</strong> {signatario.data_assinatura ? new Date(signatario.data_assinatura).toLocaleString('pt-BR') : 'N/A'}</li>
                      <li><strong>Data da Assinatura (Cliente):</strong> {signatario.dadosAuditoria.data_assinatura_cliente ? new Date(signatario.dadosAuditoria.data_assinatura_cliente).toLocaleString('pt-BR') : 'N/A'}</li>
                      <li><strong>IP (Simulado):</strong> {signatario.dadosAuditoria.ip_simulado || 'Não registrado'}</li>
                      <li><strong>User Agent:</strong> <span className="text-xs break-all">{signatario.dadosAuditoria.user_agent || 'Não registrado'}</span></li>
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aguardando assinatura ou dados de auditoria não disponíveis.</p>
                  )}
                </div>
              ))}
              {contrato.signatarios.length === 0 && <p>Nenhum signatário para exibir dados de auditoria.</p>}
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-3">Snapshot de Geração do Contrato</h3>
                <p className="text-sm text-muted-foreground mb-2">Estes são os dados que foram utilizados para gerar o contrato no momento da sua criação ou última atualização significativa.</p>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto max-h-[500px]">
                  {JSON.stringify(contrato.dados_snapshot, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
} 