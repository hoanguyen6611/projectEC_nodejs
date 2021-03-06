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
require('dotenv').config()

class TermController {

    //[GET] : term/ : 
    term(req, res, next){
        Term.find({

        })
        .then(function(terms){
            const tenTK = executeCookie(req, 'getTenTK');
            const Admin = executeCookie(req, 'checkAdmin') 
            res.render('customer/chooseasb', {
                terms : mutipleMongooseToObject(terms),
                tenTK : tenTK,
                Admin : Admin,
            })
        })
    }

    openSaving(req, res, next){
        const token = executeCookie(req, 'getToken'); 
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        Customer.findById({
            _id : decodeToken._id 
        })
        .populate('account')
        .then(function(customer){
            var cus_Info = customer; 
            InterestRate.find({
                term : req.params.id, 
            }).then(function(interestRates)
                {
                    const tenTK = executeCookie(req, 'getTenTK'); 
                    const Admin = executeCookie(req, 'checkAdmin')
                    if (req.session.message){
                        res.render('customer/accountsave', {
                            soTK : cus_Info.soTK, 
                            soDu : cus_Info.account.soDu, 
                            interestRates : mutipleMongooseToObject(interestRates),
                            termId : req.params.id,
                            message : req.session.message,
                            tenTK : tenTK,
                            Admin : Admin,
                        })
                    }
                    else{
                        res.render('customer/accountsave', {
                            soTK : cus_Info.soTK, 
                            soDu : cus_Info.account.soDu, 
                            interestRates : mutipleMongooseToObject(interestRates),
                            termId : req.params.id,
                            tenTK : tenTK,
                            Admin : Admin,
                        })
                    }
                }
            )
        })
    }

    //[PUT] : term/checkSavingMoney
    checkSavingMoney(req, res, next){

        const soDu = parseFloat(req.body.soDu);

        var tienGui = 0;
        var ngayDaoHan = '';

        if (req.body.ngayDaoHan != ''){
            ngayDaoHan = req.body.ngayDaoHan;
        }

        if (req.body.tienGui != ''){
            tienGui = parseFloat(req.body.tienGui);
        }

        const laiSuat = parseFloat(parseFloat(req.body.laiSuat) / 100).toFixed(3);
        const ngayGui = req.body.ngayDaoHan.split(' / ');
        const ngay = ngayGui[0]; 
        const thang = ngayGui[1];
        const nam = ngayGui[2];
        
        if (ngayDaoHan == '' || parseInt(tienGui) == 0){
            req.session.message = {
                type: 'danger',
                intro: 'L???i ! ',
                message: 'Vui l??ng ??i???n ?????y ????? th??ng tin !'
            }
            res.redirect(`/term/${req.body.termId}/openSaving`)
        }
        
        if (tienGui > soDu){
            req.session.message = {
                type: 'danger',
                intro: 'L???i ! ',
                message: 'S??? ti???n b???n mu???n g???i ti???t ki???m v?????t qu?? s??? d?? !'
            }
            res.redirect(`/term/${req.body.termId}/openSaving`)
        }
        else
        {
            const soTienConLai = parseFloat(soDu - tienGui);

            Account.findOneAndUpdate({
                soTK : req.body.soTK,
            },{
                soDu : soTienConLai,
            }).then(function(){
                InterestRate.findOne({
                    laiSuat : laiSuat, 
                    term : mongoose.Types.ObjectId(req.body.termId),
                }).then(function(interestRate){
                    const interestRate_Id = interestRate._id;
                    const token = executeCookie(req, 'getToken'); 
                    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                    Customer.findOne({
                        _id : decodeToken._id 
                    })
                    .then(function(customer){
                        var cus_Id = customer._id; 
                        Passbook.create({
                            term : req.body.termId, 
                            soTienGui : tienGui, 
                            ngayGui : new Date(), 
                            ngayDaoHan : new Date(nam, thang, ngay), 
                            customer : cus_Id, 
                            interestRate : interestRate_Id, 
                        })
                        .then(function(passbook){
                            req.session.message = {
                                type: 'success',
                                intro: 'Th??nh c??ng ! ',
                                message: `B???n ???? m??? th??nh c??ng g??i ti???t ki???m v???i s??? ti???n l?? : ${tienGui} !`
                            }
                            History.create({
                                customer : cus_Id, 
                                thoiGian : new Date(), 
                                trangThai : '???? g???i ti???t ki???m',
                                soTien : tienGui,
                            });
                            console.log('So so tiet kiem thanh cong !')
                            res.redirect('/customer/myAccount')
                        })
                    })
                })
            })
        }
    }
}

module.exports = new TermController();