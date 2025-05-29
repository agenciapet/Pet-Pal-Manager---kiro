const db = require('../config/database');

// Listar todos os códigos de país
const getCountryCodes = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, country_iso_code, dial_code, flag_emoji FROM countries ORDER BY name ASC');
    res.json({ countries: result.rows });
  } catch (error) {
    console.error('Erro ao buscar códigos de país:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  getCountryCodes,
}; 