var express = require('express');
var server = require('http').createServer();
var io = require('socket.io')(server);
var app = express();
var url = require('url');
var panels = [];
var theme;
var config;

app.set('view engine', 'jade');
app.set('views', __dirname + '/views')

app.get('/', function (req, res) {
    res.render('index', {panels: panels});
});

app.use('/dist', express.static(__dirname + '/dist'));

io.on('connection', function() {
    console.log('connection');
});

module.exports.use = function(cfg) {
    config = cfg;
    return module.exports;
};

module.exports.panels = function(ps) {
    ps.forEach(function(panel) {
        var router = express.Router();
        app.use('/' + panel.id, router);

        panels.push(panel({
            io: io,
            router: router,
            url: function(urlFragment) {
                var webUrl = url.parse(config.webUrl);
                webUrl.pathname = (webUrl.pathname + '/' + panel.id + '/' + urlFragment).replace(/\/\/+/g, '/');
                return url.format(webUrl);
            },
        }));
    });
};

module.exports.theme = function(t) {
    theme = ( t == 'dark' || t == 'light' ) ? __dirname + '/themes/' + t : t;
};

module.exports.listen = function(port, IOport) {
    app.use('/theme', express.static(theme || __dirname + '/themes/dark'));
    port = port || config.port || 3000;
    console.log('summit listening on port', port);
    app.listen(port);
    server.listen(IOport || port + 1);
};
