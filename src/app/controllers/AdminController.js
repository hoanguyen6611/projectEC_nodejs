const Customer = require('../models/customer.model');
const Term = require('../models/term.model');
const InterestRate = require('../models/interestRate.model');
const Passbook = require('../models/passbook.model');
const Account = require('../models/account.model');
const History = require('../models/history.model');
const { response } = require('express');
const { mongooseToObject } = require('../../routers/utils/mongoose');
const executeCookie = require('../../middleware/executeCookie.mdw');
const jwt = require('jsonwebtoken');
const {mutipleMongooseToObject} = require('../../routers/utils/mongoose');
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');
const { render } = require('node-sass');
require('dotenv').config()

class AdminController {

    //[GET] : admin/settingBankBook /
    settingBankBook(req, res, next){
        const tenTK = executeCookie(req, 'getTenTK'); 
        const Admin = executeCookie(req, 'checkAdmin');
        res.render('admin/settingBankBookList',{
            tenTK : tenTK, 
            Admin : Admin,
            message : req.session.message,
        })
    }

    //[GET] : admin/settingBankBook 
    createBankBook(req, res, next){
        const tenTK = executeCookie(req, 'getTenTK'); 
        const Admin = executeCookie(req, 'checkAdmin');
        res.render('admin/addsavemoney', {
            tenTK : tenTK, 
            Admin : Admin,
        })
    }

    //[GET] : admin/settingBankBook/managementTerm 
    managemnetTerm(req, res, next){
        const tenTK = executeCookie(req, 'getTenTK'); 
        const Admin = executeCookie(req, 'checkAdmin');
        Term.find().then(function(terms){
            res.render('admin/configPassbook', {
                terms : mutipleMongooseToObject(terms),
                tenTK : tenTK, 
                Admin : Admin,
                message : req.session.message,
            })
        })
    }

    //[GET] : admin/settingBankBook/managementTerm/:id/updateTerm
    updateTerm(req, res, next){

        const tenTK = executeCookie(req, 'getTenTK'); 
        const Admin = executeCookie(req, 'checkAdmin');

        Term.findById({
            _id : req.params.id,
        }).then(function(term){
            res.render('admin/updatesavemoney', {
                tenTK : tenTK, 
                Admin : Admin, 
                term : mongooseToObject(term),
            })
        })
    }

    //[POST] : admin/settingBankBook/managementTerm/:id/updateTerm/checkUpdateTerm 
    checkUpdateTerm(req, res, next){
            
        Term.findByIdAndUpdate({
            _id : req.params.id,
        },{
            tenGoiSanPham : req.body.tenGoiSanPham, 
            image : req.body.image, 
            laiSuat : req.body.laiSuat, 
            description : req.body.description,
        }).then(function(){
            req.session.message = {
                type: 'success',
                intro: 'Th??nh c??ng !',
                message: `C???p nh???t g??i ti???t ki???m th??nh c??ng !`,
            }
            res.redirect('/admin/settingBankBook/managemnetTerm');
        })
    }

    //[GET] : admin/settingBankBook/managementTerm/:id/deleteTerm
    deleteTerm(req, res, next){
        
        Passbook.findOne({
            term : req.params.id,
        }).then(function(passbook){
            if (passbook){
                req.session.message = {
                    type: 'danger',
                    intro: 'Th???t b???i !',
                    message: `Hi???n t???i v???n c??n kh??ch h??ng s??? d???ng 
                    d???ch v??? n??n kh??ng th??? th???c hi???n thao t??c n??y !`,
                }
                res.redirect('/admin/settingBankBook/managemnetTerm');
            }
            else{
                InterestRate.find({
                    term : req.params.id,
                }).then(function(interestRates){
                    interestRates.forEach(myFunction);
                    function myFunction(item){
                        InterestRate.findByIdAndDelete({
                            _id : item._id,
                        })
                    }
                    Term.findByIdAndDelete({
                        _id : req.params.id,
                    }).then(function(){
                        req.session.message = {
                            type: 'success',
                            intro: 'Th??nh c??ng !',
                            message: `X??a g??i d???ch v??? th??nh c??ng !`,
                        }
                        res.redirect('/admin/settingBankBook/managemnetTerm');
                    })
                })
            }
        })
    }

    //[POST] : admin/checkCreateBankBook 
    checkCreateBankBook(req, res, next){
        const tenTK = executeCookie(req, 'getTenTK'); 
        const Admin = executeCookie(req, 'checkAdmin');
        const tenGoiTietKiem = req.body.tenGoiTietKiem; 
        const laiSuat = req.body.laiSuat.split('%');
        const image = req.body.image; 
        const description = req.body.description; 
        Term.findOne({
            tenGoiTietKiem : tenGoiTietKiem
        }).then(function(term){
            if (term != null){
                req.session.message = {
                    type: 'danger',
                    intro: 'Th???t b???i !',
                    message: `T??n g??i ti???t ki???m b???n mu???n t???o ???? t???n t???i 
                    vui l??ng nh???p 1 t??n kh??c !`,
                }
                res.render('admin/addsavemoney', {
                    tenTK : tenTK, 
                    Admin : Admin,
                    message : req.session.message,
                })
            }
            else {
                Term.create({
                    tenGoiTietKiem : tenGoiTietKiem, 
                    laiSuat : parseFloat((parseFloat(laiSuat[0]) / 100)
                    .toFixed(2)), 
                    image : image, 
                    description : description,
                })
                .then(function(){
                    req.session.message = {
                        type: 'success',
                        intro: 'Th??nh c??ng !',
                        message: `???? t???o th??nh c??ng g??i ti???t ki???m ${tenGoiTietKiem} !`,
                    }
                    res.redirect('/admin/settingBankBook');
                })
            }
        })
    }

