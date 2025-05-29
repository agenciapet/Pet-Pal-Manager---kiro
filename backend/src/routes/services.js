const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todos os serviços
router.get('/', serviceController.getAllServices);

// Buscar serviço por ID
router.get('/:id', serviceController.getServiceById);

// Criar novo serviço (apenas admin)
router.post('/', authorizeRoles('admin'), serviceController.createService);

// Atualizar serviço (apenas admin)
router.put('/:id', authorizeRoles('admin'), serviceController.updateService);

// Desativar serviço (apenas admin)
router.delete('/:id', authorizeRoles('admin'), serviceController.deleteService);

module.exports = router; 