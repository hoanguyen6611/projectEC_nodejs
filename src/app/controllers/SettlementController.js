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

class SettlementController{

    //[GET] : settlement/ 
    settlement(req, res, next){
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
                    res.render('customer/settlementList', 
                    {soTK : cus_Info.soTK, 
                     soDu : cus_Info.account.soDu,
                     passbooks : mutipleMongooseToObject(passbook),
                    })
                }
            )
       })
    }

    //[GET] : settlement/:id/viewDetail/ 
    viewDetail(req, res, next){
        Passbook.findById({
            _id : req.params.id,
        })
        .populate('term')
        .populate('interestRate')
        .populate('customer')
        .then(function(passbook){
            var ngayHomNay = new Date(); 
            var ngayGui = new Date(passbook.ngayGui); 
            var ngayDaoHan = new Date(passbook.ngayDaoHan);
            var soNgayGuiDenKhiDaoHan = Math.abs(ngayDaoHan - ngayGui);
            soNgayGuiDenKhiDaoHan = (soNgayGuiDenKhiDaoHan/(1000 * 3600 * 24)).toFixed(0);
            var soNgayGuiDenHienTai = Math.abs(ngayHomNay - ngayGui);
            soNgayGuiDenHienTai = (soNgayGuiDenHienTai/(1000 * 3600 * 24)).toFixed(0);
            var phanTramHienThi = ((parseFloat(soNgayGuiDenHienTai/soNgayGuiDenKhiDaoHan)) * 100).toFixed(2);
            var ngGui = ngayGui.getDate(); 
            var thGui = ngayGui.getMonth(); 
            var naGui = ngayGui.getUTCFullYear();
            var ngKT = ngayDaoHan.getDate(); 
            var thKT = ngayDaoHan.getMonth(); 
            var naKT = ngayDaoHan.getFullYear(); 
            var dinhDangNgayBatDau = ngGui.toString() +'/'+ (thGui + 1 ).toString() + '/' + naGui.toString(); 
            var dinhDangNgayKetThuc = ngKT.toString() +'/'+ thKT.toString() + '/' + naKT.toString();
            var tenSo = passbook.term.tenGoiTietKiem; 
            var soTK = passbook.customer.soTK; 
            var laiTamTinh = parseFloat(passbook.soTienGui) + parseFloat((parseFloat(passbook.interestRate.laiSuat) * parseFloat(passbook.soTienGui)).toFixed(2));
            var kyHanVaLaiSuat = passbook.interestRate.kyHan + ' / '+ (parseFloat(passbook.interestRate.laiSuat) * 100).toFixed(1).toString() + '%';
            res.render('customer/accountsavedetail', {
                soTienGui : passbook.soTienGui,
                phanTramHienThi : phanTramHienThi, 
                dinhDangNgayBatDau : dinhDangNgayBatDau, 
                dinhDangNgayKetThuc : dinhDangNgayKetThuc, 
                tenSo : tenSo, 
                soTK : soTK, 
                laiTamTinh : laiTamTinh, 
                kyHanVaLaiSuat : kyHanVaLaiSuat, 
                passbookId : passbook._id,
            });
        })
    }

}

module.exports = new SettlementController();