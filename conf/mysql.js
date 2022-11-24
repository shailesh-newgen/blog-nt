const mysql = require('mysql');
const conf = require('./conf').mysql;
const con = mysql.createConnection({
    host: conf.host,
    user: conf.username,
    database: conf.database,
    password: conf.password
});

con.connect(function (err) {
    if (err) throw err.message;
    console.log("MySql connected!");
});
// const con = {};
module.exports = con;
