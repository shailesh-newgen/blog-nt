module.exports = function (app) {
    let UserCtrl = require('./userCtrl');
    UserCtrl = new UserCtrl;

    app.post('/login', function (req, res) {
        UserCtrl.Login(req, res).then(function (response) {
            res.send(response);
        });
    });
};
