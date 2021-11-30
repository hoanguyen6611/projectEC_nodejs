const siteRouter = require('./site.route');
const customerRouter = require('./customer.route');
const termRouter = require('./term.route');
const settlementRouter  = require('./settlement.route')

function route(app) {

    app.use('/customer',customerRouter);
    app.use('/term', termRouter);
    app.use('/settlement', settlementRouter);
    app.use('/', siteRouter);
    
}

module.exports = route;
