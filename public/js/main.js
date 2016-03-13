require.config({
    baseUrl: "dist/js",
    paths: {
        css: "vendor/requirejs-css-plugin/css",
        text: "vendor/text/text",
        smartcss: "vendor/requirejs-smartcss/smartcss",
        underscore: "vendor/underscore.min",
    },
});

require(['underscore'], function(_) {
    var panels = document.querySelectorAll('.panel');

    _.each(panels, function(panel) {
        var el = panel.querySelector('.content');

        require(['/' + panel.getAttribute('data-panel') + '/client.js', 'smartcss!../../' + panel.getAttribute('data-panel') + '/style.css'], function(module, css) {
            if( typeof module == 'function' ) {
                var socket = io('/' + panel.getAttribute('data-panel'));
                module(el, socket);
            }
        });
    });
});
