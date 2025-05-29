import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import mockData from '../../data/mockData';
import { 
  Users, 
  Building2, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Calendar,
  Clock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = mockData.mockDashboardStats;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    trend?: string;
  }> = ({ title, value, description, icon, trend }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Colaboradores"
          value={stats.totalColaboradores}
          description="Colaboradores ativos no sistema"
          icon={<Users className="h-4 w-4" />}
          trend="+2 este mês"
        />
        
        <StatCard
          title="Total de Clientes"
          value={stats.totalClientes}
          description="Empresas cadastradas"
          icon={<Building2 className="h-4 w-4" />}
          trend="+1 esta semana"
        />
        
        <StatCard
          title="Reembolsos Pendentes"
          value={stats.reembolsosPendentes}
          description="Aguardando aprovação"
          icon={<Receipt className="h-4 w-4" />}
        />
        
        <StatCard
          title="Faturamento Mensal"
          value={formatCurrency(stats.faturamentoMensal)}
          description="Receita recorrente mensal"
          icon={<DollarSign className="h-4 w-4" />}
          trend="+12% vs mês anterior"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.atividadesRecentes.map((atividade) => (
                <div
                  key={atividade.id}
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {atividade.acao}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(atividade.timestamp)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      por {atividade.usuario_email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>
              Visão geral das finanças
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Receita Mensal</span>
                <span className="font-medium">{formatCurrency(stats.faturamentoMensal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reembolsos Pendentes</span>
                <span className="font-medium text-orange-600">
                  {stats.reembolsosPendentes} itens
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa de Crescimento</span>
                <span className="font-medium text-green-600">+12%</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Próximos Vencimentos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet Care Ltda</span>
                  <span>15/02/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Animal Life S.A.</span>
                  <span>20/02/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mundo Animal ME</span>
                  <span>25/02/2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 