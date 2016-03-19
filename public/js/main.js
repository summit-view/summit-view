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
        var loadingEl = panel.querySelector('.loading');

        require(['/' + panel.getAttribute('data-panel') + '/client.js', 'smartcss!../../' + panel.getAttribute('data-panel') + '/style.css'], function(module, css) {
            if( typeof module == 'function' ) {
                var socket = io('/' + panel.getAttribute('data-panel'));

                socket.on('loading', function(message) {
                    message = message || '';
                    var messageEl = panel.querySelector('.loading .message');
                    messageEl.textContent = message;
                    panel.classList.add('is-loading');
                });

                socket.on('loaded', function() {
                     var messageEl = panel.querySelector('.loading .message');
                    messageEl.textContent = '';
                    panel.classList.remove('is-loading');
                });

                module(el, socket);
            }
        });
    });
});
