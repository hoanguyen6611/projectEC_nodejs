const Account = require('../models/account')

class AccountController {
    //[GET]/users/signin
    signIn(req, res, next) {
        res.render('user/signin');
    };
    //[GET]/users/signup
    signUp(req, res, next) {
        res.render('user/signup');
    };
    //[GET]/users/signin
    profile(req, res, next) {
        res.render('user/profile');
    };
    //[GET]/users/accountbank
    accountBank(req, res, next) {
        res.render('user/accountbank');
    };
    //[GET]/users/accountme
    accountMe(req, res, next) {
        res.render('user/accountme');
    };
    //[GET]/users/accountsavebank
    accountSaveBank(req, res, next) {
        res.render('user/accountsavebank');
    }
    //[GET]/users/transhis
    transactionHistory(req, res, next) {
        res.render('user/transactionhis');
    }
    //[GET]/users/accountsave
    accountSave(req, res, next) {
        res.render('user/accountsave');
    }
    //[GET]/users/accountsaveme
    accountSaveMe(req, res, next) {
        res.render('user/accountsaveme');
    }

    //[POST]/users/checkLogin 
    checkLogin(req, res, next){
        Account.findOne({account : req.body.userName, password : req.body.password})
            .then()
        res.render('home');
    }
}
//Public ra ngoài
module.exports = new AccountController();
