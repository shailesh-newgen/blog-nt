module.exports = function () {
    const pg = require('../conf/pg');

    function responseData() {
        return {
            msg: "",
            error: false,
            response: ""
        };
    }

    function getSelectedBlogInfo(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`select * from blogs where id = ${req.params.id} limit 1`, function (err, result) {
                if (err) {
                    data.error = true;
                    data.msg = err.message;
                    resolve(data);
                } else {
                    data.response = {
                        ...result.rows[0],
                        ...result.rows[0].response,
                        created_at: new Date(result.rows[0].created_at).toDateString()
                    };
                    resolve(data);
                }
            });
        });
    }

    return {
        getSelectedBlogInfo
    }
}