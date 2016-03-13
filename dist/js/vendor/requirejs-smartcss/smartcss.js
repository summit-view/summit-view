/*
 * Smartcss
 *
 * A plugin to
 * css files with the capability to add custom string to urls in css files
 * and unload loaded css parts if required
*/

define(['text'], function(text) {


    // for buildingPurposes, as in text plugin
    var buildMap = {};

    function handleErrorsWhenLoading(error) {
        //console.log(error);
    }

    // Add urlArgs to all internal urls in a css
    function addUrlArgs(css, config) {

        var appendString = (name.indexOf("?") > -1 ? "&" : "?") + config.urlArgs;

        var urlsRe = /url\(("|'|)(.*?)("|'|)\)/gi;
        var matchedUrl = urlsRe.exec(css);
        while(matchedUrl) {
            var appendString = (matchedUrl[2].indexOf("?") > -1 ? "&" : "?") + config.urlArgs;
            css = css.replace(matchedUrl[2], matchedUrl[2] + appendString);
            matchedUrl = urlsRe.exec(css);
        }

        return css;

    }

    function escapeContent(content) {
        var escaped = content;
        escaped = escaped.replace(/\r\n/g, " ");
        escaped = escaped.replace(/[\n\r]/g, " ");
        escaped = escaped.replace(/'/g, "\"");
        return escaped;
    }

    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }

    // Adds a style tag with the css content into it
    function addStyle(name, css) {

        var head = getHead();
        var id = getId(name);

        var style = document.createElement("style");
        style.setAttribute("id", id);
        style.setAttribute("data-module", "smartcss");

        var ie = isIE();
        if (ie < 10 && ie !== false) {
            head.appendChild(style);
            (function(style, css, name) {
                style.styleSheet.cssText = css + "\n /*@ sourceURL=" + name + " */";
            })(style, css, name);
        } else {
            style.innerHTML = css + "\n /*@ sourceURL=" + name + " */";
            head.appendChild(style);
        }


    }

    function remove(name) {
        var id = getId(name);
        var obj = document.getElementById(id);
        if (obj) {
            obj.parentNode.removeChild(obj);
        }
    }

    function add(name, config, done) {

        var url = name;
        if (config.baseUrl && config.baseUrl != "./") {
            url = config.baseUrl + name;
        }

        var loaded = false;

        var head = getHead();
        var id = getId(name);

        var link = document.createElement("link");
        link.setAttribute("id", id);
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", url);
        link.setAttribute("type", "text/css");
        link.setAttribute("data-module", "smartcss");

        link.addEventListener("load", function() {
            if(loaded === false) {
                loaded = true;
                done(link);
            }
        }, false);

        link.onreadystatechange = function(){
            if (this.readyState === 'complete' || this.readyState === 'loaded') {
                if(loaded === false) {
                    loaded = true;
                    done(link);
                }
            }
        };

        link.onload = function() {
            if(loaded === false) {
                loaded = true;
                done(link);
            }
        };

        head.appendChild(link);

        function check() {
            try {
                if ( link.sheet && link.sheet.cssRules.length > 0 ) {
                    loaded = true;
                }
                else if ( link.styleSheet && link.styleSheet.cssText.length > 0 ) {
                    loaded = true;
                }
                else if ( link.innerHTML && link.innerHTML.length > 0 ) {
                    loaded = true;
                }
            }
            catch(ex){ }

            if (loaded === true) {
                done(link);
            }
            else {
                setTimeout(check, 20);
            }
        };

        check();

    }

    function load(name, req, onload, config) {
        if (config.isBuild) {
            var fs = require.nodeRequire('fs');
            var path = require.nodeRequire('path');

            var dontRender = name.indexOf("!") > -1;

            if (dontRender) {
                name = name.substring(1);
            }

            var url = req.toUrl(name);
            var content = fs.readFileSync(url, 'utf8');
            if (config.smartcss && config.smartcss.urlArgs) {
                var urlArgs = config.smartcss.urlArgs;
                if (typeof config.smartcss.urlArgs == "function") {
                    urlArgs = config.smartcss.urlArgs();
                }
                content = addUrlArgs(content, {urlArgs: urlArgs});
            }
            content = content + "\n /*@ sourceURL=" + name + " */";
            buildMap[name] = {
                content: content,
                dontRender: dontRender
            };
            onload();
        }
        else {
            (function(name, req, onload, config) {
                if ((config && config.smartcss && config.smartcss.inject === true) || (config && config.urlArgs)) {

                    var dontRender = name.indexOf("!") > -1;

                    if (dontRender) {
                        name = name.substring(1);
                    }

                    var url = req.toUrl(name);

                    // add the url args manually to the link since the text plugin doesnt seem to do it
                    if (config.urlArgs) {
                        //url += (name.indexOf("?") > -1 ? "&" : "?") + config.urlArgs;
                    }

                    // fetch the data with the text plugin
                    text.get(url, function(css) {

                        if (config.urlArgs) {
                            css = addUrlArgs(css, config);
                        }

                        buildMap[name] = css;

                        if (!dontRender) {
                            addStyle(name, css);
                        }

                        onload({
                            render: function() {
                                addStyle(name, css);
                            },
                            remove: function() {
                                remove(name);
                            }
                        });

                    }, handleErrorsWhenLoading);

                }
                else {
                   add(name, config, function(obj) {
                        //console.log(obj.sheet);
                        onload(name);
                    });
                }
            })(name, req, onload, config);
        }
    }

    function unload(name, done) {
        remove(name);
        done();
    }

    function getHead() {
        return document.getElementsByTagName("head")[0];
    }

    function getId(url) {
        var id = url.replace(/[\/\.]/gi, "-").toLowerCase();
        var prefix = "smartcss-";
        return prefix + id;
    }

    function write(pluginName, moduleName, write) {
        if (moduleName in buildMap) {
            var text = buildMap[moduleName].content;
            text = escapeContent(text);
            if (!buildMap[moduleName].dontRender) {
                write("define('" + pluginName + "!" + moduleName  + "', ['" + pluginName + "'], function (smartcss) { smartcss.addStyle('" + moduleName + "', '" + text + "');});\n");
            } else {
                write("define('" + pluginName + "!!" + moduleName  + "', ['" + pluginName + "'], function (smartcss) { return { render: function() { smartcss.addStyle('" + moduleName + "', '" + text + "'); } }});\n");
            }
        }
    };

    return {
        load: load,
        unload: unload,
        getHead: getHead,
        add: add,
        addStyle: addStyle,
        getId: getId,
        write: write,
        escapeContent: escapeContent
    };

});
