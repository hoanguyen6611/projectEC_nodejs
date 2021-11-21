const express = require('express');
const CustomerController = require('../app/controllers/CustomerController');
const router = express.Router();
const restrict = require('../middleware/auth.mdw');

router.get('/signIn', CustomerController.signIn);
router.get('/signUp', CustomerController.signUp); 
router.post('/inputSignUp', CustomerController.inputSignUp)
router.get('/countMe', CustomerController.showInfomation);
router.post('/checkLogin', CustomerController.checkLogin);

module.exports = router;
