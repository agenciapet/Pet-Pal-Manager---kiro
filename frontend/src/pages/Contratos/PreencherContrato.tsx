import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus, Users, Building } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { mockClientes, mockColaboradores, mockContratoTemplates, mockAgencia, mockContratosGerados } from '../../data/mockData';
import type { Cliente, Colaborador, ContratoTemplate, SignatarioContrato, ContratoGerado, Agencia } from '../../data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// Função auxiliar para substituir variáveis no template
const preencherTemplate = (conteudo: string, variaveis: Record<string, string | undefined>): string => {
  let conteudoPreenchido = conteudo;
  for (const chave in variaveis) {
    const valor = variaveis[chave] || '[PENDENTE]'; // Se a variável não for encontrada, marca como pendente
    // Escapa caracteres especiais na chave para uso seguro em new RegExp
    const chaveEscapada = chave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    conteudoPreenchido = conteudoPreenchido.replace(new RegExp(chaveEscapada, 'g'), valor);
  }
  return conteudoPreenchido;
};

export default function PreencherContrato() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');
  const entidadeId = searchParams.get('entidadeId');
  const tipoEntidade = searchParams.get('tipo') as 'cliente' | 'colaborador' | null;

  const [template, setTemplate] = useState<ContratoTemplate | null>(null);
  const [entidade, setEntidade] = useState<Cliente | Colaborador | null>(null);
  const [agencia] = useState<Agencia>(mockAgencia);
  const [conteudoRenderizado, setConteudoRenderizado] = useState('');
  const [dadosSnapshot, setDadosSnapshot] = useState<any>({});
  const [signatarios, setSignatarios] = useState<SignatarioContrato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateId || !entidadeId || !tipoEntidade) {
      alert('Informações insuficientes para gerar o contrato.');
      navigate('/contratos/templates');
      return;
    }

    const foundTemplate = mockContratoTemplates.find(t => t.id === templateId);
    let foundEntidade: Cliente | Colaborador | undefined;

    if (tipoEntidade === 'cliente') {
      foundEntidade = mockClientes.find(c => c.id === entidadeId);
    } else {
      foundEntidade = mockColaboradores.find(col => col.id === entidadeId);
    }

    if (!foundTemplate || !foundEntidade) {
      alert('Template ou entidade não encontrados.');
      navigate('/contratos/templates');
      return;
    }

    setTemplate(foundTemplate);
    setEntidade(foundEntidade);
    setLoading(false);
  }, [templateId, entidadeId, tipoEntidade, navigate]);

  // Preenche o conteúdo do contrato e define os signatários padrão
  useEffect(() => {
    if (template && entidade && agencia) {
      const vars: Record<string, string | undefined> = {};
      // Variáveis da Agência
      vars['{AGENCIA_RAZAO_SOCIAL}'] = agencia.razao_social;
      vars['{AGENCIA_CNPJ}'] = agencia.cnpj;
      vars['{AGENCIA_ENDERECO}'] = `${agencia.endereco.logradouro}, ${agencia.endereco.numero} - ${agencia.endereco.bairro}, ${agencia.endereco.cidade}/${agencia.endereco.estado}`;
      
      const socioPrincipalAgencia = agencia.socios[0]; // Pega o primeiro sócio como padrão
      if (socioPrincipalAgencia) {
        vars['{AGENCIA_SOCIO_ASSINATURA_NOME}'] = socioPrincipalAgencia.nome_completo;
        vars['{AGENCIA_SOCIO_ASSINATURA_CPF}'] = socioPrincipalAgencia.cpf;
      }

      let signatariosIniciais: SignatarioContrato[] = [];

      if (tipoEntidade === 'colaborador' && entidade) {
        const colab = entidade as Colaborador;
        vars['{COLABORADOR_NOME_COMPLETO}'] = colab.nome_completo;
        vars['{COLABORADOR_CPF}'] = colab.cpf;
        vars['{COLABORADOR_RG}'] = '[RG_PENDENTE]'; // Exemplo, precisaria vir do cadastro
        vars['{COLABORADOR_ENDERECO}'] = `${colab.endereco.logradouro}, ${colab.endereco.numero}`;
        vars['{COLABORADOR_CARGO}'] = colab.cargo;
        vars['{COLABORADOR_SALARIO}'] = colab.salario.toFixed(2);
        vars['{COLABORADOR_DATA_CONTRATACAO}'] = new Date(colab.data_contratacao).toLocaleDateString('pt-BR');
        
        signatariosIniciais.push({
          tipo_parte: 'colaborador',
          id_parte: colab.id,
          nome: colab.nome_completo,
          email: colab.email,
          cpf_cnpj: colab.cpf,
          status_assinatura: 'pendente'
        });
      } else if (tipoEntidade === 'cliente' && entidade) {
        const cli = entidade as Cliente;
        vars['{CLIENTE_RAZAO_SOCIAL}'] = cli.razao_social;
        vars['{CLIENTE_CNPJ}'] = cli.cnpj;
        vars['{CLIENTE_NOME_FANTASIA}'] = cli.nome_fantasia;
        vars['{CLIENTE_ENDERECO_PRINCIPAL}'] = cli.unidades.find(u => u.is_matriz)?.endereco ? 
          `${cli.unidades.find(u => u.is_matriz)!.endereco.logradouro}, ${cli.unidades.find(u => u.is_matriz)!.endereco.numero}` : '[ENDERECO_PENDENTE]';

        const representantePrincipalCliente = cli.unidades.find(u => u.is_matriz)?.representantes[0]; // Pega o primeiro representante da matriz
        if (representantePrincipalCliente) {
          vars['{CLIENTE_REPRESENTANTE_NOME}'] = representantePrincipalCliente.nome_completo;
          vars['{CLIENTE_REPRESENTANTE_CPF}'] = representantePrincipalCliente.cpf;
          vars['{CLIENTE_REPRESENTANTE_EMAIL}'] = representantePrincipalCliente.email;
          vars['{CLIENTE_REPRESENTANTE_CARGO}'] = representantePrincipalCliente.cargo;

          signatariosIniciais.push({
            tipo_parte: 'cliente_representante',
            id_parte: representantePrincipalCliente.id,
            nome: representantePrincipalCliente.nome_completo,
            email: representantePrincipalCliente.email,
            cpf_cnpj: representantePrincipalCliente.cpf,
            status_assinatura: 'pendente'
          });
        } else {
            vars['{CLIENTE_REPRESENTANTE_NOME}'] = '[REPRESENTANTE_PENDENTE]';
            // Adicionar signatário genérico para a empresa se não houver representante específico
            signatariosIniciais.push({
                tipo_parte: 'empresa_contato_principal',
                nome: cli.razao_social, // Nome da empresa
                email: cli.email, // Email geral da empresa
                cpf_cnpj: cli.cnpj,
                status_assinatura: 'pendente'
              });
        }
        // Para serviços, assumindo que um contrato de cliente pode estar ligado a um serviço específico (simplificado)
        // Em um caso real, o usuário poderia selecionar o serviço ou isso viria de outro fluxo
        const primeiroServicoAtivo = cli.servicos_contratados.find(s => s.is_active);
        if (primeiroServicoAtivo) {
            vars['{SERVICO_NOME}'] = primeiroServicoAtivo.servico_nome;
            vars['{SERVICO_DESCRICAO}'] = '[DESCRICAO_SERVICO_PENDENTE]'; // Buscar descrição real do serviço
            vars['{SERVICO_VALOR}'] = primeiroServicoAtivo.valor.toFixed(2);
            vars['{SERVICO_PERIODICIDADE}'] = '[PERIODICIDADE_PENDENTE]';
        } else {
            vars['{SERVICO_NOME}'] = '[SERVICO_NAO_ESPECIFICADO]';
        }
        vars['{DATA_INICIO_CONTRATO}'] = new Date().toLocaleDateString('pt-BR');
      }

      // Adiciona sócio da agência como signatário
      if (socioPrincipalAgencia) {
        signatariosIniciais.push({
            tipo_parte: 'agencia_socio',
            id_parte: socioPrincipalAgencia.id,
            nome: socioPrincipalAgencia.nome_completo,
            email: socioPrincipalAgencia.email,
            cpf_cnpj: socioPrincipalAgencia.cpf,
            status_assinatura: 'pendente'
        });
      }
      
      setSignatarios(signatariosIniciais);
      setConteudoRenderizado(preencherTemplate(template.conteudo, vars));
      setDadosSnapshot({ template, entidade, agencia, variaveisUsadas: vars, dataGeracao: new Date().toISOString() });
    }
  }, [template, entidade, agencia, tipoEntidade]);

  const handleSalvarRascunho = () => {
    if (!template || !entidade) return;

    const novoContrato: ContratoGerado = {
      id: `contrato_${Date.now()}`,
      template_id: template.id,
      template_nome: template.nome,
      template_versao: template.versao,
      tipo_contrato: tipoEntidade as 'cliente' | 'colaborador',
      entidade_id: entidade.id,
      entidade_nome: tipoEntidade === 'cliente' ? (entidade as Cliente).razao_social : (entidade as Colaborador).nome_completo,
      // pdf_url_original: 'gerar_e_salvar_pdf_aqui', // Lógica de PDF a ser implementada
      pdf_url_original: '',
      signatarios: signatarios,
      status_geral: 'rascunho',
      dados_snapshot: dadosSnapshot,
      data_geracao: dadosSnapshot.dataGeracao,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Salvar no mockData (runtime) e localStorage (persistência)
    mockContratosGerados.push(novoContrato); // Atualiza o array em memória
    try {
      const contratosSalvos = JSON.parse(localStorage.getItem('contratosGeradosPPM') || '[]');
      contratosSalvos.push(novoContrato);
      localStorage.setItem('contratosGeradosPPM', JSON.stringify(contratosSalvos));
    } catch (error) {
      console.error("Erro ao salvar contrato no localStorage:", error);
    }

    console.log('Contrato Gerado (Rascunho):', novoContrato);
    alert('Rascunho do contrato salvo!');
    navigate('/contratos/gerados'); // Navegar para lista de contratos gerados (a ser criada)
  };

  if (loading || !template || !entidade) {
    return <div className="flex-1 p-8 pt-6 text-center">Carregando dados para geração do contrato...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}> {/* Voltar para tela anterior (seleção de entidade) */}
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
            <h1 className="text-2xl font-bold">
                Revisar e Gerar Contrato
            </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Preview do Contrato */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Pré-visualização do Contrato</CardTitle>
            <CardContent className="text-sm text-muted-foreground">
                Template: {template.nome} (v{template.versao}) <br />
                Para: {tipoEntidade === 'cliente' ? (entidade as Cliente).razao_social : (entidade as Colaborador).nome_completo}
            </CardContent>
          </CardHeader>
          <CardContent>
            <div 
              className="border rounded-md p-6 min-h-[400px] max-h-[60vh] overflow-y-auto bg-white text-black prose prose-sm"
              dangerouslySetInnerHTML={{ __html: conteudoRenderizado }}
            />
            <p className="text-xs text-muted-foreground mt-2">
                Este é um preview do contrato. As variáveis foram preenchidas com os dados disponíveis.
                Verifique e ajuste os signatários e outras informações se necessário.
            </p>
          </CardContent>
        </Card>

        {/* Coluna de Configurações e Signatários */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5"/>Signatários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {signatarios.map((signatario, index) => (
                        <div key={index} className="p-3 border rounded-md bg-muted/50">
                            <p className="font-semibold text-sm">{signatario.nome}</p>
                            <p className="text-xs text-muted-foreground">{signatario.email}</p>
                            <p className="text-xs text-muted-foreground uppercase">{signatario.tipo_parte.replace('_', ' ')}</p>
                            {/* TODO: Permitir editar/remover signatários */}
                        </div>
                    ))}
                    {/* <Button variant="outline" size="sm" className="mt-2 w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Adicionar Signatário
                    </Button> */}
                </CardContent>
            </Card>
            
            {/* Poderia haver aqui inputs para variáveis não preenchidas ou que precisam de confirmação */}

        </div>
      </div>

      <CardFooter className="flex justify-end gap-4 border-t pt-6 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contratos/templates')}
          >
            Cancelar Geração
          </Button>
          <Button type="button" onClick={handleSalvarRascunho} className="shadow-md hover:shadow-lg transition-shadow">
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho do Contrato
          </Button>
          {/* Futuramente: <Button>Enviar para Assinatura</Button> */}
        </CardFooter>
    </div>
  );
} 