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
// const paypal = require('paypal-rest-sdk');
// paypal.configure({
//     'mode': 'sandbox', //sandbox or live
//     'client_id': 'AbSG6b7VOE2g4O9vo8hEQXIR0qVNJXvfNm2aPL8q9KXej1Pe0xAtcmAm0tqkGVfz1pWdR13Qo19JVfFh',
//     'client_secret': 'EGmzZF6LvtjIS2QwzPvD3x2kuKZQr5ywUsUOqDhADUPpdaXkwVuDxWcgi5wmYhGh7IgB2W3GWAgJi3RK'
// });


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
                            
                            res.render('customer/addprofile', {
                                customer : mongooseToObject(customer)
                            });
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
           _id : decodeToken._id, 
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
                    const tenTK = executeCookie(req, 'getTenTK'); 
                    res.render('customer/accountsavebank', 
                    {soTK : cus_Info.soTK, 
                     soDu : cus_Info.account.soDu,
                     passbooks : mutipleMongooseToObject(passbook),
                     tenTK : tenTK,
                    })
                }
            )
       })
    }

    //[GET] : customer/showInfomationOfAccount
    showInfomationOfAccount(req, res, next){
        const token = executeCookie(req, 'getToken'); 
        const tenTK = executeCookie(req, 'getTenTK'); 
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        Customer.findOne({
            _id : decodeToken._id, 
        }) 
        .then(function(customer){
            res.render('customer/profile'), {
                customer : mongooseToObject(customer),
                tenTK : tenTK,
            }
        })
    }

    //[POST] : customer/logout 
    logOut(req, res, next){
        res.clearCookie("token");
        res.redirect('/');
    }

    //[POST] : customer/paypal 
    paypal(req, res, next){
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://return.url",
                "cancel_url": "http://cancel.url"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "item",
                        "sku": "item",
                        "price": "1.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "1.00"
                },
                "description": "This is the payment description."
            }]
        };
         
         
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for(let i = 0; i < payment.links.length; i++){
                    if(payment.links[i].rel === 'approval_url'){
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });
    }

    //
    paypalSucces(req, res, next){
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId; 

        const excute_payment_json = {
            "payer_id" : payerId,
            "transactions" : [{
                "amount" : {
                    "currency" : "USD", 
                    "total" : "25.00",
                }
            }]
        }; 

        paypal.payment.execute(paymentId, excute_payment_json, function(error, payment){
            if(error){
                console.log(error.respose); 
                throw error;
            }
            else{
                console.log(JSON.stringify(payment));
                res.send('Success !');
            }
        })

        res.send('Cancelled !')
    }
}
//Public ra ngoài
module.exports = new CustomerController();
