import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Users, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import mockData from '../../data/mockData';

export default function DetalhesCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const cliente = mockData.mockClientes.find(c => c.id === id);

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Cliente não encontrado</h2>
        <Button className="mt-4" onClick={() => navigate('/clientes')}>
          Voltar para Clientes
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      console.log('Excluindo cliente:', id);
      navigate('/clientes');
    }
  };

  const getPorteColor = (porte: string) => {
    switch (porte) {
      case 'Pequena': return 'bg-blue-100 text-blue-800';
      case 'Média': return 'bg-green-100 text-green-800';
      case 'Grande': return 'bg-yellow-100 text-yellow-800';
      case 'Multinacional': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cliente.nome_fantasia}</h1>
            <p className="text-sm text-muted-foreground">{cliente.razao_social}</p>
          </div>
          <Badge className={getPorteColor(cliente.porte)}>
            {cliente.porte}
          </Badge>
          <Badge 
            variant={
              cliente.status === 'ativo' ? 'default' :
              cliente.status === 'inadimplente' ? 'destructive' :
              cliente.status === 'contrato_cancelado' ? 'destructive' :
              cliente.status === 'inativo' ? 'secondary' :
              cliente.status === 'em_negociacao' ? 'outline' :
              cliente.status === 'prospect' ? 'outline' :
              'secondary'
            }
            className="capitalize"
          >
            {cliente.status.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/clientes/editar/${id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Empresa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Razão Social</p>
                <p className="font-medium">{cliente.razao_social}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nome Fantasia</p>
                <p className="font-medium">{cliente.nome_fantasia}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-medium">{cliente.cnpj}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo da Empresa</p>
                <p className="font-medium">{cliente.tipo_empresa}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {cliente.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone (Principal)</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {cliente.telefones && cliente.telefones.length > 0 
                    ? cliente.telefones[0].numero 
                    : 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente desde</p>
                <p className="font-medium">
                  {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {cliente.numero_registro_cfmv_crmv && (
                <div>
                  <p className="text-sm text-muted-foreground">Registro CFMV/CRMV</p>
                  <p className="font-medium">{cliente.numero_registro_cfmv_crmv}</p>
                </div>
              )}
              {cliente.data_abertura && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Abertura</p>
                  <p className="font-medium">
                    {new Date(cliente.data_abertura).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {cliente.capital_social && (
                <div>
                  <p className="text-sm text-muted-foreground">Capital Social</p>
                  <p className="font-medium">{cliente.capital_social}</p>
                </div>
              )}
              {cliente.faturamento_anual && (
                <div>
                  <p className="text-sm text-muted-foreground">Faturamento Anual</p>
                  <p className="font-medium">{cliente.faturamento_anual}</p>
                </div>
              )}
              {cliente.situacao && (
                <div>
                  <p className="text-sm text-muted-foreground">Situação</p>
                  <p className="font-medium capitalize">{cliente.situacao}</p>
                </div>
              )}
              {cliente.optante_simples_nacional !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Simples Nacional</p>
                  <p className="font-medium">
                    {cliente.optante_simples_nacional ? 'Optante' : 'Não Optante'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unidades */}
        {cliente.unidades.map((unidade, index) => (
          <Card key={unidade.id} className={`lg:col-span-${cliente.unidades.length === 1 ? 3 : 2} border-l-4 border-blue-500`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {unidade.nome_unidade} (Unidade {index + 1})
                </div>
                {index === 0 && <Badge variant="secondary">Matriz</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">
                  {unidade.endereco.logradouro}, {unidade.endereco.numero}
                </p>
                <p className="text-muted-foreground">
                  {unidade.endereco.bairro} - {unidade.endereco.cidade}/{unidade.endereco.estado} | CEP: {unidade.endereco.cep}
                </p>
                <p className="text-sm text-muted-foreground">
                  País: <span className="font-medium text-foreground">{unidade.endereco.pais || 'Brasil'}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone da Unidade</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {unidade.telefones && unidade.telefones.length > 0 
                    ? unidade.telefones[0].numero 
                    : 'Não informado'}
                </p>
              </div>
              
              {unidade.representantes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 pt-2 border-t">Representantes da Unidade:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unidade.representantes.map((representante) => (
                      <div key={representante.id} className="border rounded-lg p-3 space-y-1 bg-muted/30">
                        <h5 className="font-medium">{representante.nome_completo}</h5>
                        <p className="text-xs text-muted-foreground">{representante.cargo}</p>
                        {representante.data_nascimento && (
                          <p className="text-xs text-muted-foreground">
                            Nascimento: {new Date(representante.data_nascimento).toLocaleDateString('pt-BR')} 
                            ({calcularIdade(representante.data_nascimento)} anos)
                          </p>
                        )}
                        <p className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" />{representante.email}</p>
                        <p className="text-xs flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {representante.telefones && representante.telefones.length > 0 
                            ? representante.telefones[0].numero 
                            : 'Não informado'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {representante.is_socio && (
                            <Badge className="text-xs bg-green-100 text-green-800">Sócio</Badge>
                          )}
                          {representante.is_responsavel_tecnico && (
                            <Badge className="text-xs" variant="outline">Resp. Técnico</Badge>
                          )}
                          {representante.is_veterinario && (
                            <Badge className="text-xs bg-purple-100 text-purple-800">Veterinário</Badge>
                          )}
                          {representante.crmv && (
                            <Badge className="text-xs" variant="outline">CRMV: {representante.crmv}/{representante.crmv_uf}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Serviços Contratados */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Serviços Contratados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Serviço</th>
                    <th className="text-left p-2">Valor</th>
                    <th className="text-left p-2">Data de Início</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cliente.servicos_contratados.map((servico) => (
                    <tr key={servico.id} className="hover:bg-muted/50">
                      <td className="p-2">{servico.servico_nome}</td>
                      <td className="p-2">
                        {servico.valor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td className="p-2">
                        {new Date(servico.data_inicio).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={servico.is_active ? 'default' : 'secondary'}
                        >
                          {servico.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Mensal:</span>
                <span className="text-xl font-bold">
                  {cliente.servicos_contratados
                    .filter(s => s.is_active)
                    .reduce((total, s) => total + s.valor, 0)
                    .toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Interações */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Histórico de Alterações</CardTitle>
          </CardHeader>
          <CardContent>
            {cliente.historico_alteracoes && cliente.historico_alteracoes.length > 0 ? (
              <ul className="space-y-4">
                {cliente.historico_alteracoes.slice().reverse().map((item, index) => (
                  <li key={index} className="border-b pb-2 mb-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.data_alteracao).toLocaleString('pt-BR')} por: <span className="font-medium">{item.usuario_responsavel}</span>
                    </p>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                      {item.detalhes_alteracao.map((detalhe, i) => (
                        <li key={i} className="text-xs">{detalhe}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma alteração registrada ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 