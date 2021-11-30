const express = require('express');
const HistoryController = require('../app/controllers/HistoryController'); 
const router = express.Router(); 

router.get('/', HistoryController.history)

module.exports = router;