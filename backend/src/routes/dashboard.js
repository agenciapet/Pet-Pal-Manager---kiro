const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Obter estatísticas do dashboard
router.get('/stats', dashboardController.getDashboardStats);

// Obter dados para gráficos
router.get('/charts', dashboardController.getChartData);

module.exports = router; 