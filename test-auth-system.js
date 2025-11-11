const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAuthSystem() {
  console.log('🧪 Testando Sistema de Autenticação PPM\n');

  try {
    // 1. Testar login com credenciais corretas
    console.log('1. Testando login com credenciais corretas...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@petpalmanager.com',
      password: 'admin123'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('   Token:', loginResponse.data.token.substring(0, 50) + '...');
    console.log('   Usuário:', loginResponse.data.user);
    
    const token = loginResponse.data.token;

    // 2. Testar acesso a rota protegida
    console.log('\n2. Testando acesso a rota protegida...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Acesso à rota protegida bem-sucedido!');
    console.log('   Perfil:', profileResponse.data.user);

    // 3. Testar acesso a API de colaboradores
    console.log('\n3. Testando acesso à API de colaboradores...');
    const employeesResponse = await axios.get(`${API_BASE_URL}/employees`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Acesso à API de colaboradores bem-sucedido!');
    console.log('   Colaboradores encontrados:', employeesResponse.data.employees?.length || 0);

    // 4. Testar login com credenciais incorretas
    console.log('\n4. Testando login com credenciais incorretas...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@petpalmanager.com',
        password: 'senhaerrada'
      });
      console.log('❌ Erro: Login deveria ter falhou!');
    } catch (error) {
      console.log('✅ Login falhou corretamente:', error.response.data.message);
    }

    // 5. Testar acesso sem token
    console.log('\n5. Testando acesso sem token...');
    try {
      await axios.get(`${API_BASE_URL}/employees`);
      console.log('❌ Erro: Acesso deveria ter sido negado!');
    } catch (error) {
      console.log('✅ Acesso negado corretamente:', error.response.data.message);
    }

    // 6. Testar registro de novo usuário
    console.log('\n6. Testando registro de novo usuário...');
    const randomEmail = `teste${Date.now()}@petpalmanager.com`;
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: randomEmail,
        password: 'teste123',
        role: 'colaborador'
      });
      
      console.log('✅ Registro bem-sucedido!');
      console.log('   Novo usuário:', registerResponse.data.user);
    } catch (error) {
      console.log('❌ Erro no registro:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Todos os testes de autenticação concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.response?.data || error.message);
  }
}

testAuthSystem();