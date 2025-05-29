const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todos os colaboradores
router.get('/', employeeController.getAllEmployees);

// Buscar colaborador por ID
router.get('/:id', employeeController.getEmployeeById);

// Criar novo colaborador (apenas admin e financeiro)
router.post('/', authorizeRoles('admin', 'financeiro'), employeeController.createEmployee);

// Atualizar colaborador (apenas admin e financeiro)
router.put('/:id', authorizeRoles('admin', 'financeiro'), employeeController.updateEmployee);

// Desativar colaborador (apenas admin)
router.delete('/:id', authorizeRoles('admin'), employeeController.deleteEmployee);

// Reativar colaborador (apenas admin)
router.patch('/:id/reactivate', authorizeRoles('admin'), employeeController.reactivateEmployee);

// Buscar histórico de atividades do colaborador (apenas admin)
router.get('/:id/history', authorizeRoles('admin'), employeeController.getEmployeeHistory);

// Verificar CRMV
router.post('/verify-crmv', employeeController.verifyCrmvEndpoint);

module.exports = router; 