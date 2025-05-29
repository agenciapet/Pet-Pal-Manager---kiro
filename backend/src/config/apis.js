const axios = require('axios');

// Configuração da API do ViaCEP
const viaCepApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
  timeout: 5000,
});

// Configuração da API do Cora
const coraApi = axios.create({
  baseURL: process.env.CORA_API_URL || 'https://api.cora.com.br/v1',
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${process.env.CORA_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Função para buscar CEP
const getCepInfo = async (cep) => {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await viaCepApi.get(`/${cleanCep}/json/`);
    
    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      zipCode: cleanCep,
      street: response.data.logradouro,
      neighborhood: response.data.bairro,
      city: response.data.localidade,
      state: response.data.uf,
    };
  } catch (error) {
    throw new Error('Erro ao buscar informações do CEP');
  }
};

// Função para validar CPF
const validateCpf = (cpf) => {
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
  
  return true;
};

// Função para validar CNPJ
const validateCnpj = (cnpj) => {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  
  if (cleanCnpj.length !== 14) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;
  
  // Validar primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCnpj.charAt(12))) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleanCnpj.charAt(13))) return false;
  
  return true;
};

// Função para verificar CRMV (simulação - implementar scraping real conforme necessário)
const verifyCrmv = async (crmvNumber, state) => {
  try {
    // TODO: Implementar scraping do site do CFMV
    // Por enquanto, retorna uma simulação
    
    // Simular verificação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retornar dados simulados
    return {
      isValid: true,
      status: 'ativo',
      professionalName: 'Nome do Profissional',
      state: state,
      verifiedAt: new Date(),
    };
  } catch (error) {
    throw new Error('Erro ao verificar CRMV');
  }
};

// Funções da API do Cora
const coraPayment = {
  // Criar pagamento
  createPayment: async (paymentData) => {
    try {
      const response = await coraApi.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao criar pagamento no Cora');
    }
  },
  
  // Consultar status do pagamento
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await coraApi.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao consultar status do pagamento');
    }
  },
  
  // Criar boleto
  createBoleto: async (boletoData) => {
    try {
      const response = await coraApi.post('/boletos', boletoData);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao criar boleto no Cora');
    }
  },
};

module.exports = {
  getCepInfo,
  validateCpf,
  validateCnpj,
  verifyCrmv,
  coraPayment,
}; 