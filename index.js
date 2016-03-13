var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var url = require('url');
var Datastore = require('nedb');
var bodyParser = require('body-parser');
var Q = require('q')
var db, theme, config, registeredSettings = {}, panels = [];

module.exports.use = function(cfg) {
    config = cfg;
    return module.exports;
};

module.exports.panels = function(ps) {
    return Q.resolve()
        .then(function() {
            var initializedPanels = ps.map(function(panel) {

                // router for the panel
                var router = express.Router();
                app.use('/' + panel.id, router);

                // socket.io namespace for the panel
                var nsp = io.of('/' + panel.id);

                // static files
                router.get('/client.js', function(req, res) {
                    res.sendFile(panel.client);
                });

                router.get('/style.css', function(req, res) {
                    if(panel.style) {
                        res.sendFile(panel.style);
                    }
                    else {
                        res.status(404).send();
                    }
                });

                // route for updating settings
                router.post('/settings', function(req, res) {
                    var doc = req.body;
                    doc.key = panel.id;

                    db.update({ key: panel.id}, doc, {upsert: true}, function(err, count) {
                        if( panel.onSettings ) {
                            panel.onSettings(doc);
                        }

                        if( registeredSettings[panel.id] ) {
                            for (var i = 0; i < registeredSettings[panel.id].settings.length; i++) {
                                registeredSettings[panel.id].settings[i].value = doc[registeredSettings[panel.id].settings[i].name];
                            }
                        }
                        res.send({success: true});
                    });
                });

                // startup panel
                return panel({
                    io: nsp,
                    router: router,
                    url: function(urlFragment) {
                        var webUrl = url.parse(config.webUrl);
                        webUrl.pathname = (webUrl.pathname + '/' + panel.id + '/' + urlFragment).replace(/\/\/+/g, '/');

                        return Q.fcall(function(){
                            return url.format(webUrl);
                        });
                    },
                    registerSettings: function(optionsArray) {
                        if(registeredSettings[panel.id]) {
                            registeredSettings[panel.id].settings = optionsArray;
                        }
                        else {
                            registeredSettings[panel.id] = { settings : optionsArray };
                        }
                    },
                    registerSetting: function(options) {
                        if(registeredSettings[panel.id]) {
                            registeredSettings[panel.id].settings.push(options);
                        }
                        else {
                            registeredSettings[panel.id] = { settings: [options] };
                        }
                    },
                    settings: function() {
                        var deferred = Q.defer();

                        db.findOne({key: panel.id}, function(err, doc) {
                            if(err) {
                                deferred.reject(new Error(err));
                            }
                            else {
                                deferred.resolve(doc);
                            }
                        });

                        return deferred.promise;
                    },
                });
            });

            return Q.all(initializedPanels);
        })
        .then(function(ips) {
            panels = ips;
            return true;
        })
        .catch(function(err) {
            console.log(err);
        });
};

module.exports.theme = function(t) {
    theme = ( t == 'dark' || t == 'light' ) ? __dirname + '/themes/' + t : t;
};

module.exports.listen = function(port) {
    // setup express app
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json());
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views')

    app.get('/', function (req, res) {
        res.render('index', {panels: panels, settings: registeredSettings});
    });

    app.use('/dist', express.static(__dirname + '/dist'));

    app.use('/theme', express.static(theme || __dirname + '/themes/dark'));

    // load db
    db = new Datastore({filename: config.datastore || './.config/nedb-data/summit-view.db', autoload: true});

    // listen
    port = port || config.port || 3000;
    server.listen(port);
    console.log('summit listening on port', port);
};
