const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Obter dados da agência
router.get('/', agencyController.getAgency);

// Criar/Atualizar dados da agência (apenas admin)
router.post('/', authorizeRoles('admin'), agencyController.upsertAgency);

// Adicionar sócio à agência (apenas admin)
router.post('/partners', authorizeRoles('admin'), agencyController.addPartner);

// Atualizar sócio (apenas admin)
router.put('/partners/:id', authorizeRoles('admin'), agencyController.updatePartner);

// Desativar sócio (apenas admin)
router.delete('/partners/:id', authorizeRoles('admin'), agencyController.deletePartner);

module.exports = router; 