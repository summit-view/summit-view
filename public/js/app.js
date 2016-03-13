var _ = require('underscore');
var Packery = require('packery');
var Draggabilly = require('draggabilly');
var getFormData = require('get-form-data');
var xhr = require('xhr');

var initPanelSize = function(panel) {
    var x = panel.getAttribute('data-panel-x');
    var y = panel.getAttribute('data-panel-y');

    _.each(panel.classList, function(c) {
        if( c.match(/panel-.*/) ) {
            panel.classList.remove(c); // remove existing class
        }
    });

    panel.classList.add('panel-' + x + 'x' + y); // add size class
    pckry.layout();
};


var initPanel = function(panel) {
    // update the panels size
    initPanelSize(panel);

    // init configuration-controls for the panel
    var configureControls = panel.querySelectorAll('.configure [data-action]');

    _.each(configureControls, function(control) {
        control.addEventListener('click', function() {
            var action = control.getAttribute('data-action');
            var x = parseInt(panel.getAttribute('data-panel-x'));
            var y = parseInt(panel.getAttribute('data-panel-y'));

            switch(action) {
                case 'expand-width':
                    if( x < 8 ) {
                        x++;
                    }
                    break;
                case 'compress-width':
                    if( x > 1 ) {
                        x--;
                    }
                    break;
                case 'expand-height':
                    if( y < 8 ) {
                        y++;
                    }
                    break;
                case 'compress-height':
                    if( y > 1 ) {
                        y--;
                    }
                    break;
            }

            panel.setAttribute('data-panel-x', x);
            panel.setAttribute('data-panel-y', y);
            initPanelSize(panel);
        });
    });
};


/**
 * Packery
 */
var panels = document.querySelectorAll('.panel');
var container = document.querySelector('#container');

var pckry = new Packery( container, {
    itemSelector: '.panel',
    columnWidth: '.panel-sizer',
    percentPosition: false,
    gutter: 0,
    transitionDuration: '0.3s',
});

var panelSettings = [];

var savePanelSettings = function() {
    var itemElems = pckry.getItemElements();
    // reset / empty oder array
    panelSettings.length = 0;

    for (var i = 0, ii = itemElems.length; i < ii; i++) {
        panelSettings[i] = {
            tabindex: itemElems[i].getAttribute('tabindex'),
            x: itemElems[i].getAttribute('data-panel-x'),
            y: itemElems[i].getAttribute('data-panel-y'),
        };
    }

    // save tabindex ordering
    localStorage.setItem('panelSettings', JSON.stringify(panelSettings));
};

var initPanels = function(cb) {
    var storedPanelSettings = localStorage.getItem('panelSettings');

    if(storedPanelSettings) {
        storedPanelSettings = JSON.parse(storedPanelSettings);

        // create a hash of items by their tabindex
        var itemsByTabIndex = {};
        var tabIndex;

        for(var i = 0, ii = pckry.items.length; i < ii; i++) {
            var item = pckry.items[i];
            tabIndex = item.element.getAttribute('tabindex');
            itemsByTabIndex[tabIndex] = item;
        }

        // overwrite packery item order
        for (var i = 0, ii = storedPanelSettings.length; i < ii; i++ ) {
            tabIndex = storedPanelSettings[i].tabindex;
            var item = itemsByTabIndex[ tabIndex ];

            if( item ) {
                pckry.items[i] = item;
                pckry.items[i].element.setAttribute('data-panel-x', storedPanelSettings[i].x);
                pckry.items[i].element.setAttribute('data-panel-y', storedPanelSettings[i].y);
            }
        }

        _.each(panels, function(panel) {
            initPanel(panel);
            pckry.bindDraggabillyEvents(new Draggabilly(panel));
        });
    }
    else {
        // init with defaults
        _.each(panels, function(panel) {
            initPanel(panel);
            pckry.bindDraggabillyEvents(new Draggabilly(panel));
        });
    }

    if( cb ) {
        cb();
    }
};

initPanels(function() {
    pckry.on( 'layoutComplete', savePanelSettings );
    pckry.on( 'dragItemPositioned', savePanelSettings );
});


/**
 * Settings
 */
var saveSettingsControls = document.querySelectorAll('.save-settings-control');

_.each(saveSettingsControls, function(saveSettingsControl) {
    saveSettingsControl.addEventListener('click', function() {
        var settingsFor = saveSettingsControl.getAttribute('data-save-settings-for');
        var data = getFormData(document.querySelector('form#' + settingsFor));

        xhr.post('/' + settingsFor + '/settings', {json: data}, function(err, res) {
            console.log(res);
        });
    });
});


var toolbarControls = document.querySelectorAll('#toolbar .toolbar-control');

_.each(toolbarControls, function(control) {
    control.addEventListener('click', function() {
        var action = control.getAttribute('data-action');

        switch(action) {
            case 'activate-settings-ui':
                document.body.classList.toggle('settings-open')
                break;
        }
    });
});
