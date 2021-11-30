const Customer = require('../models/customer.model');
const Term = require('../models/term.model');
const InterestRate = require('../models/interestRate.model');
const Passbook = require('../models/passbook.model');
const Account = require('../models/account.model');
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
            res.render('customer/chooseasb', {
                terms : mutipleMongooseToObject(terms)
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
                    if (req.session.message){
                        res.render('customer/accountsave', {
                            soTK : cus_Info.soTK, 
                            soDu : cus_Info.account.soDu, 
                            interestRates : mutipleMongooseToObject(interestRates),
                            termId : req.params.id,
                            message : req.session.message,
                        })
                    }
                    else{
                        res.render('customer/accountsave', {
                            soTK : cus_Info.soTK, 
                            soDu : cus_Info.account.soDu, 
                            interestRates : mutipleMongooseToObject(interestRates),
                            termId : req.params.id,
                        })
                    }
                }
            )
        })
    }

    //[PUT] : term/checkSavingMoney
    checkSavingMoney(req, res, next){

        const soDu = parseFloat(req.body.soDu);
        const tienGui = parseFloat(req.body.tienGui);
        const laiSuat = parseFloat(parseFloat(req.body.laiSuat) / 100).toFixed(3);
        const ngayGui = req.body.ngayDaoHan.split(' / ');
        const ngay = ngayGui[0]; 
        const thang = ngayGui[1];
        const nam = ngayGui[2];
        const ngayDaoHan = new Date(`${nam}, ${thang}, ${ngay}`); 
        console.log(laiSuat);
        console.log(ngayGui, ngay, thang, nam, ngayDaoHan);
        console.log(mongoose.Types.ObjectId(req.body.termId));

        if (req.body.tienGui === '' || req.body.laiSuat === '' || req.body.ngayDaoHan === '' || tienGui === 0){
            req.session.message = {
                type: 'danger',
                intro: 'Lỗi ! ',
                message: 'Vui lòng điền đầy đủ thông tin !'
            }
            res.redirect(`/term/${req.body.termId}/openSaving`)
        }
        
        if (tienGui > soDu){
            req.session.message = {
                type: 'danger',
                intro: 'Lỗi ! ',
                message: 'Số tiền bạn muốn gửi tiết kiệm vượt quá số dư !'
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
                        .then(function(){
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