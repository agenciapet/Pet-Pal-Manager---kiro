import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { Button } from './components/ui/button';
import { jwtDecode } from 'jwt-decode';
import { authService } from './services/authService';

// Componentes
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/Login/Login';

// Páginas
import Dashboard from './pages/Dashboard/Dashboard';
import Colaboradores from './pages/Colaboradores/Colaboradores';
import FormColaborador from './pages/Colaboradores/FormColaborador';
import DetalhesColaborador from './pages/Colaboradores/DetalhesColaborador';
import Clientes from './pages/Clientes/Clientes';
import FormCliente from './pages/Clientes/FormCliente';
import DetalhesCliente from './pages/Clientes/DetalhesCliente';
import Servicos from './pages/Servicos/Servicos';
import FormServico from './pages/Servicos/FormServico';
import DetalhesServico from './pages/Servicos/DetalhesServico';
import Usuarios from './pages/Usuarios/Usuarios';
import FormUsuario from './pages/Usuarios/FormUsuario';
import Agencia from './pages/Agencia/Agencia';
import EditarAgencia from './pages/Agencia/EditarAgencia';
import Reembolsos from './pages/Reembolsos/Reembolsos';
import TemplatesContrato from './pages/Contratos/TemplatesContrato';
import FormTemplateContrato from './pages/Contratos/FormTemplateContrato';
import SelecionarEntidadeContrato from './pages/Contratos/SelecionarEntidadeContrato';
import PreencherContrato from './pages/Contratos/PreencherContrato';
import ContratosGerados from './pages/Contratos/ContratosGerados';
import DetalhesContratoGerado from './pages/Contratos/DetalhesContratoGerado';
import PaginaAssinatura from './pages/Contratos/PaginaAssinatura';

const queryClient = new QueryClient();

// Simulação de página Não Autorizado (pode ser movida para um arquivo próprio)
const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <h1 className="text-4xl font-bold text-red-600 mb-4">Acesso Negado</h1>
    <p className="text-lg text-gray-700 mb-8">Você não tem permissão para acessar esta página.</p>
    <Button onClick={() => window.history.back()} variant="outline">
      Voltar
    </Button>
  </div>
);

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: { exp: number } = jwtDecode(token);
        const currentTime = Date.now() / 1000; // em segundos

        if (decodedToken.exp < currentTime) {
          console.log('Sessão expirada, fazendo logout...');
          alert('Sua sessão expirou. Você será redirecionado para a página de login.');
          authService.logout();
        }
      } catch (error) {
        console.error('Erro ao decodificar token ou token inválido:', error);
        // Token inválido (não pode ser decodificado), tratar como expirado
        alert('Token inválido. Você será redirecionado para a página de login.');
        authService.logout();
      }
    }
  }, []); // Roda apenas uma vez na montagem do App

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route 
              path="/login" 
              element={
              <PublicRoute>
                <Login />
              </PublicRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/assinar/:tokenSignatario" element={<PaginaAssinatura />} />
            
            {/* Rotas Protegidas com Layout */}
            <Route 
              path="/" 
              element={ 
              <ProtectedRoute>
                <Layout>
                    <Outlet />
                </Layout>
              </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
            
              <Route path="colaboradores" element={<Colaboradores />} />
              <Route path="colaboradores/novo" element={<FormColaborador />} />
              <Route path="colaboradores/:id" element={<DetalhesColaborador />} />
              <Route path="colaboradores/editar/:id" element={<FormColaborador />} />

              <Route path="clientes" element={<Clientes />} />
              <Route path="clientes/novo" element={<FormCliente />} />
              <Route path="clientes/:id" element={<DetalhesCliente />} />
              <Route path="clientes/editar/:id" element={<FormCliente />} />

              <Route path="servicos" element={<Servicos />} />
              <Route path="servicos/novo" element={<FormServico />} />
              <Route path="servicos/:id" element={<DetalhesServico />} />
              <Route path="servicos/editar/:id" element={<FormServico />} />
              
              <Route path="reembolsos" element={<Reembolsos />} />
              
              {/* Rotas de Admin */}
              <Route path="usuarios" element={<ProtectedRoute requiredRole="admin"><Usuarios /></ProtectedRoute>} />
              <Route path="usuarios/novo" element={<ProtectedRoute requiredRole="admin"><FormUsuario /></ProtectedRoute>} />
              <Route path="usuarios/editar/:id" element={<ProtectedRoute requiredRole="admin"><FormUsuario /></ProtectedRoute>} />
              
              <Route path="agencia" element={<ProtectedRoute requiredRole="admin"><Agencia /></ProtectedRoute>} />
              <Route path="agencia/editar" element={<ProtectedRoute requiredRole="admin"><EditarAgencia /></ProtectedRoute>} />

              {/* Rotas para Templates de Contrato (Admin) */}
              <Route 
                path="contratos/templates" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TemplatesContrato />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="contratos/templates/novo" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FormTemplateContrato />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="contratos/templates/editar/:id" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FormTemplateContrato />
              </ProtectedRoute>
                } 
              />
              <Route 
                path="contratos/gerar/selecionar-entidade" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SelecionarEntidadeContrato />
              </ProtectedRoute>
                } 
              />
              <Route 
                path="contratos/gerar/preencher" 
                element={
              <ProtectedRoute requiredRole="admin">
                    <PreencherContrato />
              </ProtectedRoute>
                } 
              />
              <Route 
                path="contratos/gerados" 
                element={
              <ProtectedRoute requiredRole="admin">
                    <ContratosGerados />
              </ProtectedRoute>
                } 
              />
              <Route 
                path="contratos/gerados/:id" 
                element={
              <ProtectedRoute requiredRole="admin">
                    <DetalhesContratoGerado />
              </ProtectedRoute>
                } 
              />
            
              {/* Catch-all para rotas não encontradas DENTRO do layout autenticado */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} /> 
            </Route>
            
            {/* Adicionar uma rota catch-all fora do ProtectedRoute para não autenticados */}
            {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
