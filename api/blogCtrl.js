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

    function getIndustry(req) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`select * 
                      from industry`, (err, res) => {
                if (err) {
                    data.error = true;
                    data.msg = err.message;
                    resolve(data);
                } else {
                    if (res.rows.length) {
                        data.response = res.rows;
                        resolve(data);
                    } else {
                        data.error = true;
                        data.msg = 'No data found!';
                        resolve(data);
                    }
                }
            })
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
            pg.query(`select count(1) total from blogs limit 1`, function (err, result) {
                if (err) {
                    response.error = true;
                    response.msg = err.message;
                    resolve(response);
                } else {
                    if (result.rows.length) {
                        pg.query(`
                                SELECT
                                    blogs.id,
                                    blogs.title,
                                    industry.industry_name,
                                    blogs.created_at
                                FROM
                                    blogs
                                LEFT JOIN industry ON industry.id = blogs.industry_id
                                ORDER BY blogs.created_at DESC
                                OFFSET $1
                                LIMIT $2`,
                            [
                                req.query.start,
                                req.query.length
                            ], function (err2, result2) {
                                if (err2) {
                                    response.error = true;
                                    response.msg = err2.message;
                                    resolve(response);
                                } else {
                                    if (result2.rows.length) {
                                        for (i of result2.rows) {
                                            response.data.push(Object.values({
                                                title: `<a href="/blog/${i.id}" style="color: #555758;" target="_blank" class="text-capitalize">${i.title}</a>`,
                                                industry: `<span class="text-capitalize">${i.industry_name ? i.industry_name : ''}</span>`,
                                                created_at: `<span style="display: flex; justify-content: center;">${new Date(i.created_at).toDateString()}</span>`
                                            })
                                                .concat(`
                                            <div class="btn-group">
                                                <button class="btn btn-default btn-sm" onclick="getInfoSelectedBlog(${i.id})" data-toggle="modal" data-target=".bd-example-modal-lg">
                                                    <i class="fa fa-info"></i>
                                                </button>
                                                <button class="btn btn-default btn-sm" onclick="getSelectedBlog(${i.id})">
                                                    <i class="fa fa-pencil"></i>
                                                </button>
                                                <button class="btn btn-default btn-sm" onclick="deleteSelectedBlog(${i.id}, '${i.title}')">
                                                    <i class="fa fa-trash"></i>
                                                </button>
                                            </div>
                                            `));
                                        }
                                        response.recordsTotal = result.rows[0].total;
                                        response.recordsFiltered = result.rows[0].total;
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
            pg.query(`select blogs.id,
                             blogs.title,
                             blogs.banner_img,
                             industry.industry_name,
                             blogs.short_desc,
                             blogs.content,
                             blogs.created_at
                       from blogs 
                       left join industry
                       on blogs.industry_id = industry.id
                       where blogs.id = $1 
                       limit 1`, [req.params.id], function (err, result) {
                if (err) throw err;
                if (result.rows.length) {
                    data.response = result.rows[0];
                    resolve(data);
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
            pg.query(`select * 
                       from blogs 
                       where id = $1 
                       limit 1`, [req.params.id], function (err, result) {
                if (err) throw err;
                if (result.rows.length) {
                    data.response = result.rows[0];
                    // let base64data = '';
                    // if (data.response.banner_img) {
                    //     const imageFilePath = require('path').resolve(__dirname, '../uploads/', data.response.banner_img);
                    //     try {
                    //         const extension = data.response.banner_img.split('.')[1];
                    //         const buff = fs.readFileSync(imageFilePath);
                    //         base64data = 'data:image/' + extension + ';base64,' + buff.toString('base64');
                    //     } catch (e) {
                    //         console.log(e.message);
                    //     }
                    // }
                    resolve(data);
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
            if (req.body.industry.length > 0) {
                (async function loop() {
                    for (let i = 0; i < req.body.industry.length; i++) {
                        await new Promise(resolve2 => {
                            // if (req.body.banner_img) {
                            //     const extension = req.body.banner_img.split(':')[1].split(';')[0].split('/')[1];
                            //     const base64Data = req.body.banner_img.replace('data:image/' + extension + ';base64,', '');
                            //     imgName = (JSON.stringify(new Date()).split('.').join('').split(':').join('').split('-').join('').split('"').join('')) + '.' + extension;
                            //     fs.writeFileSync('uploads/' + imgName, new Buffer(base64Data, 'base64'));
                            // }
                            pg.query(`insert into blogs(title, banner_img, short_desc, content, industry_id) 
                                      values($1, $2, $3, $4, $5)`,
                                [
                                    req.body.title,
                                    req.body.banner_img,
                                    req.body.short_desc,
                                    req.body.content,
                                    req.body.industry[i]
                                ], function (err, result) {
                                    if (err) {
                                        data.error = true;
                                        data.msg = err.message;
                                        resolve(data);
                                    } else {
                                        resolve2();
                                    }
                                });
                        })
                    }
                    data.error = false;
                    resolve(data);
                })();
            } else {
                // if (req.body.banner_img) {
                //     const extension = req.body.banner_img.split(':')[1].split(';')[0].split('/')[1];
                //     const base64Data = req.body.banner_img.replace('data:image/' + extension + ';base64,', '');
                //     imgName = (JSON.stringify(new Date()).split('.').join('').split(':').join('').split('-').join('').split('"').join('')) + '.' + extension;
                //     fs.writeFileSync('uploads/' + imgName, new Buffer(base64Data, 'base64'));
                // }
                pg.query(`insert into blogs(title, banner_img, short_desc, content) 
                                      values($1, $2, $3, $4)`,
                    [
                        req.body.title,
                        req.body.banner_img,
                        req.body.short_desc,
                        req.body.content
                    ], function (err, result) {
                        if (err) {
                            data.error = true;
                            data.msg = err.message;
                            resolve(data);
                        } else {
                            data.error = false;
                            resolve(data);
                        }
                    });
            }
        });
    }

    function updateBlogById(req, res) {
        const data = responseData();
        let imgName = '';
        return new Promise((resolve) => {
            pg.query(`update blogs 
                        set title = $1,
                            banner_img = $2,
                            short_desc = $3,
                            content = $4
                        where id = $5`,
                [
                    req.body.title,
                    req.body.banner_img_base64,
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
        });
    }
    // function updateBlogById(req, res) {
    //     const data = responseData();
    //     let imgName = '';
    //     return new Promise((resolve) => {
    //         pg.query(`select banner_img 
    //                    from blogs
    //                    where id = $1 
    //                    limit 1`, [req.params.id], function (err1, result1) {
    //             if (err1) {
    //                 data.error = true;
    //                 data.msg = err1.message;
    //                 resolve(data);
    //             } else {
    //                 if (result1.rows[0].banner_img) {
    //                     try {
    //                         fs.unlinkSync(path.resolve(__dirname, '../uploads/', result1.rows[0].banner_img))
    //                     } catch (e) {
    //                         console.log(e.message);
    //                     }
    //                 } else {
    //                     try {
    //                         fs.unlinkSync(path.resolve(__dirname, '../uploads/', result1.rows[0].banner_img))
    //                     } catch (e) {
    //                         console.log(e.message);
    //                     }
    //                 }

    //                 if (req.body.banner_img_base64) {
    //                     const extension = req.body.banner_img_base64.split(':')[1].split(';')[0].split('/')[1];
    //                     const base64Data = req.body.banner_img_base64.replace('data:image/' + extension + ';base64,', '');
    //                     imgName = (JSON.stringify(new Date()).split('.').join('').split(':').join('').split('-').join('').split('"').join('')) + '.' + extension;
    //                     fs.writeFileSync('uploads/' + imgName, new Buffer(base64Data, 'base64'));
    //                 }
    //                 pg.query(`update blogs 
    //                           set title = $1,
    //                               banner_img = $2,
    //                               short_desc = $3,
    //                               content = $4
    //                           where id = $5`,
    //                     [
    //                         req.body.title,
    //                         imgName,
    //                         req.body.short_desc,
    //                         req.body.content,
    //                         req.params.id
    //                     ], function (err, result) {
    //                         if (err) {
    //                             data.error = true;
    //                             data.msg = err.message;
    //                             resolve(data);
    //                         } else {
    //                             data.msg = 'successfully updated!';
    //                             data.response = req.body;
    //                             resolve(data);
    //                         }
    //                     });
    //             }
    //         })
    //     });
    // }

    function deleteBlogById(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`delete from blogs
                      where id = $1`, [req.params.id], function (err, result) {
                if (err) {
                    data.error = true;
                    data.msg = err.message;
                    resolve(data);
                } else {
                    data.msg = 'successfully deleted!';
                    resolve(data);
                }
            });
        });
    }

    // function deleteBlogById(req, res) {
    //     const data = responseData();
    //     return new Promise((resolve) => {
    //         pg.query(`select * 
    //                    from blogs
    //                    where id = $1 
    //                    limit 1`, [req.params.id], function (err1, result1) {
    //             if (err1) {
    //                 data.error = true;
    //                 data.msg = err1.message;
    //                 resolve(data);
    //             } else {
    //                 if (result1.rows[0].banner_img) {
    //                     try {
    //                         fs.unlinkSync(path.resolve(__dirname, '../uploads/', result1.rows[0].banner_img))
    //                     } catch (e) {
    //                         console.log(e.message);
    //                     }
    //                 }
    //                 pg.query(`delete from blogs
    //                            where id = $1`, [req.params.id], function (err, result) {
    //                     if (err) {
    //                         data.error = true;
    //                         data.msg = err.message;
    //                         resolve(data);
    //                     } else {
    //                         data.msg = 'successfully deleted!';
    //                         resolve(data);
    //                     }
    //                 });
    //             }
    //         });
    //     });
    // }

    function getBlogs(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`select blogs.id,
                             blogs.title,
                             blogs.banner_img,
                             industry.industry_name,
                             blogs.short_desc,
                             blogs.created_at
                      from blogs 
                      left join industry
                      on blogs.industry_id = industry.id
                      order by created_at desc
                      offset $1
                      limit $2`,
                [
                    req.query.offset,
                    req.query.limit
                ], function (err, result) {
                    if (err) {
                        data.error = true;
                        data.msg = err.message;
                        resolve(data);
                    } else {
                        data.response = result.rows
                        resolve(data);
                    }
                });
        });
    }

    return {
        getIndustry,
        blogList,
        getBlogById,
        createBlog,
        updateBlogById,
        deleteBlogById,
        getBlogs,
        getSelectedBlog
    }
}