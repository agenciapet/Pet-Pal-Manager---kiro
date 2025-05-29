const express = require('express');
const router = express.Router();
const utilsController = require('../controllers/utilsController');
const { authenticateToken } = require('../middlewares/auth'); // Importar authenticateToken diretamente

// Rota para buscar códigos de país
router.get('/country-codes', authenticateToken, utilsController.getCountryCodes);

module.exports = router; 