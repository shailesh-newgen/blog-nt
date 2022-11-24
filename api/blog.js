module.exports = function (app) {
    let BlogCtrl = require('./blogCtrl');
    BlogCtrl = new BlogCtrl;

    app.get('/api/industry', function (req, res) {
        BlogCtrl.getIndustry(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.get('/api/blog/list', function (req, res) {
        BlogCtrl.blogList(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.get('/api/blog', function (req, res) {
        BlogCtrl.getBlogs(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.get('/api/blog/:id', function (req, res) {
        BlogCtrl.getBlogById(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.get('/api/getSelectedBlog/:id', function (req, res) {
        BlogCtrl.getSelectedBlog(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.post('/api/blog', function (req, res) {
        BlogCtrl.createBlog(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.put('/api/blog/:id', function (req, res) {
        BlogCtrl.updateBlogById(req, res).then(function (response) {
            res.send(response);
        })
    });

    app.delete('/api/blog/:id', function (req, res) {
        BlogCtrl.deleteBlogById(req, res).then(function (response) {
            res.send(response);
        });
    });
}