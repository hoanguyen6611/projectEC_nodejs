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
const paypal = require('paypal-rest-sdk');
const { findOneAndUpdate, findByIdAndUpdate } = require('../models/customer.model')

// Cổng để đăng nhập đúng web Paypal : 
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AbSG6b7VOE2g4O9vo8hEQXIR0qVNJXvfNm2aPL8q9KXej1Pe0xAtcmAm0tqkGVfz1pWdR13Qo19JVfFh',
    'client_secret': 'EGmzZF6LvtjIS2QwzPvD3x2kuKZQr5ywUsUOqDhADUPpdaXkwVuDxWcgi5wmYhGh7IgB2W3GWAgJi3RK'
});


require('dotenv').config()

class PaypalController{

     //[POST] : customer/paypal 
    withdrawMoney(req, res, next){

        //Quy đổi tiền tệ : 1 VNĐ = 0.00004 Đô la Mỹ
        var soTienMuonNap = parseFloat(req.body.soTienMuonNap); 
        const tyGiaTienDoLa = parseFloat(0.00004); 
        soTienMuonNap = parseFloat((soTienMuonNap * tyGiaTienDoLa).toFixed(2));

        //Cấu hình địa chỉ url khi success hoặc cancel :
        var url = req.protocol + '://' + req.get('host');
        const returnUrl = (url + '/paypal/success').toString(); 
        const cancelUrl = (url + '/paypal/cancel').toString(); 

        //Cấu trúc gửi tiền tệ lên Paypal : 
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": returnUrl,
                "cancel_url": cancelUrl,
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "item",
                        "sku": "item",
                        "price": soTienMuonNap.toString(),
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": soTienMuonNap.toString(),
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

    paypalCancel(req, res, next){
        req.session.message = {
            type: 'danger',
            intro: `Không thể nạp tiền từ ví điện tử Paypal !`,
            message: 'Lỗi !'
        }
        res.redirect('/customer/myAccount');
    }
    
    paypalSucces(req, res, next){
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId; 

        paypal.payment.get(paymentId, async function(error, payment){
            if(error){
                throw error;
            }
            else {
                const amount = payment.transactions[0].amount.total.toString(); 
                
                const excute_payment_json = {
                    "payer_id" : payerId,
                    "transactions" : [{
                        "amount" : {
                            "currency" : "USD", 
                            "total" : amount,
                        }
                    }]
                }; 

                paypal.payment.execute(paymentId, excute_payment_json, function(error, payment){
                    if(error){
                        console.log(error.respose); 
                        throw error;
                    }
                    else{
                        const token = executeCookie(req, 'getToken'); 
                        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                        Customer.findById({
                            _id : decodeToken._id, 
                        })
                        .populate('account')
                        .then(function(customer){
                            //Đổi tiền đô la Mỹ sang tiền Việt : 
                            var soTienNap = parseFloat((parseFloat(amount)/ parseFloat(0.00004)).toFixed(2)); 
                            var soDu = parseFloat(customer.account.soDu);
                            var soDuSauKhiNap = soDu + soTienNap;
                            Account.findOneAndUpdate({
                                soTK : customer.soTK, 
                            }, {
                                soDu : soDuSauKhiNap
                            }).then(function(){
                                //Gửi thông báo khi nạp tiền thành công :
                                req.session.message = {
                                    type: 'success',
                                    intro: `Đã nạp thành công số tiền ${soTienNap} từ ví điện tử Paypal !`,
                                    message: ''
                                }
                                res.redirect('/customer/myAccount');
                            })
                        })
                    }
                })
            }
        })
    }

    rechargeMoney(req, res, next){

        //Quy đổi tiền tệ : 1 VNĐ = 0.00004 Đô la Mỹ
        var soTienMuonRut = parseFloat(req.body.soTienMuonRut); 
        const tyGiaTienDoLa = parseFloat(0.00004); 
        soTienMuonRut = parseFloat((soTienMuonRut * tyGiaTienDoLa).toFixed(2));
        
        if(soTienMuonRut > parseFloat(req.body.soDu)){
            req.session.message = {
                type: 'danger',
                intro: `Số dư trong tài khoản của bạn không đủ để thực hiện giao dịch !`,
                message: 'Lỗi !'
            }
            res.redirect('/customer/myAccount');
        }
        else{
            var email = 'que123@gmail.com'; 
            var sender_batch_id = Math.random().toString(36).substring(9);
            var create_payout_json = {
                "sender_batch_header": {
                    "sender_batch_id": sender_batch_id,
                    "email_subject": "Rút tiền từ AHC BANK"
                },
                "items": [
                    {
                        "recipient_type": "EMAIL",
                        "amount": {
                            "value": soTienMuonRut.toString(),
                            "currency": "USD"
                        },
                        "receiver": email.toString(),
                        "note": "Thank you.",
                        "sender_item_id": "item_3"
                    }
                ]
            };
            var sync_mode = 'false';
            paypal.payout.create(create_payout_json, sync_mode, async function (error, payout) {
                if (error) {
                    console.log(error.response);
                    req.session.message = {
                        type: 'danger',
                        intro: 'Xuất hiện lỗi khi thực hiện giao dịch vui lòng thử lại !',
                        message: ''
                    }
                    res.redirect('/customer/myAccount')
                }
                else{
                    soTienMuonRut = parseFloat((soTienMuonRut / parseFloat(0.00004)).toFixed(2)); 
                    const token = executeCookie(req, 'getToken'); 
                    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                    Customer.findById({
                        _id : decodeToken._id, 
                    })
                    .populate('account')
                    .then(function(customer){
                        var soDu = parseFloat(customer.account.soDu);
                        var soDuSauKhiNap = soDu - soTienMuonRut;
                        Account.findOneAndUpdate({
                            soTK : customer.soTK, 
                        }, {
                                soDu : soDuSauKhiNap
                        }).then(function(){
                            //Gửi thông báo khi nạp tiền thành công :
                            req.session.message = {
                                type: 'success',
                                intro: `Đã rút thành công số tiền ${soTienMuonRut} từ hệ thống !`,
                                message: ''
                            }
                            res.redirect('/customer/myAccount');
                        })
                    })

                }
            })
            
        }
        

    }

}

module.exports = new PaypalController()