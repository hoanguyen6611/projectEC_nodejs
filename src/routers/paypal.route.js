const express = require('express');
const PaypalController = require('../app/controllers/PaypalController');
const router = express.Router();
const check = require('../middleware/checkAuth.mdw');

router.post('/withdrawMoney', PaypalController.withdrawMoney);
router.post('/rechargeMoney', PaypalController.rechargeMoney);
router.get('/success', PaypalController.paypalSucces);
router.get('cancel', PaypalController.paypalCancel);


module.exports = router;