    //[GET] : admin/addInterestRate 
    addInterestRate(req, res, next){
        Term.find().then(function(terms){
            const tenTK = executeCookie(req, 'getTenTK'); 
            const Admin = executeCookie(req, 'checkAdmin');
            
            res.render('admin/addInterestRate', {
                terms : mutipleMongooseToObject(terms),
                tenTK : tenTK, 
                Admin : Admin,
                message : req.session.message,
            })
        })
    }

    //[GET] : admin/addInterestRate/checkAddInterestRate
    checkAddInterestRate(req, res, next){
        const tenTK = executeCookie(req, 'getTenTK'); 
        const Admin = executeCookie(req, 'checkAdmin');

        req.body.tenGoi = req.body.tenGoi.split('G??i ');
        const tenGoiTietKiem = req.body.tenGoi[1];
        const laiSuat = req.body.laiSuat;

        Term.findOne({
            tenGoiTietKiem : tenGoiTietKiem,
        }).then(function(term){
            var id = term._id;
            var lai = laiSuat.split('%');
            InterestRate.findOne({
                kyHan : req.body.tenLaiSuat, 
                term : id,
            }).then(function(interestRate){
                if (interestRate != null){
                    req.session.message = {
                        type: 'danger',
                        intro: 'Th???t b???i !',
                        message: `K??? h???n b???n mu???n t???o ???? t???n t???i !`,
                    }; 
                    Term.find().then(function(terms){
                        res.render('admin/addInterestRate', {
                            terms : mutipleMongooseToObject(terms),
                            tenTK : tenTK, 
                            Admin : Admin,
                            message : req.session.message,
                        })
                    })
                    
                }
                else {
                    InterestRate.create({
                        laiSuat : parseFloat((parseFloat(lai[0]) / 100).toFixed(3)),
                        term : id,
                        kyHan : req.body.tenLaiSuat,
                    }).then(function(){
                        req.session.message = {
                            type: 'success',
                            intro: 'Th??nh c??ng !',
                            message: `???? th??m th??nh c??ng k??? h???n ${req.body.tenLaiSuat} cho g??i ${tenGoiTietKiem} !`,
                        }; 
                        Term.find().then(function(terms){
                            res.render('admin/addInterestRate', {
                                terms : mutipleMongooseToObject(terms),
                                tenTK : tenTK, 
                                Admin : Admin,
                                message : req.session.message,
                            })
                        })
                    })
                }
            })
        })
    }

    //[GET] : admin/managementUser/ 
    managementUser(req, res, next){
        const tenTK = executeCookie(req, 'getTenTK'); 
        const Admin = executeCookie(req, 'checkAdmin');
        Customer.find().then(function(customers){
            res.render('admin/admincustomer',{
                customers : mutipleMongooseToObject(customers),
                tenTK : tenTK, 
                Admin : Admin,
                message : req.session.message,
            });
        })
    }

    //[GET] : admin/managementUser/:id/deleteUser/ 
    deleteUser(req, res, next){
        Passbook.findOne({
            customer : req.params.id, 
        }).then(function(passbook){
            if(passbook){
                req.session.message = {
                    type: 'danger',
                    intro: 'L???i !',
                    message: `Vui l??ng y??u c???u kh??ch h??ng 
                    h??y t???t to??n h???t c??c g??i ti???t ki???m tr?????c khi x??a !`,
                }; 
                res.redirect('/admin/managementUser');
            }
            else{
                Customer.findOne({
                    _id : req.params.id, 
                })
                .populate('account')
                .then(function(customer){
                    if(parseFloat(customer.account.soDu) > 0 ){
                        req.session.message = {
                            type: 'danger',
                            intro: 'L???i !',
                            message: `Vui l??ng y??u c???u kh??ch h??ng r??t 
                            h???t s??? ti???n trong t??i kho???n tr?????c khi x??a !`,
                        }; 
                        res.redirect('/admin/managementUser')
                    }
                    else {
                        Customer.findOneAndDelete({
                            _id : req.params.id, 
                        }).then(function(){
                            req.session.message = {
                                type: 'success',
                                intro: 'Th??nh c??ng !',
                                message: `X??a th??nh c??ng !`,
                            }; 
                            res.redirect('/admin/managementUser')
                        })
                    }
                })
            }
        })
    }

    //[GET] : admin/managementUser/:id/updateUser/
    updateUser(req, res, next){
        const tenTK = executeCookie(req, 'getTenTK'); 
        const Admin = executeCookie(req, 'checkAdmin');
        Customer.findById({
            _id : req.params.id,
        }).then(function(customer){
            res.render('admin/editcustomer',{
                customer : mongooseToObject(customer),
                tenTK : tenTK, 
                Admin : Admin,
            })
        })
    }

    //[POST] : admin/managementUser/:id/updateUser/checkUpdateUser 
    checkUpdateUser(req, res, next){
        Customer.findByIdAndUpdate({
            _id : req.params.id,
        }, {
            tenKH : req.body.tenKH, 
            email : req.body.email, 
            CCCD : req.body.CCCD, 
            ngaySinh : req.body.ngaySinh, 
            quyen : req.body.quyen,
        }).then(function(){
            req.session.message = {
                type: 'success',
                intro: 'Th??nh c??ng !',
                message: `C???p nh???t ng?????i d??ng th??nh c??ng !`,
            }; 
            res.redirect('/admin/managementUser')
        })
    }
}

module.exports = new AdminController();