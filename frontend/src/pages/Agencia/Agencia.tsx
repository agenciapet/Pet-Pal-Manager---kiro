import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockAgencia } from '../../data/mockData';
import {
  Building,
  MapPin,
  Phone,
  Calendar,
  Users,
  Edit,
  Stethoscope,
  CheckCircle,
  Mail,
  FileText,
  Image as ImageIcon,
  Globe as FaviconIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Agencia as AgenciaType } from '../../data/mockData';

const Agencia: React.FC = () => {
  const [agencia, setAgencia] = React.useState<AgenciaType>(mockAgencia);
  const navigate = useNavigate();

  React.useEffect(() => {
    try {
      const agenciaSalva = localStorage.getItem('agenciaPPM');
      if (agenciaSalva) {
        setAgencia(JSON.parse(agenciaSalva));
      }
    } catch (error) {
      console.error("Erro ao carregar dados da agência do localStorage:", error);
      // Mantém mockAgencia como fallback
    }
  }, []);

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calcularIdade = (dataNascimento?: string) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const veterinarios = agencia.socios.filter(s => s.is_veterinario).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agência</h2>
          <p className="text-muted-foreground">
            Informações da agência e seus sócios
          </p>
        </div>
        <Button onClick={() => navigate('/agencia/editar')} className="gap-2">
          <Edit className="h-4 w-4" />
          Editar Informações
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sócios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencia.socios.length}</div>
            <p className="text-xs text-muted-foreground">
              Sócios cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veterinários</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{veterinarios}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((veterinarios / agencia.socios.length) * 100)}% dos sócios
            </p>
          </CardContent>
        </Card>

            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fundação</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">
              {new Date().getFullYear() - new Date(agencia.data_fundacao).getFullYear()}
            </div>
            <p className="text-xs text-muted-foreground">
              anos de atividade
            </p>
              </CardContent>
            </Card>

            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telefones</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">{agencia.telefones.length}</div>
            <p className="text-xs text-muted-foreground">
              linhas ativas
            </p>
              </CardContent>
            </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informações da Agência */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Dados da Agência
                </CardTitle>
                <CardDescription>
                  Informações gerais da empresa
                </CardDescription>
              </div>
              {agencia.logo_url && (
                <img 
                  src={agencia.logo_url} 
                  alt="Logo da Agência" 
                  className="h-16 w-auto object-contain rounded-md border p-1 bg-white"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nome Fantasia</span>
                <span className="font-medium text-lg text-primary">{agencia.nome_fantasia}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Razão Social</span>
                <span className="font-medium">{agencia.razao_social}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CNPJ</span>
                <span className="font-mono text-sm">{formatCNPJ(agencia.cnpj)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data de Fundação</span>
                <span className="text-sm">{formatDate(agencia.data_fundacao)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{agencia.endereco.logradouro}, {agencia.endereco.numero}</p>
                <p>{agencia.endereco.bairro}</p>
                <p>{agencia.endereco.cidade}, {agencia.endereco.estado}</p>
                <p>CEP: {agencia.endereco.cep}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefones
              </h4>
              <div className="space-y-1">
                {agencia.telefones.map((telefone, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-center justify-between">
                    <span>{telefone.numero}</span>
                    {telefone.tipo && <Badge variant="outline" className="text-xs">{telefone.tipo}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sócios */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sócios da Agência
            </CardTitle>
            <CardDescription>
              {agencia.socios.length} sócio(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agencia.socios.map((socio) => (
                <div
                  key={socio.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {socio.is_veterinario ? (
                      <Stethoscope className="h-6 w-6 text-primary" />
                    ) : (
                      <Users className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-medium">{socio.nome_completo}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {socio.is_veterinario && (
                          <Badge variant="secondary" className="text-xs">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            CRMV {socio.crmv}
                          </Badge>
                        )}
                        {socio.crmv_status && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <FileText className="h-3 w-3 mr-2" />
                        CPF: {formatCPF(socio.cpf)}
                      </div>
                      {socio.data_nascimento && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2" />
                          Nasc: {formatDate(socio.data_nascimento)} ({calcularIdade(socio.data_nascimento)} anos)
                        </div>
                      )}
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        {socio.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        {socio.telefone}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentos e Contratos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos e Contratos
          </CardTitle>
          <CardDescription>
            Documentos importantes da agência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Contrato Social</h4>
                <Badge variant="default">Ativo</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Documento de constituição da empresa
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Visualizar
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
          </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Alvará de Funcionamento</h4>
                <Badge variant="default">Ativo</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Licença para funcionamento da agência
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Visualizar
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Certificado Digital</h4>
                <Badge variant="secondary">Renovar em 30 dias</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Certificado para assinatura digital
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Renovar
                    </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
          </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agencia; 