const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todos os usuários (apenas admin)
router.get('/', authorizeRoles('admin'), userController.getAllUsers);

// Buscar usuário por ID (apenas admin)
router.get('/association-options', authorizeRoles('admin'), userController.getAssociationOptions);

// Buscar usuário por ID (apenas admin)
router.get('/:id', authorizeRoles('admin'), userController.getUserById);

// Criar novo usuário (apenas admin)
router.post('/', authorizeRoles('admin'), userController.createUser);

// Atualizar usuário (apenas admin)
router.put('/:id', authorizeRoles('admin'), userController.updateUser);

// Desativar usuário (apenas admin)
router.delete('/:id', authorizeRoles('admin'), userController.deleteUser);

// Redefinir senha (apenas admin)
router.post('/:id/reset-password', authorizeRoles('admin'), userController.resetPassword);

module.exports = router; 