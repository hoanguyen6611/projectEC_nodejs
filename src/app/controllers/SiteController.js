class SiteController {
    //[GET]/home
    index(req, res, next) {
        res.render('home');
    };
}
//Public ra ngoài
module.exports = new SiteController();
