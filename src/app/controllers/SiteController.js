const jwt = require('jsonwebtoken')
const Customer = require('../models/customer.model')
const Term = require('../models/term.model')
const executeCookie = require('../../middleware/executeCookie.mdw')
const { mutipleMongooseToObject } = require('../../routers/utils/mongoose')
require('dotenv').config()

class SiteController {
    //[GET] /home
    index(req, res, next) {
        const token = executeCookie(req, 'getToken');
        if (token){
            const tenTK = executeCookie(req, 'getTenTK');  
            const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            Customer.findOne({
                _id : decodeToken._id, 
            }) 
            .then(function(customer){
                var Admin = customer.quyen; 
                if (Admin == 'Admin'){
                    Admin = true;
                }
                else 
                {
                    Admin = false;
                }
                res.render('home'), {
                    tenTK : tenTK,
                    Admin : Admin,
                }
            })
        }
        else{
            res.render('home');
        }
        
    };
    //[GET] /search
    search(req, res, next){
        const key = req.query.searchse;
        console.log(key);
        Term.find(
            {
                tenGoiTietKiem: { $regex: key }
            })
            .then(terms=>{
                res.render('search', {
                    terms : mutipleMongooseToObject(terms),
                })
            })

    }
    //[GET] /search
    home(req, res, next){
        res.render('customer/accountme')
    }
}
//Public ra ngoài
module.exports = new SiteController();
