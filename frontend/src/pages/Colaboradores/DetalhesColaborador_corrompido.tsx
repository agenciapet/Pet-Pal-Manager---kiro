import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { mockColaboradores, type Colaborador } from '../../data/mockData';

export default function DetalhesColaboradorNovo() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const colaborador = mockColaboradores.find(c => c.id === id);

  // Função para calcular idade
  const calcularIdade = (dataNascimento: string) => {
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

  if (!colaborador) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Colaborador não encontrado</h2>
        <Button className="mt-4" onClick={() => navigate('/colaboradores')}>
          Voltar para Colaboradores
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/colaboradores')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">{colaborador.nome_completo}</h1>
          {colaborador.is_active && (
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          )}
          {!colaborador.is_active && (
            <Badge variant="secondary">Inativo</Badge>
          )}
          {colaborador.is_veterinario && colaborador.crmv_status && (
            <Badge className="bg-purple-100 text-purple-800">
              CRMV Verificado
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/colaboradores/editar/${id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir este colaborador?')) {
                console.log('Excluindo colaborador:', id);
                navigate('/colaboradores');
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{colaborador.nome_completo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{colaborador.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">
                  {colaborador.data_nascimento ? 
                    `${new Date(colaborador.data_nascimento).toLocaleDateString('pt-BR')} (${calcularIdade(colaborador.data_nascimento)} anos)` 
                    : 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {colaborador.email}
                </p>
              </div>
              {/* Múltiplos Telefones */}
              <div className="col-span-2 pt-2">
                <p className="text-sm text-muted-foreground mb-1">Telefones</p>
                {colaborador.telefones && colaborador.telefones.length > 0 ? (
                  colaborador.telefones.map((tel, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{tel.numero}</span>
                      {tel.tipo && (
                        <Badge variant="outline" className="text-xs font-medium">
                          {tel.tipo.charAt(0).toUpperCase() + tel.tipo.slice(1)}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="font-medium text-muted-foreground">Não informado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Cargo</p>
              <p className="font-medium">{colaborador.cargo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salário</p>
              <p className="font-medium">
                {colaborador.salario.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Admissão</p>
              <p className="font-medium">
                {new Date(colaborador.data_contratacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
            {colaborador.is_veterinario && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">CRMV</p>
                  <p className="font-medium">{colaborador.crmv}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">
                {colaborador.endereco.logradouro}, {colaborador.endereco.numero}
              </p>
              <p className="text-muted-foreground">
                {colaborador.endereco.bairro} - {colaborador.endereco.cidade}/{colaborador.endereco.estado}
              </p>
              <p className="text-muted-foreground">
                CEP: {colaborador.endereco.cep}
              </p>
              <p className="text-sm text-muted-foreground">
                País: <span className="font-medium text-foreground">{colaborador.endereco.pais || 'Brasil'}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dados Bancários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Dados Bancários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
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
                <p className="font-medium">{colaborador.dados_bancarios.conta}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Conta</p>
                <p className="font-medium capitalize">{colaborador.dados_bancarios.tipo_conta}</p>
              </div>
              {colaborador.dados_bancarios.chave_pix && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Chave PIX</p>
                    <p className="font-medium">{colaborador.dados_bancarios.chave_pix}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Chave PIX</p>
                    <p className="font-medium capitalize">{colaborador.dados_bancarios.tipo_chave_pix}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Colaborador criado</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(colaborador.data_contratacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Badge variant="outline">Sistema</Badge>
            </div>
            {colaborador.is_veterinario && colaborador.crmv_status && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">CRMV verificado</p>
                  <p className="text-sm text-muted-foreground">
                    Registro profissional validado
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Verificado</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 