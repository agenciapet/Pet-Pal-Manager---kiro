import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}



// Configurar axios com interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      // Tratar token expirado ou inválido (401 ou 403 com mensagem específica)
      if (status === 401 || (status === 403 && data?.message === 'Token inválido')) {
        // Limpar dados locais
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirecionar para login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, role?: string, name?: string): Promise<LoginResponse> {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  async getProfile(): Promise<{ user: any }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// Serviço para gerenciar colaboradores
export const employeeService = {
  async inactivateEmployee(id: string): Promise<{ message: string; employee: any }> {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  async reactivateEmployee(id: string): Promise<{ message: string; employee: any }> {
    const response = await api.patch(`/employees/${id}/reactivate`);
    return response.data;
  },

  async getAllEmployees(status: string = 'active'): Promise<{ employees: any[] }> {
    const response = await api.get('/employees', { params: { status } });
    return response.data;
  },

  async getEmployeeById(id: string): Promise<{ employee: any }> {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async getEmployeeHistory(id: string): Promise<{ history: any[] }> {
    const response = await api.get(`/employees/${id}/history`);
    return response.data;
  },

  async createEmployee(employeeData: any): Promise<{ message: string; employee: any }> {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  async updateEmployee(id: string, employeeData: any): Promise<{ message: string; employee: any }> {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Adicionando função para buscar códigos de país
  async getCountryCodes(): Promise<{ countries: Array<{ id: number; name: string; country_iso_code: string; dial_code: string; flag_emoji: string }> }> {
    const response = await api.get('/utils/country-codes');
    return response.data;
  },

  // Função para buscar estados brasileiros
  async getBrazilianStates(): Promise<{ states: Array<{ code: string; name: string }> }> {
    const response = await api.get('/utils/brazilian-states');
    return response.data;
  },

  // Função para buscar países
  async getCountries(): Promise<{ countries: Array<{ code: string; name: string; flag: string; default?: boolean }> }> {
    const response = await api.get('/utils/countries');
    return response.data;
  },

  // Função para buscar endereço por CEP
  async getAddressByCep(cep: string): Promise<{ address: { cep: string; street: string; neighborhood: string; city: string; state: string; country: string; country_code: string } }> {
    const response = await api.get(`/utils/address/${cep}`);
    return response.data;
  }
};

// Serviço para gerenciar clientes/empresas
export const clientService = {
  async getAllClients(status: string = 'active'): Promise<{ companies: any[] }> {
    const response = await api.get('/companies', { params: { status } });
    return response.data;
  },

  async getClientById(id: string): Promise<{ company: any }> {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  async createClient(clientData: any): Promise<{ message: string; company: any }> {
    const response = await api.post('/companies', clientData);
    return response.data;
  },

  async updateClient(id: string, clientData: any): Promise<{ message: string; company: any }> {
    const response = await api.put(`/companies/${id}`, clientData);
    return response.data;
  },

  async inactivateClient(id: string): Promise<{ message: string; company: any }> {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  }
};

// Serviço para gerenciar serviços
export const servicesService = {
  async getAllServices(status: string = 'active'): Promise<{ services: any[] }> {
    const response = await api.get('/services', { params: { status } });
    return response.data;
  },

  async getServiceById(id: string): Promise<{ service: any }> {
    const response = await api.get(`/services/${id}`);
    return response.data;
  }
};

export { api };