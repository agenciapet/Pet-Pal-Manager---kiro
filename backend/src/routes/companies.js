const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todas as empresas
router.get('/', companyController.getAllCompanies);

// Buscar empresa por ID
router.get('/:id', companyController.getCompanyById);

// Criar nova empresa (apenas admin e financeiro)
router.post('/', authorizeRoles('admin', 'financeiro'), companyController.createCompany);

// Atualizar empresa (apenas admin e financeiro)
router.put('/:id', authorizeRoles('admin', 'financeiro'), companyController.updateCompany);

// Desativar empresa (apenas admin)
router.delete('/:id', authorizeRoles('admin'), companyController.deleteCompany);

// Adicionar representante à empresa (apenas admin e financeiro)
router.post('/:companyId/representatives', authorizeRoles('admin', 'financeiro'), companyController.addRepresentative);

// Adicionar serviço à empresa (apenas admin e financeiro)
router.post('/:companyId/services', authorizeRoles('admin', 'financeiro'), companyController.addService);

module.exports = router; 