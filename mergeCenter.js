let swaggerDocument = require('./api/api.json');
let user_management = require("./service/user_management");
let aclMiddle = require("./middleware").acl;
let invoice = require("./service/invoice");
let chart = require("./service/chart");
const lodash = require("lodash");
const jwt = require('jsonwebtoken');

const api_spec=lodash.merge(
    swaggerDocument,
    user_management.user.schema,
    invoice.invoice.schema,
    chart.chart_financial.schema,
)
module.exports={
    api_spec,
    app:(app)=>{
        app.use('',user_management.user.routs)
        app.use('',user_management.public.routs)
        app.use('', passport.authenticate('jwt', { session: false }), user_management.admin.routs);
        app.use('', passport.authenticate('jwt', { session: false }),(req,res,next)=>{aclMiddle.decodeToken(req,res,next)}, invoice.invoice.routs);
        app.use('', passport.authenticate('jwt', { session: false }),(req,res,next)=>{aclMiddle.decodeToken(req,res,next)}, chart.chart_network.routs);
        app.use('', passport.authenticate('jwt', { session: false }),(req,res,next)=>{aclMiddle.decodeToken(req,res,next)}, chart.chart_financial.routs);
    }
}