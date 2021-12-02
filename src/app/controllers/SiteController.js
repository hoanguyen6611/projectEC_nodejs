const jwt = require('jsonwebtoken')
const CustomerModel = require('../models/customer.model')
const executeCookie = require('../../middleware/executeCookie.mdw')
require('dotenv').config()

class SiteController {
    //[GET] /home
    index(req, res, next) {
        const tenTK = executeCookie(req, 'getTenTK'); 
        res.render('home', {tenTK : tenTK});
    };
    //[GET] /home/admin
    admin(req, res, next) { 
        res.render('admin/admincustomer');
    };

}
//Public ra ngoài
module.exports = new SiteController();
