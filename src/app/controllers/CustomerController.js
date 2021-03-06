const Customer = require('../models/customer.model')
const Account = require('../models/account.model')
const Passbook = require('../models/passbook.model')
const bcrypt = require('bcryptjs');
const interestRate = require('../models/interestRate.model')
const Term = require('../models/term.model')
const { response } = require('express')
const { mongooseToObject } = require('../../routers/utils/mongoose')
const executeCookie = require('../../middleware/executeCookie.mdw')
const checkAdminRole = require('../../middleware/checkAdminRole')
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const { mutipleMongooseToObject } = require('../../routers/utils/mongoose')
const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AbSG6b7VOE2g4O9vo8hEQXIR0qVNJXvfNm2aPL8q9KXej1Pe0xAtcmAm0tqkGVfz1pWdR13Qo19JVfFh',
    'client_secret': 'EGmzZF6LvtjIS2QwzPvD3x2kuKZQr5ywUsUOqDhADUPpdaXkwVuDxWcgi5wmYhGh7IgB2W3GWAgJi3RK'
});


require('dotenv').config()
const transporter = nodemailer.createTransport({
    // host: 'smtp.gmail.com',
    service: 'gmail',
    auth: {
        user: 'cdhstore2@gmail.com',
        pass: 'Hoa6161*nguyenhuy'
    }
})

class CustomerController {


    //[GET] : customer/signIn :
    signIn(req, res, next) {
        res.render('customer/signin')
    }

    //[GET] : customer/signUp : 
    signUp(req, res, next) {
        res.render('customer/signup')
    }

    //[GET] : customer/countMe : 
    showInfomation(req, res, next) {
        res.render('customer/profile')
    }

