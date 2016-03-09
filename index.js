var express = require('express');
var server = require('http').createServer();
var io = require('socket.io')(server);
var app = express();
var panels = [];
var theme;

app.set('view engine', 'jade');
app.set('views', __dirname + '/views')

app.get('/', function (req, res) {
    res.render('index', {panels: panels});
});

io.on('connection', function() {
    console.log('connection');
});

module.exports.panels = function(ps) {
    panels = [];

    ps.forEach(function(panel) {
        panels.push(panel({io: io}))
    });
};

module.exports.theme = function(t) {
    theme = ( t == 'dark' || t == 'light' ) ? __dirname + '/themes/' + t : t;
};

module.exports.listen = function(port, IOport) {
    app.use('/theme', express.static(theme || __dirname + '/themes/dark'));
    port = port || 3000;
    //console.log('summit listening on port', port);
    app.listen(port);
    server.listen(IOport || port + 1);
};
