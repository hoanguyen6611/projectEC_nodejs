const Customer = require('../models/customer.model')
const Account = require('../models/account.model')
const { response } = require('express')

class CustomerController {
    
    //[GET] : customer/signIn :
    signIn(req, res, next){
        res.render('customer/signin')
    }

    //[GET] : customer/signUp : 
    signUp(req, res, next){
        res.render('customer/signup')
    }

    //[GET] : customer/countMe : 
    showInfomation(req, res, next){
        res.render('customer/accountme')
    }

    //[POST] : customer/addProfile : 
    inputSignUp(req, res, next){
        var username = req.body.userName;
        var password_1 = req.body.password_1;
        var password_2 = req.body.password_2;
        if (password_2 != null && password_1 === password_2 && password_1 != null){
            Customer.create({
                tenTK : username, 
                password : password_1
            }).then(function(){
                res.render('customer/profile')
            })
        }
        else {
            res.render('customer/signup')
        }
    }

    //[POST] : customer/checkLogin :

    checkLogin(req, res, next){
        Customer.findOne({
            tenTK : req.body.userName, 
            password : req.body.password
        })
        .populate('account')
        .then(function(customer){
            if(customer != null){
                console.log('data', customer);

                delete customer.password;
                req.session.isAuthenticated = true; 
                req.session.isCustomer = customer; 

                console.log('data', req.session.isCustomer);

                res.render('home');
            }
        }).catch(next)
    }
}
//Public ra ngoài
module.exports = new CustomerController();
