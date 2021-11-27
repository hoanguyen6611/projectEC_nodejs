const jwt = require('jsonwebtoken')
const CustomerModel = require('../app/models/customer.model')
require('dotenv').config()

module.exports = function (req, res, next) {
    try {
        var token = req.cookies.token; 
        var checkId = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
        console.log(checkId);
        if (checkId){
            CustomerModel.findOne({
                _id : checkId
            })
            .then(function(customer){
                res.locals.userName = customer.tenKH
            })
        }
    }catch(error){
        return res.json('Vui long dang nhap !')
    }
}