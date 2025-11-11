import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Send, FileText, Trash2, Filter, PlusCircle, ListChecks } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { ContratoGerado } from '../../data/mockData';

export default function ContratosGerados() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<ContratoGerado[]>([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    const carregarContratos = async () => {
      try {
        // Primeiro tenta buscar do banco de dados
        const response = await fetch('http://localhost:3000/api/contracts/generated');
        if (response.ok) {
          const contratosBanco = await response.json();
          if (contratosBanco.length > 0) {
            // Converte os dados do banco para o formato esperado
            const contratosFormatados = contratosBanco.map((contrato: any) => ({
              ...contrato,
              dados_snapshot: typeof contrato.dados_snapshot === 'string' 
                ? JSON.parse(contrato.dados_snapshot) 
                : contrato.dados_snapshot,
              signatarios: typeof contrato.signatarios === 'string' 
                ? JSON.parse(contrato.signatarios) 
                : contrato.signatarios
            }));
            setContratos(contratosFormatados.sort((a: ContratoGerado, b: ContratoGerado) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            return;
          }
        }
        
        // Fallback para localStorage se não houver dados no banco
        const contratosSalvos = JSON.parse(localStorage.getItem('contratosGeradosPPM') || '[]');
        setContratos(contratosSalvos.sort((a: ContratoGerado, b: ContratoGerado) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (error) {
        console.error("Erro ao carregar contratos:", error);
        // Fallback para localStorage em caso de erro
        try {
          const contratosSalvos = JSON.parse(localStorage.getItem('contratosGeradosPPM') || '[]');
          setContratos(contratosSalvos.sort((a: ContratoGerado, b: ContratoGerado) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (localError) {
          console.error("Erro ao carregar contratos do localStorage:", localError);
          setContratos([]);
        }
      }
    };
    
    carregarContratos();
  }, []);

  const statusContratoParaBadge = (
    status: ContratoGerado['status_geral']
  ): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string; className?: string } => {
    switch (status) {
      case 'rascunho':
        return { variant: 'outline', text: 'Rascunho', className: 'border-yellow-500 text-yellow-600' };
      case 'aguardando_assinaturas':
        return { variant: 'outline', text: 'Aguardando Assinaturas', className: 'border-blue-500 text-blue-600' };
      case 'parcialmente_assinado':
        return { variant: 'outline', text: 'Parcialmente Assinado', className: 'border-purple-500 text-purple-600' };
      case 'assinado':
        return { variant: 'default', text: 'Assinado', className: 'bg-green-100 text-green-700' };
      case 'expirado':
        return { variant: 'secondary', text: 'Expirado', className: 'bg-gray-100 text-gray-600' };
      case 'cancelado':
        return { variant: 'destructive', text: 'Cancelado', className: 'bg-red-100 text-red-700' };
    }
    return { variant: 'secondary', text: String(status).toUpperCase(), className: 'bg-gray-200 text-gray-800' };
  };

  const contratosFiltrados = contratos.filter(contrato => {
    const nomeEntidadeMatch = contrato.entidade_nome.toLowerCase().includes(filtroNome.toLowerCase()) || 
                              contrato.template_nome.toLowerCase().includes(filtroNome.toLowerCase());
    const statusMatch = filtroStatus === 'todos' || contrato.status_geral === filtroStatus;
    const tipoMatch = filtroTipo === 'todos' || contrato.entidade_tipo === filtroTipo;
    return nomeEntidadeMatch && statusMatch && tipoMatch;
  });

  // Ações
  const handleVisualizarContrato = (id: string) => {
    navigate(`/contratos/gerados/${id}`);
  };
  const handleEditarContrato = (id: string) => {
    // Se for rascunho, poderia levar de volta para PreencherContrato.tsx ou uma tela de edição específica.
    const contrato = contratos.find(c => c.id === id);
    if (contrato && contrato.status_geral === 'rascunho') {
        navigate(`/contratos/gerar/preencher?templateId=${contrato.template_id}&entidadeId=${contrato.entidade_id}&tipo=${contrato.entidade_tipo}&contratoId=${id}`);
    } else {
        alert(`Editar contrato ${id} (apenas rascunhos podem ser editados diretamente aqui)`);
    }
  }
  const handleEnviarParaAssinatura = (contratoId: string) => {
    const contrato = contratos.find(c => c.id === contratoId);
    if (!contrato) {
      alert("Contrato não encontrado!");
      return;
    }

    if (contrato.status_geral === 'cancelado' || contrato.status_geral === 'assinado' || contrato.status_geral === 'expirado') {
      alert(`Contrato com status "${contrato.status_geral}" não pode ser enviado para assinatura.`);
      return;
    }

    const signatariosPendentes = contrato.signatarios.filter(s => s.status_assinatura === 'pendente');

    if (signatariosPendentes.length === 0) {
      alert("Todos os signatários já assinaram ou não há signatários pendentes.");
      return;
    }

    let linksGerados = "Links de assinatura (simulado - copie e cole no navegador):\n";
    signatariosPendentes.forEach(signatario => {
      if (!signatario.email || signatario.email === 'undefined') {
        linksGerados += `\nSignatário: ${signatario.nome} - ⚠️ EMAIL NÃO DEFINIDO - Não é possível gerar link de assinatura\n`;
        return;
      }
      const token = `${contrato.id}_${signatario.email}`;
      const link = `${window.location.origin}/assinar/${token}`;
      linksGerados += `\nSignatário: ${signatario.nome} (${signatario.email})\nLink: ${link}\n`;
    });

    // Logar os links no console para facilitar a cópia
    console.info("--- Links de Assinatura Gerados ---");
    console.log(linksGerados);
    console.info("-------------------------------------");

    // Atualizar status do contrato para 'aguardando_assinaturas' se era 'rascunho'
    // e persistir a mudança junto com a data de envio.
    if (contrato.status_geral === 'rascunho') {
      setContratos(prevContratos => {
        const atualizados = prevContratos.map(c => 
          c.id === contratoId 
          ? { 
              ...c, 
              status_geral: 'aguardando_assinaturas' as ContratoGerado['status_geral'], 
              data_envio_assinatura: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } 
          : c
        );
        try {
          localStorage.setItem('contratosGeradosPPM', JSON.stringify(atualizados));
        } catch (error) {
          console.error("Erro ao atualizar status do contrato no localStorage:", error);
        }
        return atualizados;
      });
      alert(`Contrato atualizado para "Aguardando Assinaturas".\n\nOs links de assinatura foram exibidos no console do navegador (DevTools) para cópia.`);
    } else {
      alert(`Links de assinatura foram exibidos no console do navegador (DevTools) para cópia.`);
    }
  };
  const handleCancelarContrato = (id: string) => {
    setContratos(prev => {
        const atualizados = prev.map(c => 
            c.id === id 
            ? {...c, status_geral: 'cancelado' as ContratoGerado['status_geral'], updated_at: new Date().toISOString()} 
            : c
        );
        try {
            localStorage.setItem('contratosGeradosPPM', JSON.stringify(atualizados));
        } catch (error) {
            console.error("Erro ao atualizar contrato cancelado no localStorage:", error);
        }
        return atualizados;
    });
    alert(`Contrato ${id} cancelado.`);
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <ListChecks className="mr-3 h-8 w-8 text-primary" />
          Contratos Gerados
        </h1>
        <Button onClick={() => navigate('/contratos/templates')} className="shadow-md hover:shadow-lg transition-shadow">
          <PlusCircle className="mr-2 h-5 w-5" />
          Gerar Novo Contrato
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-muted-foreground"/> Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            placeholder="Buscar por nome da entidade ou template..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger><SelectValue placeholder="Status do Contrato" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="aguardando_assinaturas">Aguardando Assinaturas</SelectItem>
              <SelectItem value="parcialmente_assinado">Parcialmente Assinado</SelectItem>
              <SelectItem value="assinado">Assinado</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger><SelectValue placeholder="Tipo de Contrato" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
              <SelectItem value="colaborador">Colaborador</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {contratosFiltrados.length === 0 ? (
        <Card className="mt-6 shadow-sm">
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum contrato gerado encontrado.</h3>
            <p className="text-muted-foreground mb-4">
              Gere contratos a partir dos templates para visualizá-los aqui.
            </p>
            <Button onClick={() => navigate('/contratos/templates')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ir para Templates de Contrato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {contratosFiltrados.map((contrato) => {
            const statusInfo = statusContratoParaBadge(contrato.status_geral);
            return (
            <Card key={contrato.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-md font-semibold mb-1 leading-tight">
                    {contrato.template_nome} {contrato.template_versao ? `(v${contrato.template_versao})` : ''}
                  </CardTitle>
                  <Badge variant={statusInfo.variant} className={statusInfo.className}>
                    {statusInfo.text}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para: <span className="font-medium text-primary">{contrato.entidade_nome}</span>
                </p>
                 <Badge 
                    variant="outline"
                    className={contrato.entidade_tipo === 'cliente' ? 'border-blue-500 text-blue-600' : 'border-purple-500 text-purple-600'}
                  >
                     {contrato.entidade_tipo === 'cliente' ? 'Cliente' : 'Colaborador'}
                  </Badge>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-xs text-muted-foreground">
                  Gerado em: {new Date(contrato.data_geracao || contrato.data_criacao || contrato.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Última atualização: {new Date(contrato.updated_at).toLocaleDateString('pt-BR')}
                </p>
                 <div className="mt-2 text-xs text-muted-foreground">
                    Signatários ({contrato.signatarios?.length || 0}):
                    <ul className="list-disc list-inside pl-1">
                        {contrato.signatarios?.slice(0,2).map((s, index) => <li key={s.email || `signatario-${index}`} title={`${s.nome} (${s.status_assinatura})`}>{s.nome} ({s.status_assinatura})</li>)}
                        {(contrato.signatarios?.length || 0) > 2 && <li key={`more-signatarios-${contrato.id}`}>...e mais {(contrato.signatarios?.length || 0) - 2}</li>}
                    </ul>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleVisualizarContrato(contrato.id)}><Eye className="mr-1 h-4 w-4"/> Ver Detalhes</Button>
                {contrato.status_geral === 'rascunho' && 
                    <Button variant="outline" size="sm" onClick={() => handleEditarContrato(contrato.id)} className="text-yellow-600 hover:text-yellow-700"><Edit className="mr-1 h-4 w-4"/> Editar</Button>}
                {(contrato.status_geral === 'rascunho' || contrato.status_geral === 'aguardando_assinaturas') && 
                    <Button variant="default" size="sm" onClick={() => handleEnviarParaAssinatura(contrato.id)}><Send className="mr-1 h-4 w-4"/> Enviar/Reenviar</Button>}
                {contrato.status_geral !== 'cancelado' && contrato.status_geral !== 'assinado' &&
                    <Button variant="destructive" size="sm" onClick={() => handleCancelarContrato(contrato.id)}><Trash2 className="mr-1 h-4 w-4"/> Cancelar</Button>}
              </CardFooter>
            </Card>
          )})
        }
        </div>
      )}
    </div>
  );
} 