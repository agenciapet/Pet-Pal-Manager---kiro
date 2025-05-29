import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { mockServicos, mockClientes } from '../../data/mockData';

export default function DetalhesServico() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const servico = mockServicos.find(s => s.id === id);

  if (!servico) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Serviço não encontrado</h2>
        <Button className="mt-4" onClick={() => navigate('/servicos')}>
          Voltar para Serviços
        </Button>
      </div>
    );
  }

  // Buscar clientes que contrataram este serviço
  const clientesComServico = mockClientes.filter(cliente => 
    cliente.servicos_contratados.some(sc => sc.servico_id === id && sc.is_active)
  );

  const totalClientes = clientesComServico.length;
  const receitaMensal = clientesComServico.reduce((total, cliente) => {
    const servico = cliente.servicos_contratados.find(sc => sc.servico_id === id && sc.is_active);
    return total + (servico ? servico.valor : 0);
  }, 0);

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      console.log('Excluindo serviço:', id);
      navigate('/servicos');
    }
  };

  const getPeriodicidadeLabel = (periodicidade: string) => {
    const labels: { [key: string]: string } = {
      'mensal': 'Mensal',
      'trimestral': 'Trimestral',
      'semestral': 'Semestral',
      'anual': 'Anual'
    };
    return labels[periodicidade] || periodicidade;
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/servicos')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">{servico.nome}</h1>
          {servico.is_active && (
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          )}
          {!servico.is_active && (
            <Badge variant="secondary">Inativo</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/servicos/editar/${id}`)}
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
        {/* Informações do Serviço */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Descrição</p>
              <p className="mt-1">{servico.descricao}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium text-xl flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  {servico.valor.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Periodicidade</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  {getPeriodicidadeLabel(servico.periodicidade)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="font-medium">
                {new Date(servico.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                {totalClientes}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Mensal</p>
              <p className="text-2xl font-bold">
                {receitaMensal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Clientes que Contrataram */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Clientes que Contrataram este Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            {clientesComServico.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-left p-2">CNPJ</th>
                      <th className="text-left p-2">Valor Contratado</th>
                      <th className="text-left p-2">Data de Início</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {clientesComServico.map((cliente) => {
                      const servicoContratado = cliente.servicos_contratados.find(
                        sc => sc.servico_id === id && sc.is_active
                      );
                      return (
                        <tr key={cliente.id} className="hover:bg-muted/50">
                          <td className="p-2 font-medium">{cliente.razao_social}</td>
                          <td className="p-2">{cliente.cnpj}</td>
                          <td className="p-2">
                            {servicoContratado?.valor.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </td>
                          <td className="p-2">
                            {servicoContratado && new Date(servicoContratado.data_inicio).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-2">
                            <div className="flex justify-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/clientes/${cliente.id}`)}
                              >
                                Ver Cliente
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum cliente contratou este serviço ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 