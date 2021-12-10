const jwt = require('jsonwebtoken')
const Customer = require('../app/models/customer.model')
const executeCookie = require('./executeCookie.mdw')
require('dotenv').config()

module.exports = function(req, res, next){
    const token = executeCookie(req, 'getToken'); 
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    Customer.findById({
        _id : decodeToken._id, 
    })
    .then(function(customer){
        if (customer.quyen == 'Admin')
        {
            return true;
        }
        else{
            return false;
        }
    })
}