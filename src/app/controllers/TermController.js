const Customer = require('../models/customer.model');
const Term = require('../models/term.model');
const interestRate = require('../models/interestRate.model')
const { response } = require('express');
const { mongooseToObject } = require('../../routers/utils/mongoose');
const executeCookie = require('../../middleware/executeCookie.mdw');
const jwt = require('jsonwebtoken');
const {mutipleMongooseToObject} = require('../../routers/utils/mongoose');
const { isValidObjectId } = require('mongoose');
require('dotenv').config()

class TermController {

    //[GET] : term/ : 
    term(req, res, next){
        Term.find({

        })
        .then(function(terms){
            res.render('customer/chooseasb', {
                terms : mutipleMongooseToObject(terms)
            })
        })
        
    }

    openSaving(req, res, next){
        const token = executeCookie(req, 'getToken'); 
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        Customer.findById({
            _id : decodeToken._id 
        })
        .populate('account')
        .then(function(customer){
            var cus_Info = customer; 
            interestRate.find({
                term : req.params.id, 
            }).then(function(interestRates)
                {
                    res.render('customer/accountsave', {
                        soTK : cus_Info.soTK, 
                        soDu : cus_Info.account.soDu, 
                        interestRates : mutipleMongooseToObject(interestRates),
                    })
                }
            )
        })
    }
}

module.exports = new TermController();