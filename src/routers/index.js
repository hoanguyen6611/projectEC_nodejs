const siteRouter = require('./site.route');
const customerRouter = require('./customer.route');
const termRouter = require('./term.route');
const settlementRouter  = require('./settlement.route')
const historyRouter = require('./history.route');
const paypalRouter = require('./paypal.route');

function route(app) {

    app.use('/customer',customerRouter);
    app.use('/term', termRouter);
    app.use('/settlement', settlementRouter);
    app.use('/history', historyRouter);
    app.use('/paypal', paypalRouter);
    app.use('/', siteRouter);
    
}

module.exports = route;
