const express = require('express');
const AdminController = require('../app/controllers/AdminController');
const router = express.Router();
const check = require('../middleware/checkAuth.mdw');

router.get('/settingBankBook', AdminController.settingBankBook);
router.get('/createBankBook', AdminController.createBankBook); 
router.post('/createBankBook/checkCreatBankBook', AdminController.checkCreateBankBook);
router.get('/addInterestRate', AdminController.addInterestRate);
router.post('/addInterestRate/checkAddInterestRate', AdminController.checkAddInterestRate);


module.exports = router;
