const express = require('express');
const AdminController = require('../app/controllers/AdminController');
const router = express.Router();
const check = require('../middleware/checkAuth.mdw');

router.get('/settingBankBook', AdminController.settingBankBook);
router.get('/createBankBook', AdminController.createBankBook); 
router.post('/createBankBook/checkCreatBankBook', AdminController.checkCreateBankBook);
router.get('/addInterestRate', AdminController.addInterestRate);
router.post('/addInterestRate/checkAddInterestRate', AdminController.checkAddInterestRate);
router.get('/settingBankBook/managementTerm/:id/deleteTerm', AdminController.deleteTerm);
router.get('/settingBankBook/managementTerm/:id/updateTerm', AdminController.updateTerm);
router.post('/settingBankBook/managementTerm/:id/updateTerm/checkUpdateTerm', AdminController.checkUpdateTerm);
router.get('/settingBankBook/managemnetTerm',AdminController.managemnetTerm);
router.get('/managementUser', AdminController.managementUser);
router.get('/managementUser/:id/deleteUser',AdminController.deleteUser);
router.get('/managementUser/:id/updateUser', AdminController.updateUser);
router.post('/managementUser/:id/updateUser/checkUpdateUser', AdminController.checkUpdateUser);


module.exports = router;
