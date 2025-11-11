const express = require('express');
const router = express.Router();
const contractsController = require('../controllers/contractsController');

// Salvar contrato gerado
router.post('/generated', contractsController.saveGeneratedContract);

// Listar contratos gerados
router.get('/generated', contractsController.getGeneratedContracts);

// Buscar contrato por ID
router.get('/generated/:id', contractsController.getGeneratedContractById);

// Atualizar status do contrato
router.put('/generated/:id/status', contractsController.updateContractStatus);

module.exports = router;