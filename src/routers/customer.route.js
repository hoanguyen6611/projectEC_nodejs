const express = require('express');
const CustomerController = require('../app/controllers/CustomerController');
const router = express.Router();
const check = require('../middleware/checkAuth.mdw');

router.get('/signIn', CustomerController.signIn);
router.get('/signUp', CustomerController.signUp); 
router.post('/inputSignUp', CustomerController.inputSignUp)
router.put('/:id', CustomerController.addProfile);
router.get('/countMe', CustomerController.showInfomation);
router.post('/checkLogin', CustomerController.checkLogin);
router.get('/myAccount', CustomerController.myAccount);

module.exports = router;