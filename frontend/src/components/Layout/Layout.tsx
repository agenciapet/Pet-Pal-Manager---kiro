import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../services/authService';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Building,
  UserCog,
  LogOut,
  Menu,
  Sun,
  Moon,
  ChevronLeft,
  User,
  Receipt,
  FileText,
  ListChecks
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import mockData, { type Agencia } from '../../data/mockData';

const menuItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'financeiro', 'colaborador', 'cliente'] },
  { text: 'Colaboradores', icon: Users, path: '/colaboradores', roles: ['admin', 'financeiro'] },
  { text: 'Clientes', icon: Building2, path: '/clientes', roles: ['admin', 'financeiro'] },
  { text: 'Serviços', icon: Settings, path: '/servicos', roles: ['admin'] },
  { text: 'Reembolsos', icon: Receipt, path: '/reembolsos', roles: ['admin', 'financeiro', 'colaborador'] },
  { text: 'Templates de Contrato', icon: FileText, path: '/contratos/templates', roles: ['admin'] },
  { text: 'Contratos Gerados', icon: ListChecks, path: '/contratos/gerados', roles: ['admin'] },
  { text: 'Agência', icon: Building, path: '/agencia', roles: ['admin'] },
  { text: 'Usuários', icon: UserCog, path: '/usuarios', roles: ['admin'] },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const currentUser = authService.getCurrentUser();

  React.useEffect(() => {
    let agenciaData: Agencia = mockData.mockAgencia;
    try {
      const agenciaSalva = localStorage.getItem('agenciaPPM');
      if (agenciaSalva) {
        agenciaData = JSON.parse(agenciaSalva);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da agência do localStorage para o favicon:", error);
      // Mantém mockAgencia como fallback
    }

    const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
    if (favicon && agenciaData.favicon_url) {
      favicon.href = agenciaData.favicon_url;
    }
    // Opcional: Atualizar o título da página com o nome fantasia
    if (agenciaData.nome_fantasia) {
        document.title = `${agenciaData.nome_fantasia} - PPM`;
    } else {
        document.title = 'PetPal Manager';
    }

  }, [location]); // Re-executar no carregamento inicial e talvez em mudança de rota se necessário

  const handleLogout = () => {
    authService.logout();
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      admin: 'Administrador',
      financeiro: 'Financeiro',
      colaborador: 'Colaborador',
      cliente: 'Cliente',
    };
    return roleLabels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      financeiro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      colaborador: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cliente: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  // Filtrar itens do menu baseado na role do usuário
  const filteredMenuItems = menuItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  const Sidebar = ({ className }: { className?: string }) => (
    <div className={cn("flex h-full flex-col bg-card border-r", className)}>
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">PPM</span>
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">PetPal Manager</span>
              <span className="text-xs text-muted-foreground">Sistema de Gestão</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto hidden lg:flex"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
        </Button>
      </div>

      {/* User Info */}
      {currentUser && sidebarOpen && (
        <div className="border-b p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentUser.email}
              </p>
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1",
                getRoleBadgeColor(currentUser.role)
              )}>
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.text}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !sidebarOpen && "px-2",
                isActive && "bg-secondary"
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">{item.text}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Theme Toggle & Logout */}
      <div className="border-t p-2 space-y-2">
        {sidebarOpen && (
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <span className="text-sm">Tema</span>
              <Moon className="h-4 w-4" />
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        )}
        
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950", !sidebarOpen && "px-2")}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {sidebarOpen && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 z-50">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="font-semibold">PPM</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
          {currentUser && (
            <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 text-red-600" />
          </Button>
          )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children} {/* Aqui é onde o <Outlet/> é renderizado, pois Layout envolve Outlet em App.tsx */}
        </main>
      </div>
    </div>
  );
};

export default Layout; 