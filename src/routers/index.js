const siteRouter = require('./site.route');
const customerRouter = require('./customer.route');
function route(app) {

    app.use('/customer',customerRouter);
    app.use('/', siteRouter);
    
}
module.exports = route;
