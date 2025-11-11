const db = require('../config/database');
const axios = require('axios');

// Listar todos os códigos de país
const getCountryCodes = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, country_iso_code, code as dial_code, flag_emoji FROM countries ORDER BY name ASC');
    res.json({ countries: result.rows });
  } catch (error) {
    console.error('Erro ao buscar códigos de país:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Listar todas as UFs do Brasil
const getBrazilianStates = async (req, res) => {
  try {
    const states = [
      { code: 'AC', name: 'Acre' },
      { code: 'AL', name: 'Alagoas' },
      { code: 'AP', name: 'Amapá' },
      { code: 'AM', name: 'Amazonas' },
      { code: 'BA', name: 'Bahia' },
      { code: 'CE', name: 'Ceará' },
      { code: 'DF', name: 'Distrito Federal' },
      { code: 'ES', name: 'Espírito Santo' },
      { code: 'GO', name: 'Goiás' },
      { code: 'MA', name: 'Maranhão' },
      { code: 'MT', name: 'Mato Grosso' },
      { code: 'MS', name: 'Mato Grosso do Sul' },
      { code: 'MG', name: 'Minas Gerais' },
      { code: 'PA', name: 'Pará' },
      { code: 'PB', name: 'Paraíba' },
      { code: 'PR', name: 'Paraná' },
      { code: 'PE', name: 'Pernambuco' },
      { code: 'PI', name: 'Piauí' },
      { code: 'RJ', name: 'Rio de Janeiro' },
      { code: 'RN', name: 'Rio Grande do Norte' },
      { code: 'RS', name: 'Rio Grande do Sul' },
      { code: 'RO', name: 'Rondônia' },
      { code: 'RR', name: 'Roraima' },
      { code: 'SC', name: 'Santa Catarina' },
      { code: 'SP', name: 'São Paulo' },
      { code: 'SE', name: 'Sergipe' },
      { code: 'TO', name: 'Tocantins' }
    ];
    
    res.json({ states });
  } catch (error) {
    console.error('Erro ao buscar estados brasileiros:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Função para buscar endereço por CEP (Brasil)
const getAddressByCep = async (req, res) => {
  try {
    const { cep } = req.params;
    
    // Validar formato do CEP
    const cepRegex = /^[0-9]{8}$/;
    if (!cepRegex.test(cep.replace(/\D/g, ''))) {
      return res.status(400).json({ message: 'CEP inválido' });
    }

    const cleanCep = cep.replace(/\D/g, '');
    
    // Buscar na API do ViaCEP
    const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (response.data.erro) {
      return res.status(404).json({ message: 'CEP não encontrado' });
    }

    const addressData = {
      cep: response.data.cep,
      street: response.data.logradouro,
      neighborhood: response.data.bairro,
      city: response.data.localidade,
      state: response.data.uf,
      country: 'Brasil',
      country_code: 'BR'
    };

    res.json({ address: addressData });
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    if (error.response?.status === 404) {
      res.status(404).json({ message: 'CEP não encontrado' });
    } else {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
};

// Função para listar países mais conhecidos
const getCountries = async (req, res) => {
  try {
    const countries = [
      { code: 'BR', name: 'Brasil', flag: '🇧🇷', default: true },
      { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
      { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
      { code: 'FR', name: 'França', flag: '🇫🇷' },
      { code: 'IT', name: 'Itália', flag: '🇮🇹' },
      { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
      { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
      { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
      { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
      { code: 'MX', name: 'México', flag: '🇲🇽' },
      { code: 'JP', name: 'Japão', flag: '🇯🇵' },
      { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
      { code: 'CH', name: 'Suíça', flag: '🇨🇭' },
      { code: 'NL', name: 'Holanda', flag: '🇳🇱' }
    ];
    
    res.json({ countries });
  } catch (error) {
    console.error('Erro ao buscar países:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  getCountryCodes,
  getBrazilianStates,
  getAddressByCep,
  getCountries,
}; 