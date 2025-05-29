const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Configurações de teste
const testUser = {
  email: 'admin@petpalmanager.com',
  password: 'admin123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Fazendo login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✅ Login realizado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testEmployeeEndpoints() {
  try {
    // Configurar headers com token
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    console.log('\n📋 Listando colaboradores...');
    const employeesResponse = await axios.get(`${API_BASE_URL}/employees`, { headers });
    const employees = employeesResponse.data.employees;
    
    if (employees.length === 0) {
      console.log('⚠️  Nenhum colaborador encontrado no banco de dados.');
      console.log('💡 Adicione alguns colaboradores através da interface web primeiro.');
      return;
    }

    console.log(`✅ Encontrados ${employees.length} colaboradores`);
    
    // Pegar o primeiro colaborador ativo para teste
    const activeEmployee = employees.find(emp => emp.is_active);
    if (!activeEmployee) {
      console.log('⚠️  Nenhum colaborador ativo encontrado para teste.');
      return;
    }

    console.log(`\n🧪 Testando com colaborador: ${activeEmployee.full_name} (ID: ${activeEmployee.id})`);

    // Teste 1: Inativar colaborador
    console.log('\n🔄 Testando inativação...');
    try {
      const inactivateResponse = await axios.delete(`${API_BASE_URL}/employees/${activeEmployee.id}`, { headers });
      console.log('✅ Colaborador inativado:', inactivateResponse.data.message);
    } catch (error) {
      console.error('❌ Erro ao inativar:', error.response?.data?.message || error.message);
      return;
    }

    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 2: Reativar colaborador
    console.log('\n🔄 Testando reativação...');
    try {
      const reactivateResponse = await axios.patch(`${API_BASE_URL}/employees/${activeEmployee.id}/reactivate`, {}, { headers });
      console.log('✅ Colaborador reativado:', reactivateResponse.data.message);
    } catch (error) {
      console.error('❌ Erro ao reativar:', error.response?.data?.message || error.message);
      return;
    }

    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse http://localhost:5173 (frontend)');
    console.log('2. Faça login com admin@petpalmanager.com / admin123');
    console.log('3. Vá para a página de Colaboradores');
    console.log('4. Teste os botões de Inativar/Reativar na interface');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes dos endpoints de colaboradores...\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n💡 Certifique-se de que:');
    console.log('1. O backend está rodando (npm run dev)');
    console.log('2. O banco de dados foi inicializado (npm run init-db)');
    return;
  }

  await testEmployeeEndpoints();
}

// Executar testes
runTests().catch(console.error); 