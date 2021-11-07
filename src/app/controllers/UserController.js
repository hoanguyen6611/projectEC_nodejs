class UserController {
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
}
//Public ra ngoài
module.exports = new UserController();
