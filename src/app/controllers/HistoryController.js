const Customer = require('../models/customer.model');
const Term = require('../models/term.model');
const InterestRate = require('../models/interestRate.model');
const Passbook = require('../models/passbook.model');
const Account = require('../models/account.model');
const History = require('../models/history.model');
const { response } = require('express');
const { mongooseToObject } = require('../../routers/utils/mongoose');
const executeCookie = require('../../middleware/executeCookie.mdw');
const jwt = require('jsonwebtoken');
const {mutipleMongooseToObject} = require('../../routers/utils/mongoose');
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');
require('dotenv').config()

class HistoryController {

    //[GET] : /history 
    history(req, res, next) {
        var Admin = ''
        const token = executeCookie(req, 'getToken'); 
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        Customer.findOne({
            _id : decodeToken._id,
        })
        .then(function(customer){
            Admin = customer.quyen; 
            if (Admin == 'Admin'){
                Admin = true;
            }
            else 
            {
                Admin = false;
            }
        })
        History.find({
            customer : decodeToken._id,
        })
        .populate('customer')
        .then(function(historyList){
            const tenTK = executeCookie(req, 'getTenTK'); 
            res.render('customer/transactionhis', {
                historyList : mutipleMongooseToObject(historyList),
                tenTK : tenTK,
                Admin : Admin,
            });
        })
    };
}
//Public ra ngoài
module.exports = new HistoryController();