    //[POST] : customer/inputSignUp : 
    inputSignUp(req, res, next) {
        var username = req.body.userName;
        Customer.findOne({
            tenTK: req.body.userName
        })
            .then(function (customer) {
                if (customer != null) {
                    res.render('customer/signup')
                }
                else {
                    const salt = bcrypt.genSaltSync(10);
                    const password_1 = req.body.password_1;
                    const password_2 = req.body.password_2;
                    const password = bcrypt.hashSync(password_1, salt);
                    if (password_2 != null && password_1 === password_2 && password_1 != null) {
                        Customer.create({
                            tenTK: username,
                            password: password,
                            account: null,
                        }).then(function () {
                            Customer.findOne({
                                tenTK: req.body.userName
                            })
                                .then(function (customer) {

                                    res.render('customer/addprofile', {
                                        customer: mongooseToObject(customer)
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
    setAccount(req, res, next) {

    }

    //[POST] : customer/:id : 
    addProfile(req, res, next) {
        Customer.updateOne({ _id: req.params.id }, req.body)
            .then(function () {
                Customer.findById(req.params.id)
                    .then(function (customer) {
                        Account.findOne({
                            soTK: customer.soTK
                        })
                            .then(function (account) {
                                if (account != null) {
                                    console.log(account._id);
                                    customer.account = account._id;
                                    customer.save();
                                }
                            })

                    })
                    .then(function (customer) {
                        req.session.isAuthenticated = true;
                        req.session.isCustomer = customer;
                        console.log('data', customer);
                        res.render('home');
                    })
            })
            .catch(next)
    }

    //[POST] : customer/checkLogin : N???u ????ng nh???p th??nh c??ng 
    checkLogin(req, res, next) {
        Customer.findOne({
            tenTK: req.body.userName,
        })
            .populate('account')
            .then(function (customer) {
                if (customer != null) {
                    var Admin = customer.quyen;
                    if (Admin == 'Admin') {
                        Admin = true;
                    }
                    else {
                        Admin = false;
                    }
                    var kq = bcrypt.compareSync(req.body.password, customer.password);
                    if (kq == true) {
                        const token = jwt.sign({
                            _id: customer._id
                        }, process.env.ACCESS_TOKEN_SECRET)
                        var tenTK = customer.tenTK;
                        var tenKH = customer.tenKH;
                        res.cookie('token', customer.tenTK + "/" + token + "/" + Admin,
                            { expires: new Date(Date.now() + 24 * 3600000) });
                        if (Admin == true) {
                            res.render('home', {
                                tenTK: tenTK,
                                Admin: Admin,
                                tenKH: tenKH,
                            })
                        }
                        else {
                            res.render('customer/accountme', {
                                tenTK: tenTK,
                                tenKH: tenKH,
                            })
                        }
                    }
                    else{
                        res.render('customer/signin',{
                            error: "M???t kh???u kh??ng ch??nh x??c"
                        })
                    }
                }
                else {
                    res.render('customer/signin',{
                        error: "T??i kho???n kh??ng t???n t???i"
                    })
                }
            }).catch(next)
    }

    //[GET] : customer/myAccount : Hi???n th??? th??ng tin t??i kho???n 
    myAccount(req, res, next) {
        const token = executeCookie(req, 'getToken');
        const decodeToken = jwt.verify(token,
            process.env.ACCESS_TOKEN_SECRET);
        Customer.findById({
            _id: decodeToken._id,
        })
            .populate('account')
            .then(function (customer) {
                var Admin = customer.quyen;
                if (Admin == 'Admin') {
                    Admin = true;
                }
                else {
                    Admin = false;
                }
                var cus_Info = customer;
                Passbook.find({
                    customer: customer._id
                })
                    .populate('term')
                    .populate('interestRate')
                    .populate('customer')
                    .then(
                        function (passbook) {
                            const tenTK = executeCookie(req, 'getTenTK');
                            if (req.session.message) {
                                console.log(req.session.message)
                                res.render('customer/accountsavebank',
                                    {
                                        soTK: cus_Info.soTK,
                                        customer: mongooseToObject(cus_Info),
                                        soDu: cus_Info.account.soDu,
                                        passbooks: mutipleMongooseToObject(passbook),
                                        tenTK: tenTK,
                                        Admin: Admin,
                                        message: req.session.message,
                                    })
                            }
                            else {
                                res.render('customer/accountsavebank',
                                    {
                                        soTK: cus_Info.soTK,
                                        customer: mongooseToObject(cus_Info),
                                        soDu: cus_Info.account.soDu,
                                        passbooks: mutipleMongooseToObject(passbook),
                                        Admin: Admin,
                                        tenTK: tenTK,
                                    })
                            }
                        }
                    )
            })
    }

    //[GET] : customer/showInfomationOfAccount
    showInfomationOfAccount(req, res, next) {
        const token = executeCookie(req, 'getToken');
        const tenTK = executeCookie(req, 'getTenTK');
        const Admin = executeCookie(req, 'checkAdmin');
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        Customer.findById({
            _id: decodeToken._id,
        })
            .then(function (customer) {
                Customer.findById({
                    _id: customer._id,
                }).then(function (customer) {
                    console.log(customer)
                    res.render('customer/profile'), {
                        customer: mongooseToObject(customer),
                        tenTK: tenTK,
                        Admin: Admin,
                    }
                })
            })
    }

    //[GET] : customer/resetPassword : 
    resetPassword(req, res, next) {
        const tenTK = executeCookie(req, 'getTenTK');
        const Admin = executeCookie(req, 'checkAdmin');
        const token = executeCookie(req, 'getToken');
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        Customer.findById({
            _id: decodeToken._id,
        }).then(function (customer) {
            res.render('customer/changePassword', {
                tenTK: tenTK,
                Admin: Admin,
                id: customer._id,
                message: req.session.message,
            })
        })
    }

    //[POST] : customer/:id/checkResetPassword : 
    checkResetPassword(req, res, next) {
        const currentPassword = req.body.currentPassword;
        const newPassword_1 = req.body.newPassword_1;
        const newPassword_2 = req.body.newPassword_2;
        Customer.findById({
            _id: req.params.id,
        }).then(function (customer) {
            var kq = bcrypt.compareSync(currentPassword, customer.password);
            if (kq == true) {
                if (newPassword_1 == newPassword_2) {
                    var bol = bcrypt.compareSync(newPassword_2, customer.password);
                    if (bol == true) {
                        req.session.message = {
                            type: 'danger',
                            intro: 'Th???t b???i !',
                            message: `M???t kh???u m???i nh???p tr??ng v???i m???t kh???u c?? !`,
                        }
                        res.redirect('/customer/resetPassword');
                    }
                    else {
                        const salt = bcrypt.genSaltSync(10);
                        const passwordNew = bcrypt.hashSync(newPassword_1, salt);
                        Customer.findByIdAndUpdate({
                            _id: req.params.id,
                        }, {
                            password: passwordNew,
                        }).then(function (customer) {
                            req.session.message = {
                                type: 'success',
                                intro: 'Th??nh c??ng !',
                                message: `Thay ?????i m???t kh???u th??nh c??ng !`,
                            }
                            res.redirect('/customer/myAccount');
                        })
                    }
                }
                else {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Th???t b???i !',
                        message: `M???t kh???u m???i nh???p kh??ng t????ng th??ch !`,
                    }
                    res.redirect('/customer/resetPassword');
                }
            }
            else {
                req.session.message = {
                    type: 'danger',
                    intro: 'Th???t b???i !',
                    message: `M???t kh???u hi???n t???i nh???p kh??ng ????ng !`,
                }
                res.redirect('/customer/resetPassword');
            }
        })
    }

    //[POST] : customer/logout 
    logOut(req, res, next) {
        res.clearCookie("token");
        res.redirect('/');
    }
    //[GET] : customer/forgetpass
    forgetPass(req, res, next) {
        res.render('customer/forgetpass')
    }
    //[POST] : customer/resetpass
    resetPass(req, res, next) {
        Customer.findOne({
            tenTK: req.body.userName,
        })
            .then(function (customer) {
                if (customer == null) {
                    res.render('customer/forgetpass', {
                        message: 'T??n ????ng nh???p kh??ng t???n t???i'
                    })
                }
                else {
                    const passNew = Math.floor(Math.random() * 1000000);
                    const pass = String(passNew);
                    const salt = bcrypt.genSaltSync(10);
                    const password1 = bcrypt.hashSync(pass, salt);
                    customer.password = password1;
                    customer.save();
                    const email = customer.email;
                    var mailOptions = {
                        from: 'cdhstore2@gmail.com',
                        to: email,
                        subject: '?????t l???i m???t kh???u',
                        text: `M???t kh???u m???i c???a b???n l??: ${passNew}`
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            res.render('customer/signin');
                        }
                    });
                }

            })
            .catch(next)
    }
}
//Public ra ngo??i
module.exports = new CustomerController();
