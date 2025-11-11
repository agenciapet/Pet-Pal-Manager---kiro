const express = require('express');
const router = express.Router();
const utilsController = require('../controllers/utilsController');
const { authenticateToken } = require('../middlewares/auth'); // Importar authenticateToken diretamente

// Rota para buscar códigos de país (sem autenticação para teste)
router.get('/country-codes', utilsController.getCountryCodes);

// Rota para buscar estados brasileiros
router.get('/brazilian-states', utilsController.getBrazilianStates);

// Rota para buscar endereço por CEP
router.get('/address/:cep', utilsController.getAddressByCep);

// Rota para buscar países
router.get('/countries', utilsController.getCountries);

module.exports = router; 