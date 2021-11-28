const express = require('express');
const router = express.Router();
const termController = require('../app/controllers/TermController');


router.get('/', termController.term);
module.exports = router;
