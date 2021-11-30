const Customer = require('../models/customer.model')
const Account = require('../models/account.model')
const Passbook = require('../models/passbook.model')
const interestRate = require('../models/interestRate.model')
const Term = require('../models/term.model')
const { response } = require('express')
const { mongooseToObject } = require('../../routers/utils/mongoose')
const executeCookie = require('../../middleware/executeCookie.mdw')
const jwt = require('jsonwebtoken')
const {mutipleMongooseToObject} = require('../../routers/utils/mongoose')
require('dotenv').config()

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

    //[POST] : customer/inputSignUp : 
    inputSignUp(req, res, next){
        var username = req.body.userName;
        Customer.findOne({
            tenTK : req.body.userName
        })
        .then(function(customer){
            if (customer != null){
                res.render('customer/signup')
            }
            else {
                var password_1 = req.body.password_1;
                var password_2 = req.body.password_2;
                if (password_2 != null && password_1 === password_2 && password_1 != null){
                    Customer.create({
                        tenTK : username, 
                        password : password_1,
                        account : null,
                    }).then(function(){
                        Customer.findOne({
                            tenTK : req.body.userName
                        })
                        .then(function(customer){
                            res.render('customer/profile', {customer : mongooseToObject(customer)});
                        })
                    })
                }
                else {
                    res.render('customer/signup')
                }
            }
        })
    }

    //[POST] : customer/setAccount : 
    setAccount(req, res, next){
       
    }

    //[POST] : customer/:id : 
    addProfile(req, res, next){
        Customer.updateOne({_id: req.params.id}, req.body)
        .then(function(){
            Customer.findById(req.params.id)
            .then(function(customer){
                Account.findOne({
                    soTK : customer.soTK
                })
                .then(function(account){
                        if (account != null){
                            console.log(account._id);
                            customer.account = account._id;
                            customer.save();
                        }
                    })
            })
            .then(function(customer){
                req.session.isAuthenticated = true; 
                req.session.isCustomer = customer; 
                console.log('data', customer);
                res.render('home');
            })
        })
        .catch(next)
    }

    //[POST] : customer/checkLogin : Nếu đăng nhập thành công 
    checkLogin(req, res, next){
        Customer.findOne({
            tenTK : req.body.userName, 
            password : req.body.password
        })
        .populate('account')
        .then(function(customer){
            if(customer != null){
                const token = jwt.sign({
                    _id : customer._id
                }, process.env.ACCESS_TOKEN_SECRET)
                var tenTK = customer.tenTK + "/"
                res.cookie('token', tenTK + token, { expires: new Date(Date.now() + 24 * 3600000)});
                res.render('home');
            }
        }).catch(next)
    }

    //[GET] : customer/myAccount : Hiển thị thông tin tài khoản 
    myAccount(req, res, next){
       const token = executeCookie(req, 'getToken'); 
       const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
       Customer.findById({
           _id : decodeToken._id 
       })
       .populate('account')
       .then(function(customer){
            var cus_Info = customer; 
            Passbook.find({
                customer : customer._id
            })
            .populate('term')
            .populate('interestRate')
            .populate('customer')
            .then(
                function(passbook){
                    console.log(passbook);
                    res.render('customer/accountsavebank', 
                    {soTK : cus_Info.soTK, 
                     soDu : cus_Info.account.soDu,
                     passbooks : mutipleMongooseToObject(passbook),
                    })
                }
            )
       })
    }
    test(req, res,next){
        res.render('customer/profile');
    }
}
//Public ra ngoài
module.exports = new CustomerController();
