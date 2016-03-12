require.config({
    baseUrl: "/dist/js",
    paths: {
        "underscore": "vendor/underscore.min"
    },
});

require(['underscore'], function(_) {
    var panels = document.querySelectorAll('.panel');

    var socket = io();

    _.each(panels, function(panel) {
        var socket = io('/' + panel.getAttribute('data-panel'));
        var el = panel.querySelector('.content');

        require(['/panels/' + panel.getAttribute('data-panel') + '.js'], function(module) {
            module(el, socket);
        });
    });
});
