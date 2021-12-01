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
const { parse } = require('dotenv');
require('dotenv').config()

class SystemController {
    
    async expire(){
        const tatCaGoiTietKiem = mutipleMongooseToObject(await Passbook.find()); 
        tatCaGoiTietKiem.forEach(async (passbook) => {

            const interestRate = mongooseToObject(await InterestRate.findById(passbook.interestRate));
            const customer = mongooseToObject(await Customer.findById(passbook.customer));
            const term = mongooseToObject(await Term.findById(passbook.term));

            if (passbook._id == '61a720a543d733d6664e4650'){
                console.log(interestRate);
                console.log(customer);
                console.log(term);
            }

            // Cập nhật giá trị ngày xét :
            var ngayHomNay = new Date(); 

            // Lấy giá trị ngày đáo hạn của sổ tiết kiệm đang xét :
            var ngayDaoHan = new Date(passbook.ngayDaoHan); 

            // Tách ngày tháng năm của ngày xét :
            var ngHN = ngayHomNay.getDate(); 
            var tgHN = ngayHomNay.getMonth(); 
            var nmHN = ngayHomNay.getFullYear();

            console.log(`Ngay hom nay ${ngHN}/ ${tgHN}/ ${nmHN}`); 


            // Tách ngày tháng năm của ngày đáo hạn : 
            var ngDH = ngayDaoHan.getDate(); 
            var tgDH = ngayDaoHan.getMonth(); 
            var nmDH = ngayDaoHan.getFullYear(); 

            console.log(`Ngay tat toan ${ngDH}/ ${tgDH}/ ${nmDH}`)

            if (parseInt(ngHN) == (parseInt(ngDH) - 1) && parseInt(tgHN) == parseInt(tgDH) && parseInt(nmHN) == parseInt(nmDH)){

                // Tính toán số tiền trong gói tiết kiệm khi đến ngày đáo hạn :
                var laiSuat = parseFloat(interestRate.laiSuat); 
                var soTienGui = parseFloat(passbook.soTienGui); 
                const soTienSauKhiTinhLai = parseFloat(soTienGui + soTienGui * laiSuat);

                // Tiến hành cập nhật lại thông tin sổ tiết kiệm để chuyển sang kỳ hạn tiếp theo : 
                const ngayGui = new Date(); 
                var ngayDaoHan = new Date();

                if (interestRate.kyHan == '3 Tháng'){
                    const deadTime = new Date();
                    deadTime.setDate(deadTime.getDate());
                    const date = deadTime.getDate();
                    deadTime.setMonth(deadTime.getMonth() + 4);
                    const year = deadTime.getFullYear();
                    if (parseInt(year) % 4 == 0 || parseInt(year) % 400 == 0)
                    {
                        if (parseInt(date) == 30 && parseInt(deadTime.getMonth()) == 2)
                        {
                            deadTime.setDate(29);
                        }
                    }
                    else {
                        if (parseInt(date) == 30 && parseInt(deadTime.getMonth()) == 2 || parseInt(date) == 29 && parseInt(deadTime.getMonth()) == 2)
                        {
                            deadTime.setDate(28);
                        }
                    }

                    ngayDaoHan = new Date(deadTime.getFullYear(), deadTime.getMonth(), deadTime.getDate());   
                }
                else if (interestRate.kyHan == '6 Tháng'){
                    const deadTime = new Date();
                    deadTime.setDate(deadTime.getDate());
                    const date = deadTime.getDate();
                    deadTime.setMonth(deadTime.getMonth() + 7);
                    const year = deadTime.getFullYear();
                    if (parseInt(year) % 4 == 0 || parseInt(year) % 400 == 0)
                    {
                        if (parseInt(date) == 30 && parseInt(deadTime.getMonth()) == 2)
                        {
                            deadTime.setDate(29);
                        }
                    }
                    else {
                        if (parseInt(date) == 30 && parseInt(deadTime.getMonth()) == 2 || parseInt(date) == 29 && parseInt(deadTime.getMonth()) == 2)
                        {
                            deadTime.setDate(28);
                        }
                        ngayDaoHan = new Date(deadTime.getFullYear().toString(), deadTime.getMonth().toString(), deadTime.getDate().toString());  
                    }
                }

                let newPassbook = {
                    soTienGui : soTienSauKhiTinhLai, 
                    ngayGui : ngayGui, 
                    ngayDaoHan : ngayDaoHan, 
                    customer : customer._id, 
                    interestRate : interestRate._id, 
                    term : term._id,
                }

                //Tiến hành cập nhật sổ : 

                await Passbook.findByIdAndUpdate(passbook._id, newPassbook, {new : true});
                console.log(`So ${passbook._id} da tat toan va gia han them ky han ${interestRate.kyHan} !`);
            }
            else{
                console.log(`So ${passbook._id} chua den ky han tat toan !`)
            }

        })
    }

}
//Public ra ngoài
module.exports = new SystemController();
