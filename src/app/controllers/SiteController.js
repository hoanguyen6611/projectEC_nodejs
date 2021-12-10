const jwt = require('jsonwebtoken')
const Customer = require('../models/customer.model')
const executeCookie = require('../../middleware/executeCookie.mdw')
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
}
//Public ra ngoài
module.exports = new SiteController();
