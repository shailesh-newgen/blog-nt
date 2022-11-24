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

    function getResource(req) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`select resources.id,
                            resources.title,
                            resource_type.resource_type_name,
                            industry.industry_name,
                            resources.banner_img,
                            resources.short_desc,
                            resources.created_at
                      from resources 
                      left join resource_type
                      on resources.resource_type_id = resource_type.id
                      left join industry
                      on resources.industry_id = industry.id
                      order by created_at desc`, function (err, result) {
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

    function getResourceById(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`select resources.id,
                             resources.title,
                             resource_type.resource_type_name,
                             industry.industry_name,
                             resources.banner_img,
                             resources.short_desc,
                             resources.created_at
                       from resources 
                       left join resource_type
                       on resources.resource_type_id = resource_type.id
                       left join industry
                       on resources.industry_id = industry.id
                       where resources.id = $1 
                       limit 1`, [req.params.id], function (err, result) {
                if (err) throw err;
                if (result.rows.length) {
                    data.response = result.rows[0];
                    resolve(data);
                } else {
                    data.error = true;
                    data.msg = 'Invalid Resource!';
                    resolve(data);
                }
            });
        });
    }

    function resourceList(req, res) {
        const response = {
            error: false,
            msg: '',
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
        };
        return new Promise(resolve => {
            pg.query(`select count(1) total from resources limit 1`, function (err, result) {
                if (err) {
                    response.error = true;
                    response.msg = err.message;
                    resolve(response);
                } else {
                    if (result.rows.length) {
                        pg.query(`
                                    SELECT
                                    resources.id,
                                    resources.title,
                                    resource_type.resource_type_name,
                                    industry.industry_name,
                                    resources.created_at
                                FROM
                                    resources
                                LEFT JOIN resource_type 
                                ON resources.resource_type_id = resource_type.id
                                LEFT JOIN industry
                                ON resources.industry_id = industry.id
                                ORDER BY resources.created_at DESC
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
                                                title: `<span class="text-capitalize">${i.title}</span>`,
                                                resource_type_name: `<span style="display: flex; justify-content: center;" class="text-capitalize">${i.resource_type_name ? i.resource_type_name : ''}</span>`,
                                                industry: `<span style="display: flex; justify-content: center;" class="text-capitalize">${i.industry_name ? i.industry_name : ''}</span>`,
                                                created_at: `<span style="display: flex; justify-content: center;">${new Date(i.created_at).toDateString()}</span>`
                                            })
                                                .concat(`
                                            <div class="btn-group">
                                                <button class="btn btn-default btn-sm" onclick="getInfoSelectedResource(${i.id})" data-toggle="modal" data-target=".bd-example-modal-lg">
                                                    <i class="fa fa-info"></i>
                                                </button>
                                                <button class="btn btn-default btn-sm" onclick="getSelectedResource(${i.id})">
                                                    <i class="fa fa-pencil"></i>
                                                </button>
                                                <button class="btn btn-default btn-sm" onclick="deleteSelectedResource(${i.id}, '${i.title}')">
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

    function getSelectedResource(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`select * 
                       from resources 
                       where id = $1 
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

    function updateResourceById(req, res) {
        const data = responseData();
        let imgName = '';
        return new Promise((resolve) => {
            pg.query(`update resources 
                        set title = $1,
                            banner_img = $2,
                            resource_type_id = $3,
                            short_desc = $4
                        where id = $5`,
                [
                    req.body.title,
                    req.body.banner_img_base64,
                    req.body.resource_type_id,
                    req.body.short_desc,
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

    function createResource(req, res) {
        const data = responseData();
        let imgName = '';
        return new Promise((resolve) => {
            if (req.body.industry.length > 0) {
                (async function loop() {
                    for (let i = 0; i < req.body.industry.length; i++) {
                        await new Promise(resolve2 => {
                            pg.query(`insert into resources(title, banner_img, short_desc, resource_type_id, industry_id) 
                                      values($1, $2, $3, $4, $5)`,
                                [
                                    req.body.title,
                                    req.body.banner_img,
                                    req.body.short_desc,
                                    req.body.resource_type_id,
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
                pg.query(`insert into resources(title, banner_img, short_desc, resource_type_id) 
                                      values($1, $2, $3, $4)`,
                    [
                        req.body.title,
                        req.body.banner_img,
                        req.body.short_desc,
                        req.body.resource_type_id
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

    function getResourceType(req) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`select * 
                      from resource_type`, (err, res) => {
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

    function deleteResourceById(req, res) {
        const data = responseData();
        return new Promise((resolve) => {
            pg.query(`delete from resources
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

    return {
        getResource,
        getResourceById,
        resourceList,
        getSelectedResource,
        updateResourceById,
        createResource,
        getResourceType,
        deleteResourceById
    }
}
