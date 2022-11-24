module.exports = function () {
    const path = require('path');
    const fs = require('fs');
    const conf = require('../conf/conf');
    const con = require('../conf/mysql');

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
            con.query(`select username from user 
                       where username = '${req.body.username}' 
                       and password = '${req.body.password}'`, function (err, result) {
                if (err) throw err;
                if (result.length) {
                    data.response = result[0];
                    resolve(data);
                } else {
                    data.error = true;
                    data.msg = 'Invalid username or password!';
                    resolve(data);
                }
            });
        });
    }

    function blogList(req, res) {
        const response = {
            error: false,
            msg: '',
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
        };
        return new Promise(resolve => {
            con.query(`select count(1) total from blogs limit 1`, function (err, result) {
                if (err) {
                    response.error = true;
                    response.msg = err.message;
                    resolve(response);
                } else {
                    if (result.length) {
                        con.query(`select * from blogs order by created_at desc limit ${req.query.start}, ${req.query.length}`, function (err2, result2) {
                            if (err2) {
                                response.error = true;
                                response.msg = err2.message;
                                resolve(response);
                            } else {
                                if (result2.length) {
                                    for (i of result2) {
                                        response.data.push(Object.values({
                                            title: `<a href="/blog/${i.id}" style="color: #555758;" target="_blank" class="text-capitalize">${i.title}</a>`,
                                            created_at: `<span style="display: flex; justify-content: center;">${new Date(i.created_at).toDateString()}</span>`
                                        })
                                            .concat(`
                                            <button class="btn btn-default btn-sm" onclick="getInfoSelectedBlog(${i.id})" data-toggle="modal" data-target=".bd-example-modal-lg">
                                                <i class="fa fa-info"></i>
                                            </button>
                                            <button class="btn btn-default btn-sm" onclick="getSelectedBlog(${i.id})">
                                                <i class="fa fa-pencil"></i>
                                            </button>
                                            <button class="btn btn-default btn-sm" onclick="deleteSelectedBlog(${i.id})">
                                                <i class="fa fa-trash"></i>
                                            </button>
                                            `));
                                    }
                                    response.recordsTotal = result[0].total;
                                    response.recordsFiltered = result[0].total;
                                    resolve(response);
                                } else {
                                    response.error = true;
                                    response.msg = 'No data found!'
                                    resolve(response);
                                }
                            }
                        })
                    } else {
                        response.error = true;
                        response.msg = 'No blogs found!'
                        resolve(response);
                    }
                }
            })
        })
    }

    function getBlogById(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            con.query(`select * 
                       from blogs 
                       where id = ${req.params.id} 
                       limit 1`, function (err, result) {
                if (err) throw err;
                if (result.length) {
                    data.response = result[0];
                    resolve({
                        ...data,
                        response: {
                            ...data.response,
                            banner_img: data.response.banner_img ? req.protocol + '://' + req.get('host') + '/uploads/' + data.response.banner_img : ''
                        }
                    });
                } else {
                    data.error = true;
                    data.msg = 'Invalid Blog!';
                    resolve(data);
                }
            });
        });
    }

    function getSelectedBlog(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            con.query(`select * 
                       from blogs 
                       where id = ${req.params.id}
                       limit 1`, function (err, result) {
                if (err) throw err;
                if (result.length) {
                    data.response = result[0];
                    let base64data = '';
                    if (data.response.banner_img) {
                        const imageFilePath = require('path').resolve(__dirname, '../uploads/', data.response.banner_img);
                        try {
                            const extension = data.response.banner_img.split('.')[1];
                            const buff = fs.readFileSync(imageFilePath);
                            base64data = 'data:image/' + extension + ';base64,' + buff.toString('base64');
                        } catch (e) {
                            console.log(e.message);
                        }
                    }
                    resolve({
                        ...data,
                        response: {
                            ...data.response,
                            banner_img: data.response.banner_img,
                            banner_img_base64: base64data
                        }
                    });
                } else {
                    data.error = true;
                    data.msg = 'Invalid Blog!';
                    resolve(data);
                }
            });
        });
    }

    function createBlog(req, res) {
        const data = responseData();
        let imgName = '';
        return new Promise((resolve) => {
            if (req.body.banner_img) {
                const extension = req.body.banner_img.split(':')[1].split(';')[0].split('/')[1];
                const base64Data = req.body.banner_img.replace('data:image/' + extension + ';base64,', '');
                imgName = (JSON.stringify(new Date()).split('.').join('').split(':').join('').split('-').join('').split('"').join('')) + '.' + extension;
                require("fs").writeFileSync('uploads/' + imgName, new Buffer(base64Data, 'base64'));
            }
            con.query(`insert into blogs(title, banner_img, short_desc, content) values(?, ?, ?, ?)`,
                [
                    req.body.title,
                    imgName,
                    req.body.short_desc,
                    req.body.content
                ], function (err, result) {
                    if (err) {
                        data.error = true;
                        data.msg = err.message;
                        resolve(data);
                    } else {
                        data.msg = 'successfully created!';
                        req.body['id'] = result.insertId;
                        data.response = {
                            ...req.body,
                            banner_img: imgName ? 'uploads/' + imgName : '',
                            created_at: new Date()
                        };
                        resolve(data);
                    }
                });
        });
    }

    function updateBlogById(req, res) {
        const data = responseData();
        let imgName = '';
        return new Promise((resolve) => {
            con.query(`select banner_img 
                       from blogs
                       where id = ${req.params.id} 
                       limit 1`, function (err1, result1) {
                if (err1) {
                    data.error = true;
                    data.msg = err1.message;
                    resolve(data);
                } else {
                    if (result1[0].banner_img) {
                        try {
                            fs.unlinkSync(path.resolve(__dirname, '../uploads/', result1[0].banner_img))
                        } catch (e) {
                            console.log(e.message);
                        }
                    } else {
                        try {
                            fs.unlinkSync(path.resolve(__dirname, '../uploads/', result1[0].banner_img))
                        } catch (e) {
                            console.log(e.message);
                        }
                    }

                    if (req.body.banner_img_base64) {
                        const extension = req.body.banner_img_base64.split(':')[1].split(';')[0].split('/')[1];
                        const base64Data = req.body.banner_img_base64.replace('data:image/' + extension + ';base64,', '');
                        imgName = (JSON.stringify(new Date()).split('.').join('').split(':').join('').split('-').join('').split('"').join('')) + '.' + extension;
                        fs.writeFileSync('uploads/' + imgName, new Buffer(base64Data, 'base64'));
                    }
                    con.query(`update blogs 
                               set title = ?,
                                   banner_img = ?,
                                   short_desc = ?,
                                   content = ?
                               where id = ?
                               limit 1`,
                        [
                            req.body.title,
                            imgName,
                            req.body.short_desc,
                            req.body.content,
                            req.params.id
                        ], function (err, result) {
                            if (err) {
                                data.error = true;
                                data.msg = err.message;
                                resolve(data);
                            } else {
                                data.msg = 'successfully updated!';
                                data.response = req.body;
                                resolve(data);
                            }
                        });
                }
            })
        });
    }

    function deleteBlogById(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            con.query(`select banner_img 
                       from blogs
                       where id = ${req.params.id} 
                       limit 1`, function (err1, result1) {
                if (err1) {
                    data.error = true;
                    data.msg = err1.message;
                    resolve(data);
                } else {
                    if (result1[0].banner_img) {
                        try {
                            fs.unlinkSync(path.resolve(__dirname, '../uploads/', result1[0].banner_img))
                        } catch (e) {
                            console.log(e.message);
                        }
                    }
                    con.query(`delete from blogs
                               where id = ${req.params.id}
                               limit 1`, function (err, result) {
                        if (err) {
                            data.error = true;
                            data.msg = err.message;
                            resolve(data);
                        } else {
                            data.msg = 'successfully deleted!';
                            resolve(data);
                        }
                    });
                }
            });
        });
    }

    function getBlogs(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            con.query(`select * from blogs order by created_at desc limit ${req.query.start}, ${req.query.length}`,
                [req.params.id], function (err, result) {
                    if (err) {
                        data.error = true;
                        data.msg = err.message;
                        resolve(data);
                    } else {
                        data.response = result
                        resolve({
                            ...data,
                            response: data.response.map(d => ({
                                ...d,
                                banner_img: d.banner_img ? req.protocol + '://' + req.get('host') + '/uploads/' + d.banner_img : ''
                            }))
                        });
                    }
                });
        });
    }

    return {
        Login,
        blogList,
        getBlogById,
        createBlog,
        updateBlogById,
        deleteBlogById,
        getBlogs,
        getSelectedBlog
    }
};
