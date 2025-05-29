const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Simular o comportamento do frontend
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simular o interceptor do frontend
api.interceptors.request.use(
  (config) => {
    // Simular localStorage
    const token = 'fake_token_from_localStorage';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token adicionado ao header:', config.headers.Authorization);
    } else {
      console.log('⚠️  Nenhum token encontrado no localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function debugAuth() {
  console.log('🔍 Debugando autenticação do frontend...\n');

  try {
    // Passo 1: Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@petpalmanager.com',
      password: 'admin123'
    });
    
    const { token, user } = loginResponse.data;
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', user.email, '- Papel:', user.role);
    console.log('🎫 Token gerado:', token.substring(0, 50) + '...');

    // Passo 2: Simular armazenamento no localStorage
    console.log('\n2️⃣ Simulando armazenamento no localStorage...');
    const simulatedLocalStorage = {
      token: token,
      user: JSON.stringify(user)
    };
    console.log('💾 Token armazenado:', !!simulatedLocalStorage.token);

    // Passo 3: Fazer requisição com token
    console.log('\n3️⃣ Testando requisição com token...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const employeesResponse = await axios.get(`${API_BASE_URL}/employees`, { headers });
    console.log('✅ Requisição de colaboradores bem-sucedida!');
    console.log('📊 Colaboradores encontrados:', employeesResponse.data.employees?.length || 0);

    // Passo 4: Testar endpoint de inativação (se houver colaboradores)
    if (employeesResponse.data.employees?.length > 0) {
      const firstEmployee = employeesResponse.data.employees[0];
      console.log('\n4️⃣ Testando endpoint de inativação...');
      console.log('👤 Colaborador de teste:', firstEmployee.full_name, '- Ativo:', firstEmployee.is_active);
      
      if (firstEmployee.is_active) {
        try {
          const inactivateResponse = await axios.delete(`${API_BASE_URL}/employees/${firstEmployee.id}`, { headers });
          console.log('✅ Inativação bem-sucedida:', inactivateResponse.data.message);
          
          // Reativar para deixar como estava
          const reactivateResponse = await axios.patch(`${API_BASE_URL}/employees/${firstEmployee.id}/reactivate`, {}, { headers });
          console.log('✅ Reativação bem-sucedida:', reactivateResponse.data.message);
        } catch (error) {
          console.error('❌ Erro nos endpoints:', error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n🎉 Todos os testes de autenticação passaram!');
    console.log('\n🔧 Possíveis problemas no frontend:');
    console.log('1. Token não está sendo salvo no localStorage após login');
    console.log('2. Interceptor do axios não está funcionando corretamente');
    console.log('3. Usuário não fez login antes de tentar usar as funcionalidades');
    console.log('4. Token expirou (validade: 24 horas)');

  } catch (error) {
    console.error('❌ Erro no debug:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Problema de autenticação detectado:');
      console.log('- Verifique se o usuário fez login');
      console.log('- Verifique se o token está sendo enviado corretamente');
      console.log('- Verifique se o token não expirou');
    }
  }
}

debugAuth().catch(console.error); 