import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

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
        alert('Sua sessão expirou ou o token é inválido. Você será redirecionado para o login.');
        // Chamar a função de logout para limpar o localStorage e redirecionar
        authService.logout(); // Certifique-se que authService está acessível aqui ou mova a lógica de logout para cá
        return Promise.reject(error); // Rejeitar para evitar processamento adicional
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, role?: string): Promise<LoginResponse> {
    const response = await api.post('/auth/register', { email, password, role });
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
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
  }
};

export { api }; 