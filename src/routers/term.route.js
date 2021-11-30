const express = require('express');
const router = express.Router();
const termController = require('../app/controllers/TermController');


router.get('/', termController.term);
router.get('/:id/openSaving', termController.openSaving);
router.put('/checkSavingMoney', termController.checkSavingMoney);

module.exports = router;
