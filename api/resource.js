module.exports = function (app) {
    let ResourceCtrl = require('./resourceCtrl');
    ResourceCtrl = new ResourceCtrl;

    app.get('/api/resource', function (req, res) {
        ResourceCtrl.getResource(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.get('/api/resourceList', function (req, res) {
        ResourceCtrl.resourceList(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.get('/api/resource/:id', function (req, res) {
        ResourceCtrl.getResourceById(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.get('/api/getSelectedResource/:id', function (req, res) {
        ResourceCtrl.getSelectedResource(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.put('/api/resource/:id', function (req, res) {
        ResourceCtrl.updateResourceById(req, res).then(function (response) {
            res.send(response);
        })
    });

    app.post('/api/resource', function (req, res) {
        ResourceCtrl.createResource(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.get('/api/resource_type', function (req, res) {
        ResourceCtrl.getResourceType(req, res).then(function (response) {
            res.send(response);
        });
    });

    app.delete('/api/resource/:id', function (req, res) {
        ResourceCtrl.deleteResourceById(req, res).then(function (response) {
            res.send(response);
        });
    });
}
