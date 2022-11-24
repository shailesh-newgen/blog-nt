require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var server = require('http').Server(app);
var fs = require('fs');
var path = require("path");
const conf = require('./conf/conf');
var port = process.env.PORT || conf.port;
app.use(bodyParser.json({limit: '500mb'}));
// app.use(bodyParser.json({type: 'application/vnd.api+json', limit: '500mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));
app.use(cookieParser());

app.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("X-Frame-Options", "DENY");
    next();
});
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
require('./url/user')(app);
require('./api/user')(app);
require('./api/blog')(app);
require('./api/resource')(app);

app.use('/uploads', express.static('uploads'));
app.use(express.static(__dirname + '/public'));
server.listen(port, function () {
    console.log(`Running port on ${port}`);
});
exports = module.exports = app;
