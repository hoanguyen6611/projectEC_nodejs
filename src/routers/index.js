const siteRouter = require('./site');
const userRouter = require('./users');
function route(app) {
    app.use('/', siteRouter);
    app.use('/users',userRouter);
}
module.exports = route;
