const express = require('express');
const SettlementController = require('../app/controllers/SettlementController'); 
const router = express.Router(); 

router.get('/', SettlementController.settlement)
router.get('/:id/viewDetail', SettlementController.viewDetail);

module.exports = router;