import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ContratoGerado, SignatarioContrato } from '../../data/mockData';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { CheckSquare, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { mockAgencia } from '../../data/mockData'; // Para exibir o nome da agência

// Função auxiliar para substituir variáveis no template (a mesma de PreencherContrato/DetalhesContrato)
const preencherTemplate = (conteudo: string, variaveis: Record<string, string | undefined>): string => {
    let conteudoPreenchido = conteudo;
    for (const chave in variaveis) {
      const valor = variaveis[chave] || '[DADO_NAO_DISPONIVEL]';
      // Escapa caracteres especiais na chave para uso seguro em new RegExp
      const chaveEscapada = chave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conteudoPreenchido = conteudoPreenchido.replace(new RegExp(chaveEscapada, 'g'), valor);
    }
    return conteudoPreenchido;
  };

// Mock da função para "decodificar" o token. Em um sistema real, isso validaria o token contra o backend.
// Por agora, o token será "contratoId_signatarioEmail" para simplificar.
const decodeTokenAssinatura = (token: string): { contratoId: string; emailSignatario: string } | null => {
    const parts = token.split('_');
    // Se o token for, por exemplo, "contrato_IDContrato_email@dominio.com"
    // parts[0] = "contrato"
    // parts[1] = "IDContrato"
    // parts[2] = "email@dominio.com"
    // Precisamos juntar as partes do ID do contrato e pegar o email corretamente.
    if (parts.length >= 3) { // Garante que temos pelo menos "prefixo_id_email"
        const emailSignatario = parts.pop(); // Pega o último elemento como email
        const contratoId = parts.join('_'); // Junta o restante como ID do contrato
        if (emailSignatario && contratoId) {
            return { contratoId, emailSignatario };
        }
    }
    console.warn("[decodeTokenAssinatura] Formato de token inesperado:", token, "Partes:", parts);
    return null;
};

export default function PaginaAssinatura() {
    const { tokenSignatario } = useParams<{ tokenSignatario: string }>();
    const navigate = useNavigate();

    const [contrato, setContrato] = useState<ContratoGerado | null>(null);
    const [signatario, setSignatario] = useState<SignatarioContrato | null>(null);
    const [conteudoHtml, setConteudoHtml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nomeAssinante, setNomeAssinante] = useState('');
    const [cpfAssinante, setCpfAssinante] = useState('');
    const [aceiteTermos, setAceiteTermos] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agenciaNome, setAgenciaNome] = useState('');

    useEffect(() => {
        // Carregar nome da agência (pode vir do localStorage se já foi salvo)
        try {
            const agenciaSalva = localStorage.getItem('agenciaPPM');
            if (agenciaSalva) {
                setAgenciaNome(JSON.parse(agenciaSalva).nome_fantasia || JSON.parse(agenciaSalva).razao_social || 'PetPal Manager');
            } else {
                setAgenciaNome(mockAgencia.nome_fantasia || mockAgencia.razao_social || 'PetPal Manager');
            }
        } catch {
            setAgenciaNome('PetPal Manager');
        }
        console.log("[PaginaAssinatura] Token recebido:", tokenSignatario);

        if (!tokenSignatario) {
            setError("Token de assinatura inválido ou não fornecido.");
            setLoading(false);
            console.error("[PaginaAssinatura] Erro: Token não fornecido.");
            return;
        }

        const decoded = decodeTokenAssinatura(tokenSignatario);
        console.log("[PaginaAssinatura] Token decodificado:", decoded);
        if (!decoded) {
            setError("Token de assinatura inválido.");
            setLoading(false);
            console.error("[PaginaAssinatura] Erro: Falha ao decodificar token.");
            return;
        }

        const { contratoId, emailSignatario } = decoded;
        console.log(`[PaginaAssinatura] Procurando Contrato ID: ${contratoId}, Email Signatário: ${emailSignatario}`);

        try {
            const contratosSalvosJson = localStorage.getItem('contratosGeradosPPM');
            console.log("[PaginaAssinatura] Contratos salvos (JSON string do localStorage):", contratosSalvosJson);
            const contratosSalvos: ContratoGerado[] = JSON.parse(contratosSalvosJson || '[]');
            console.log("[PaginaAssinatura] Contratos salvos (Parseados):", contratosSalvos);
            const foundContrato = contratosSalvos.find(c => c.id === contratoId);
            console.log("[PaginaAssinatura] Contrato encontrado:", foundContrato);

            if (!foundContrato) {
                setError("Contrato não encontrado.");
                setLoading(false);
                console.error(`[PaginaAssinatura] Erro: Contrato ID ${contratoId} não encontrado.`);
                return;
            }

            const foundSignatario = foundContrato.signatarios.find(s => s.email === emailSignatario);
            console.log("[PaginaAssinatura] Signatário encontrado:", foundSignatario);

            if (!foundSignatario) {
                setError("Signatário não encontrado para este contrato.");
                setLoading(false);
                console.error(`[PaginaAssinatura] Erro: Signatário com email ${emailSignatario} não encontrado no contrato ${contratoId}.`);
                return;
            }
            
            if (foundSignatario.status_assinatura === 'assinado') {
                setError("Este contrato já foi assinado por você.");
                setLoading(false);
                setContrato(foundContrato); // Ainda seta para exibir o erro com contexto
                setSignatario(foundSignatario);
                console.warn("[PaginaAssinatura] Info: Contrato já assinado por este signatário.");
                return;
            }
            
            if (foundContrato.status_geral === 'cancelado' || foundContrato.status_geral === 'expirado') {
                 setError(`Este contrato não pode ser assinado pois seu status é: ${foundContrato.status_geral}`);
                 setLoading(false);
                 setContrato(foundContrato); // Ainda seta para exibir o erro com contexto
                 setSignatario(foundSignatario);
                 console.warn(`[PaginaAssinatura] Info: Tentativa de assinar contrato com status ${foundContrato.status_geral}.`);
                 return;
            }

            setContrato(foundContrato);
            setSignatario(foundSignatario);
            setNomeAssinante(foundSignatario.nome); // Pré-popula o nome
            console.log("[PaginaAssinatura] Dados do contrato e signatário carregados com sucesso.");

            if (foundContrato.dados_snapshot?.template?.conteudo && foundContrato.dados_snapshot?.variaveisUsadas) {
                setConteudoHtml(preencherTemplate(foundContrato.dados_snapshot.template.conteudo, foundContrato.dados_snapshot.variaveisUsadas));
                console.log("[PaginaAssinatura] HTML do contrato renderizado.");
            } else {
                setError("Conteúdo do contrato não pôde ser carregado (problema com snapshot/template).");
                console.error("[PaginaAssinatura] Erro: Falha ao obter conteúdo do template do snapshot.");
            }

        } catch (e) {
            console.error("[PaginaAssinatura] Erro CRÍTICO ao carregar dados para assinatura:", e);
            setError("Ocorreu um erro ao processar sua solicitação de assinatura. Verifique o console para detalhes.");
        } finally {
            setLoading(false);
            console.log("[PaginaAssinatura] Finalizado useEffect de carregamento.");
        }

    }, [tokenSignatario]);

    const handleAssinar = async () => {
        if (!contrato || !signatario || !aceiteTermos || !nomeAssinante.trim() || !cpfAssinante.trim()) {
            alert("Por favor, confirme seu nome completo, CPF e aceite os termos para assinar.");
            return;
        }
        setIsSubmitting(true);

        try {
            const contratosSalvos: ContratoGerado[] = JSON.parse(localStorage.getItem('contratosGeradosPPM') || '[]');
            const contratoIndex = contratosSalvos.findIndex(c => c.id === contrato.id);

            if (contratoIndex === -1) {
                setError("Erro ao encontrar o contrato para atualizar. Tente novamente.");
                setIsSubmitting(false);
                return;
            }

            const signatarioIndex = contratosSalvos[contratoIndex].signatarios.findIndex(s => s.email === signatario.email);
            if (signatarioIndex === -1) {
                setError("Erro ao encontrar o signatário para atualizar. Tente novamente.");
                setIsSubmitting(false);
                return;
            }

            // Atualiza o signatário
            contratosSalvos[contratoIndex].signatarios[signatarioIndex].status_assinatura = 'assinado';
            contratosSalvos[contratoIndex].signatarios[signatarioIndex].data_assinatura = new Date().toISOString();
            // Coleta dados de auditoria
            contratosSalvos[contratoIndex].signatarios[signatarioIndex].dadosAuditoria = {
                ip_simulado: '192.168.1.1 (simulado)', // Manter a simulação clara
                user_agent: navigator.userAgent,
                data_assinatura_cliente: new Date().toISOString(), // Data/hora do cliente no momento da assinatura
                nome_confirmado: nomeAssinante,
                cpf_confirmado: cpfAssinante,
            };
            // Poderia adicionar aqui o nome digitado se for diferente, ou IP, etc.
            // contratosSalvos[contratoIndex].signatarios[signatarioIndex].nome_confirmado = nomeAssinante;


            // Atualiza o status geral do contrato
            const todosAssinaram = contratosSalvos[contratoIndex].signatarios.every(s => s.status_assinatura === 'assinado');
            if (todosAssinaram) {
                contratosSalvos[contratoIndex].status_geral = 'assinado';
                contratosSalvos[contratoIndex].data_conclusao = new Date().toISOString();
            } else {
                contratosSalvos[contratoIndex].status_geral = 'parcialmente_assinado';
            }
            contratosSalvos[contratoIndex].data_ultima_assinatura = new Date().toISOString();
            contratosSalvos[contratoIndex].updated_at = new Date().toISOString();

            localStorage.setItem('contratosGeradosPPM', JSON.stringify(contratosSalvos));
            
            // Salvar também no banco de dados
            try {
                const response = await fetch(`http://localhost:3000/api/contracts/generated/${contrato.id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status_geral: todosAssinaram ? 'assinado' : 'parcialmente_assinado',
                        signatarios: contratosSalvos[contratoIndex].signatarios
                    })
                });
                
                if (response.ok) {
                    console.log('Status do contrato atualizado no banco de dados');
                } else {
                    console.error('Erro ao atualizar status no banco de dados');
                }
            } catch (error) {
                console.error('Erro ao comunicar com o banco de dados:', error);
            }
            
            // Atualiza o estado local para refletir a mudança imediatamente
            const dadosAuditoriaLocal = {
                ip_simulado: '192.168.1.1 (simulado)',
                user_agent: navigator.userAgent,
                data_assinatura_cliente: new Date().toISOString(),
                nome_confirmado: nomeAssinante,
                cpf_confirmado: cpfAssinante,
            };

            setSignatario(prev => prev ? {...prev, status_assinatura: 'assinado', data_assinatura: new Date().toISOString(), dadosAuditoria: dadosAuditoriaLocal} : null);
            setContrato(prev => prev ? {...prev, 
                status_geral: todosAssinaram ? 'assinado' : 'parcialmente_assinado', 
                data_ultima_assinatura: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                signatarios: prev.signatarios.map(s => s.email === signatario.email ? {...s, status_assinatura: 'assinado', data_assinatura: new Date().toISOString(), dadosAuditoria: dadosAuditoriaLocal} : s)
            } : null);


            alert(`Contrato assinado com sucesso por ${nomeAssinante}!`);
            // Idealmente, redirecionar para uma página de sucesso ou apenas mostrar a mensagem.
            // navigate('/assinatura-sucesso'); 
        } catch (e) {
            console.error("Erro ao salvar assinatura:", e);
            setError("Ocorreu um erro ao salvar sua assinatura. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Carregando dados do contrato...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
                 <img src={mockAgencia.logo_url || "/assets/logo-placeholder.png"} alt="Logo Agência" className="h-20 mb-6"/>
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro na Assinatura</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                {contrato && (
                    <Button onClick={() => navigate('/')} className="mt-6">Voltar para o Início</Button>
                )}
            </div>
        );
    }

    if (!contrato || !signatario) {
        // Este caso deve ser coberto pelo 'error' mas é um fallback.
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Contrato ou signatário não encontrado após o carregamento.</div>;
    }
    
    const jaAssinado = signatario.status_assinatura === 'assinado';

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-8">
             <img src={contrato.dados_snapshot?.agencia?.logo_url || mockAgencia.logo_url || "/assets/logo-placeholder.png"} alt="Logo da Agência" className="h-16 md:h-20 mb-6"/>
            <Card className="w-full max-w-4xl shadow-2xl">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-xl md:text-2xl text-center text-primary flex items-center justify-center">
                        <FileText className="mr-3 h-7 w-7" />
                        Revisão e Assinatura de Contrato
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                        Documento gerado por: {contrato.dados_snapshot?.agencia?.nome_fantasia || contrato.dados_snapshot?.agencia?.razao_social || agenciaNome}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                        Referente a: {contrato.template_nome} para {contrato.entidade_nome}
                    </p>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-6">
                    <div 
                        className="border rounded-md p-4 md:p-6 max-h-[50vh] overflow-y-auto bg-white text-black prose prose-sm md:prose-base"
                        dangerouslySetInnerHTML={{ __html: conteudoHtml }}
                    />

                    {!jaAssinado && (
                        <div className="p-4 border-t border-gray-200">
                             <h3 className="text-lg font-semibold mb-3 text-gray-700">Confirmar Assinatura</h3>
                            <div className="mb-4">
                                <label htmlFor="nomeAssinante" className="block text-sm font-medium text-gray-700 mb-1">Seu nome completo (como no documento):</label>
                                <input 
                                    type="text"
                                    id="nomeAssinante"
                                    value={nomeAssinante}
                                    onChange={(e) => setNomeAssinante(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="cpfAssinante" className="block text-sm font-medium text-gray-700 mb-1">Seu CPF:</label>
                                <input 
                                    type="text"
                                    id="cpfAssinante"
                                    value={cpfAssinante}
                                    onChange={(e) => setCpfAssinante(e.target.value)}
                                    placeholder="000.000.000-00"
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex items-start mb-4">
                                <input 
                                    id="aceiteTermos"
                                    type="checkbox"
                                    checked={aceiteTermos}
                                    onChange={(e) => setAceiteTermos(e.target.checked)}
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="aceiteTermos" className="ml-2 block text-sm text-gray-800">
                                    Declaro que li e concordo com todos os termos e condições apresentados neste documento. Minha assinatura eletrônica tem a mesma validade legal de uma assinatura física.
                                </label>
                            </div>
                        </div>
                    )}
                     {jaAssinado && (
                         <Alert variant="default" className="bg-green-50 border-green-300">
                            <CheckSquare className="h-5 w-5 text-green-600" />
                            <AlertTitle className="text-green-700">Documento Assinado</AlertTitle>
                            <AlertDescription className="text-green-600">
                                Este documento foi assinado por você em {new Date(signatario.data_assinatura || '').toLocaleString('pt-BR')}.
                                Nenhuma ação adicional é necessária de sua parte.
                            </AlertDescription>
                        </Alert>
                    )}

                </CardContent>
                {!jaAssinado && (
                    <CardFooter className="bg-gray-50 border-t p-4 md:p-6 flex flex-col items-center">
                        <Button 
                            onClick={handleAssinar} 
                            disabled={!aceiteTermos || !nomeAssinante.trim() || !cpfAssinante.trim() || isSubmitting}
                            className="w-full max-w-xs text-base py-3"
                            size="lg"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                            ) : (
                                <CheckSquare className="mr-2 h-5 w-5" />
                            )}
                            {isSubmitting ? 'Processando...' : `Assinar como ${signatario?.nome || ''}`}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3 text-center">
                            Ao clicar em "Assinar", você confirma sua identidade e concordância com os termos. <br/>
                            IP: (simulado) 192.168.1.1 | Data/Hora: {new Date().toLocaleString('pt-BR')} <br/>
                            Navegador: {navigator.userAgent.substring(0, 70) + "..."}
                        </p>
                    </CardFooter>
                )}
            </Card>
            <p className="text-xs text-muted-foreground mt-6 text-center">
                Problemas ou dúvidas? Contate o suporte de {contrato.dados_snapshot?.agencia?.nome_fantasia || contrato.dados_snapshot?.agencia?.razao_social || agenciaNome}.
            </p>
        </div>
    );
} 