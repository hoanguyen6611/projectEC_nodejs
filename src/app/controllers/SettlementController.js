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
                    const Admin = executeCookie(req, 'checkAdmin');
                    res.render('customer/settlementList', 
                    {soTK : cus_Info.soTK, 
                     soDu : cus_Info.account.soDu,
                     passbooks : mutipleMongooseToObject(passbook),
                     tenTK : tenTK,
                     Admin : Admin,
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
            const Admin = executeCookie(req, 'checkAdmin')
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
                Admin : Admin,
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

                // T??nh s??? ng??y trong n??m :
                var ngayDauTienCuaNam = new Date(ngayDaoHan.getFullYear(), '1', '1'); 
                var ngayCuoiCuoiCungCuaNam = new Date(ngayDaoHan.getFullYear(), '12', '31'); 
                var tongSoNgayTrongNam = Math.abs(ngayCuoiCuoiCungCuaNam - ngayDauTienCuaNam);
                tongSoNgayTrongNam = parseInt((tongSoNgayTrongNam/(1000 * 3600 * 24)));

                // S??? ng??y ???? g???i ti???t ki???m ?????n th???i ??i???m mu???n t???t to??n : 
                var tongSoNgayDaGui = Math.abs(ngayTatToanNgay - ngayGui);
                tongSoNgayDaGui = parseInt((tongSoNgayDaGui/(1000 * 3600 * 24)));

                // T??nh c??ng th???c l??i su???t t???t to??n tr?????c k??? h???n : [S??? ti???n g???i] x 0.1% x  [S??? ng??y g???i ???????c]/[S??? ng??y trong 1 n??m]
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
                                req.session.message = {
                                    type : 'success', 
                                    intro: 'Th??nh c??ng ! ',
                                    message: `???? t???t to??n th??nh c??ng s??? ti???n ${soTienTatToan.toFixed(2)} !`,
                                };
                                History.create({
                                    customer : decodeToken._id, 
                                    thoiGian : new Date(), 
                                    trangThai : '???? t???t to??n',
                                    soTien : soTienTatToan,
                                });
                                res.redirect('/customer/myAccount');
                            })
                        })
                    })
                })
            }
            else{
                if ( parseInt(ngayTatToanNgay.getMonth()) < parseInt(ngayDaoHan.getMonth()) ||  parseInt(ngayTatToanNgay.getMonth()) == parseInt(ngayDaoHan.getMonth()) && parseInt(ngayTatToanNgay.getDate()) < parseInt(ngayDaoHan.getDate())){
                        
                    // T??nh s??? ng??y trong n??m :
                    var ngayDauTienCuaNam = new Date(ngayDaoHan.getFullYear(), '1', '1'); 
                    var ngayCuoiCuoiCungCuaNam = new Date(ngayDaoHan.getFullYear(), '12', '31'); 
                    var tongSoNgayTrongNam = Math.abs(ngayCuoiCuoiCungCuaNam - ngayDauTienCuaNam);
                    tongSoNgayTrongNam = parseInt((tongSoNgayTrongNam/(1000 * 3600 * 24)));

                    // S??? ng??y ???? g???i ti???t ki???m ?????n th???i ??i???m mu???n t???t to??n : 
                    var tongSoNgayDaGui = Math.abs(ngayTatToanNgay - ngayGui);
                    tongSoNgayDaGui = parseInt((tongSoNgayDaGui/(1000 * 3600 * 24)));

                    // T??nh c??ng th???c l??i su???t t???t to??n tr?????c k??? h???n : [S??? ti???n g???i] x 0.1% x  [S??? ng??y g???i ???????c]/[S??? ng??y trong 1 n??m]
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
                        soDuSauTatToan = soDuSauTatToan + parseFloat(soTienTatToan.toFixed(2));
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
                                    req.session.message = {
                                        type : 'success', 
                                        intro: 'Th??nh c??ng ! ',
                                        message: `???? t???t to??n th??nh c??ng s??? ti???n ${soTienTatToan.toFixed(2)} !`,
                                    };
                                    History.create({
                                        customer : decodeToken._id, 
                                        thoiGian : new Date(), 
                                        trangThai : '???? t???t to??n',
                                        soTien : soTienTatToan,
                                    });
                                    res.redirect('/customer/myAccount');
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