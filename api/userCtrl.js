module.exports = function () {
    const path = require('path');
    const fs = require('fs');
    const pg = require('../conf/pg');

    function responseData() {
        return {
            msg: "",
            error: false,
            response: ""
        };
    }

    function Login(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`select * 
                      from users
                      where username = $1 
                      and password = $2`,
                [
                    req.body.username,
                    req.body.password
                ], (err, res) => {
                    if (err) {
                        data.error = true;
                        data.msg = err.message;
                        resolve(data);
                    } else {
                        if (res.rows.length) {
                            data.response = res.rows[0];
                            resolve(data);
                        } else {
                            data.error = true;
                            data.msg = 'Invalid username or password!';
                            resolve(data);
                        }
                    }
                })
        });
    }

    



    return {
        Login
    }
}
