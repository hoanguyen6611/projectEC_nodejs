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
                intro: 'Thành công !',
                message: `Cập nhật gói tiết kiệm thành công !`,
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
                    intro: 'Thất bại !',
                    message: `Hiện tại vẫn còn khách hàng sử dụng 
                    dịch vụ nên không thể thực hiện thao tác này !`,
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
                            intro: 'Thành công !',
                            message: `Xóa gói dịch vụ thành công !`,
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
                    intro: 'Thất bại !',
                    message: `Tên gói tiết kiệm bạn muốn tạo đã tồn tại vui lòng nhập 1 tên khác !`,
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
                    laiSuat : parseFloat((parseFloat(laiSuat[0]) / 100).toFixed(2)), 
                    image : image, 
                    description : description,
                })
                .then(function(){
                    req.session.message = {
                        type: 'success',
                        intro: 'Thành công !',
                        message: `Đã tạo thành công gói tiết kiệm ${tenGoiTietKiem} !`,
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

        req.body.tenGoi = req.body.tenGoi.split('Gói ');
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
                        intro: 'Thất bại !',
                        message: `Kỳ hạn bạn muốn tạo đã tồn tại !`,
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
                            intro: 'Thành công !',
                            message: `Đã thêm thành công kỳ hạn ${req.body.tenLaiSuat} cho gói ${tenGoiTietKiem} !`,
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
                    intro: 'Lỗi !',
                    message: `Vui lòng yêu cầu khách hàng 
                    hãy tất toán hết các gói tiết kiệm trước khi xóa !`,
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
                            intro: 'Lỗi !',
                            message: `Vui lòng yêu cầu khách hàng rút 
                            hết số tiền trong tài khoản trước khi xóa !`,
                        }; 
                        res.redirect('/admin/managementUser')
                    }
                    else {
                        Customer.findOneAndDelete({
                            _id : req.params.id, 
                        }).then(function(){
                            req.session.message = {
                                type: 'success',
                                intro: 'Thành công !',
                                message: `Xóa thành công !`,
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
            password : req.body.password, 
            quyen : req.body.quyen,
        }).then(function(){
            req.session.message = {
                type: 'success',
                intro: 'Thành công !',
                message: `Cập nhật người dùng thành công !`,
            }; 
            res.redirect('/admin/managementUser')
        })
    }
}

module.exports = new AdminController();