var express = require('express');
var userRouter = express.Router();
let UserCtrl = require('./userCtrl');
UserCtrl = new UserCtrl;

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", "true");
        next();
    });

    app.get('/', function (req, res) {
        res.redirect('/login');
    });

    app.get('/login', function (req, res) {
        res.render('index.ejs');
    });

    app.get('/blog', function (req, res) {
        res.render('blog.ejs');
    });

    app.get('/create_blog', function (req, res) {
        res.render('create_blog.ejs');
    });

    app.get('/resource', function (req, res) {
        res.render('resource.ejs');
    });

    app.get('/create_resource', function (req, res) {
        res.render('create_resource.ejs');
    });

    app.get('/blog/:id', function (req, res) {
        UserCtrl.getSelectedBlogInfo(req, res).then(function (response) {
            if (response.response) {
                res.render('selected_blog_view.ejs', response);
            } else {
                res.render('404.ejs');
            }
        });
    });

    app.get('/api_details', function (req, res) {
        res.render('api_details.ejs');
    });
};
