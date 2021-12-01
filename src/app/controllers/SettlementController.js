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
                    const tenTK = executeCookie(req, 'getTenTK'); 
                    res.render('customer/settlementList', 
                    {soTK : cus_Info.soTK, 
                     soDu : cus_Info.account.soDu,
                     passbooks : mutipleMongooseToObject(passbook),
                     tenTK : tenTK,
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
            const tenTK = executeCookie(req, 'getTenTK'); 
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
                tenTK : tenTK,
            });
        })
    }

    //[GET] : settlement/:id/settlementTermNow/
    settlementTermNow(req, res, next){
        Passbook.findById({
            _id : mongoose.Types.ObjectId(req.params.id), 
        })
        .populate('term')
        .populate('interestRate')
        .populate('customer')
        .then(function(passbook){
            var ngayTatToanNgay = new Date(); 
            var ngayGui = new Date(passbook.ngayGui);
            var ngayDaoHan = new Date(passbook.ngayDaoHan); 

            if (parseInt(ngayTatToanNgay.getFullYear()) < parseInt(ngayDaoHan.getFullYear())){

                // Tính số ngày trong năm :
                var ngayDauTienCuaNam = new Date(ngayDaoHan.getFullYear(), '1', '1'); 
                var ngayCuoiCuoiCungCuaNam = new Date(ngayDaoHan.getFullYear(), '12', '31'); 
                var tongSoNgayTrongNam = Math.abs(ngayCuoiCuoiCungCuaNam - ngayDauTienCuaNam);
                tongSoNgayTrongNam = parseInt((tongSoNgayTrongNam/(1000 * 3600 * 24)));

                // Số ngày đã gửi tiết kiệm đến thời điểm muốn tất toán : 
                var tongSoNgayDaGui = Math.abs(ngayTatToanNgay - ngayGui);
                tongSoNgayDaGui = parseInt((tongSoNgayDaGui/(1000 * 3600 * 24)));

                // Tính công thức lãi suất tất toán trước kỳ hạn : [Số tiền gửi] x 0.1% x  [Số ngày gửi được]/[Số ngày trong 1 năm]
                var tienGui = parseFloat(passbook.soTienGui);
                var laiSauTatToan = parseFloat((parseFloat(tienGui) * parseFloat(0.001) * parseFloat(parseInt(tongSoNgayDaGui)/parseInt(tongSoNgayTrongNam))).toFixed(2));
                var soTienTatToan = parseFloat(passbook.soTienGui) + laiSauTatToan;
                
                const token = executeCookie(req, 'getToken'); 
                const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                Customer.findById({
                    _id : decodeToken._id,
                })
                .populate('account')
                .then(function(customer){
                    var soDuSauTatToan = parseFloat(customer.account.soDu); 
                    console.log(soDuSauTatToan);
                    console.log(soTienTatToan);
                    soDuSauTatToan = soDuSauTatToan + parseFloat(soTienTatToan);
                    console.log(soDuSauTatToan);
                    Customer.findById({
                        _id : decodeToken._id,
                    }).then(function(customer){
                        Account.findOneAndUpdate({
                            soTK : customer.soTK,
                        }, {
                            soDu : parseFloat(soDuSauTatToan),
                        }).then(function(){
                            Passbook.findByIdAndDelete({
                                _id : mongoose.Types.ObjectId(req.params.id),
                            }).then(function(){
                                const tenTK = executeCookie(req, 'getTenTK'); 
                                History.create({
                                    customer : decodeToken._id, 
                                    thoiGian : new Date(), 
                                    trangThai : 'Đã tất toán',
                                    soTien : soTienTatToan,
                                });
                                res.redirect('/customer/myAccount', {
                                    tenTK : tenTK,
                                });
                            })
                        })
                    })
                })
            }
            else{
                if ( parseInt(ngayTatToanNgay.getMonth()) < parseInt(ngayDaoHan.getMonth()) ||  parseInt(ngayTatToanNgay.getMonth()) == parseInt(ngayDaoHan.getMonth()) && parseInt(ngayTatToanNgay.getDate()) < parseInt(ngayDaoHan.getDate())){
                        
                    // Tính số ngày trong năm :
                    var ngayDauTienCuaNam = new Date(ngayDaoHan.getFullYear(), '1', '1'); 
                    var ngayCuoiCuoiCungCuaNam = new Date(ngayDaoHan.getFullYear(), '12', '31'); 
                    var tongSoNgayTrongNam = Math.abs(ngayCuoiCuoiCungCuaNam - ngayDauTienCuaNam);
                    tongSoNgayTrongNam = parseInt((tongSoNgayTrongNam/(1000 * 3600 * 24)));

                    // Số ngày đã gửi tiết kiệm đến thời điểm muốn tất toán : 
                    var tongSoNgayDaGui = Math.abs(ngayTatToanNgay - ngayGui);
                    tongSoNgayDaGui = parseInt((tongSoNgayDaGui/(1000 * 3600 * 24)));

                    // Tính công thức lãi suất tất toán trước kỳ hạn : [Số tiền gửi] x 0.1% x  [Số ngày gửi được]/[Số ngày trong 1 năm]
                    var tienGui = parseFloat(passbook.soTienGui);
                    var laiSauTatToan = parseFloat((parseFloat(tienGui) * parseFloat(0.001) * parseFloat(parseInt(tongSoNgayDaGui)/parseInt(tongSoNgayTrongNam))).toFixed(2));
                    var soTienTatToan = parseFloat(passbook.soTienGui) + laiSauTatToan;
                    
                    const token = executeCookie(req, 'getToken'); 
                    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                    Customer.findById({
                        _id : decodeToken._id,
                    })
                    .populate('account')
                    .then(function(customer){
                        var soDuSauTatToan = parseFloat(customer.account.soDu); 
                        console.log(soDuSauTatToan);
                        console.log(soTienTatToan);
                        soDuSauTatToan = soDuSauTatToan + parseFloat(soTienTatToan);
                        console.log(soDuSauTatToan);
                        Customer.findById({
                            _id : decodeToken._id,
                        }).then(function(customer){
                            Account.findOneAndUpdate({
                                soTK : customer.soTK,
                            }, {
                                soDu : parseFloat(soDuSauTatToan),
                            }).then(function(){
                                Passbook.findByIdAndDelete({
                                    _id : mongoose.Types.ObjectId(req.params.id),
                                }).then(function(){
                                    const tenTK = executeCookie(req, 'getTenTK'); 
                                    History.create({
                                        customer : decodeToken._id, 
                                        thoiGian : new Date(), 
                                        trangThai : 'Đã tất toán',
                                        soTien : soTienTatToan,
                                    });
                                    res.redirect('/customer/myAccount', {
                                        tenTK : tenTK,
                                    });
                                })
                            })
                        })
                    })
                }
            }
        })
    }


}

module.exports = new SettlementController();