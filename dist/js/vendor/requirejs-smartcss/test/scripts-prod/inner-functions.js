define(function(require) {

    var smartcss = require("smartcss");

    describe("Smartcss inner functions", function() {

        before(function(done) {
            var self = this;
            this.req = { toUrl: require.toUrl };
            this.config = requirejs.s.contexts._.config;
            this.testContext = document.getElementById("test-content");
            done();
        });

        beforeEach(function() {

            this.testObj = document.createElement("div");
            this.testObj.setAttribute("id", "foo");
            this.testContext.appendChild(this.testObj);

            this.testObj2 = document.createElement("div");
            this.testObj2.setAttribute("id", "picard");
            this.testContext.appendChild(this.testObj2);

            this.testObj3 = document.createElement("div");
            this.testObj3.setAttribute("id", "locutos");
            this.testContext.appendChild(this.testObj3);

         });

        afterEach(function() {

            var testContent = document.getElementById("test-content");
            testContent.innerHTML = "";

            var headContent = document.querySelectorAll("*[data-module=smartcss]");
            for(var i = 0, ii = headContent.length; i < ii; i++){
                headContent[i].parentNode.removeChild(headContent[i]);
            }

            requirejs.config({baseUrl: "../", urlArgs: null});

        });

        it("getHead returns the HEAD element", function() {
            var head = smartcss.getHead();
            chai.should().exist(head);
        });

        it("Loads an external css file and tell us its done", function(done) {

            var onload = function(name) {
                name.should.be.equal("test/style/chunk1.css");
                done();
            };

            smartcss.load("test/style/chunk1.css", this.req, onload, this.config);

        });

        it("Creates an id from a css url", function() {

            var id = smartcss.getId("test/style/chunk1.css");
            id.should.equal("smartcss-test-style-chunk1-css");

        });

        it("Add the css to the head section as a style tag with the correct id", function(done) {

            smartcss.load("test/style/chunk2.css", this.req, function() {
                var styleObj = document.querySelector("#smartcss-test-style-chunk2-css");
                chai.should().exist(styleObj);
                styleObj.innerHTML.should.contain("#foo");
                done();
            }, { 
                smartcss: {
                    inject: true
                }
            });

        });

        it("Add the css to the head section as link tag with the correct id", function(done) {

            smartcss.add("test/style/chunk2.css", this.config, function() {
                var styleObj = document.querySelector("#smartcss-test-style-chunk2-css");
                chai.should().exist(styleObj);
                styleObj.getAttribute("href").should.be.equal("../test/style/chunk2.css");

                // for some reason, if we dont wait until the next frame, the next test will break wehn 
                // we run this form node. I guess it has to do with loading the external link and waiting for it
                // to actually be there
                setTimeout(done, 0);
            });

        });

        it("An added css will change the style of the desired object", function(done) {
            var self = this;
            smartcss.load("test/style/chunk1.css", this.req, function() {
                var style = window.getComputedStyle(self.testObj, null);
                style.color.should.equal("rgb(255, 0, 0)");
                done();
            }, this.config);
        });

        it("We can unload styles", function(done) {
            var self = this;
            smartcss.load("test/style/chunk1.css", this.req, function() {
                smartcss.unload("test/style/chunk1.css", function() {
                    var style = window.getComputedStyle(self.testObj, null);
                    style.color.should.not.equal("rgb(255, 0, 0)");
                    done();
                });
            }, this.config);
        });

        it("Css are added in the correct ordered", function(done) {
            var self = this;
            smartcss.load("test/style/chunk1.css", self.req, function() {
                smartcss.load("test/style/chunk2.css", self.req, function() {
                    var style = window.getComputedStyle(self.testObj, null);
                    style.color.should.equal("rgb(0, 255, 0)");
                    done();
                }, self.config);
            }, self.config);
        });

        it("Add returns the style dom object", function(done) {

            smartcss.add("test/style/chunk2.css", this.config, function(obj) {
                chai.should().exist(obj);
                obj.getAttribute("href").should.be.equal("../test/style/chunk2.css");

                // for some reason, if we dont wait until the next frame, the next test will break wehn 
                // we run this form node. I guess it has to do with loading the external link and waiting for it
                // to actually be there
                setTimeout(done, 0);
            });

        });

        it("Adds the urlArgs to the url for getting the file", function(done) {

            var url = "";
            var self = this;

            require(["text"], function(text) {

                var oldGet = text.get;
                text.get = function(name, next) {
                    url = name;
                    next();
                };

                requirejs.config({urlArgs: "version=111"});

                smartcss.load("style/chunk2.css", self.req, function(obj) {
                    url.should.equal("../style/chunk2.css?version=111");
                    text.get = oldGet;
                    done();
                }, self.config);

            });

        });

        it("Will use the baseUrl for constructing the url when using the link tag" , function(done) {

            smartcss.load("style/chunk2.css", this.req, function(obj) {
                var obj = document.getElementById("smartcss-style-chunk2-css");
                obj.getAttribute("href").should.be.equal("foo/bar/style/chunk2.css");
                done();
            }, { baseUrl: "foo/bar/"});

        });

        it("Will use the baseUrl for constructing the url when injecting" , function(done) {

            var url = "";
            var self = this;

            require(["text"], function(text) {

                var oldGet = text.get;
                text.get = function(name, next) {
                    url = name;
                    next();
                };

                requirejs.config({ baseUrl: "foo/bar/", urlArgs: "version=111"});

                smartcss.load("style/chunk2.css", self.req, function(obj) {
                    url.should.equal("foo/bar/style/chunk2.css?version=111");
                    text.get = oldGet;
                    done();
                }, { baseUrl: "foo/bar/", urlArgs: "version=111"});

            });

        });


        it("Adds the urlArgs to each url in a css", function(done) {

            requirejs.config({ urlArgs: "seed=101001"});

            var self = this;

            smartcss.load("test/style/chunk3.css", this.req, function() {

                var obj = document.getElementById("foo");
                var style = window.getComputedStyle(obj, null);
                style.backgroundImage.should.contain("temp.png?seed=101001");

                var obj = document.getElementById("picard");
                var style = window.getComputedStyle(obj, null);
                style.backgroundImage.should.contain("temp2.png?seed=101001");

                var obj = document.getElementById("locutos");
                var style = window.getComputedStyle(obj, null);
                style.backgroundImage.should.contain("temp3.png?seed=101001");

                done();

            }, this.config);

        });

        it("has a method for escaping js into a single line", function() {

            var content = "var a = 1;\nvar s = 'hello';\rvar foo = \"data\";\r\nvar bar = 2;";

            var escaped = smartcss.escapeContent(content);

            escaped.should.equal("var a = 1; var s = \"hello\"; var foo = \"data\"; var bar = 2;");

        });

        it("writes an optimized and escaped string with no new lines", function(done) {

            var self = this;

            var mockNodeRequire = function(module) {
                if (module == 'fs') {
                    return {
                        readFileSync: function(name, encoding) {
                            return "#foo {\n\tcolor: red;\n}\n";
                        }
                    };
                }
                if (module == 'path') {
                    return {
                        join: function() { return ""; }
                    };
                }
            };

            var old = require.nodeRequire;
            requirejs.nodeRequire = mockNodeRequire;

            smartcss.load("style/chunk3.css", {
                toUrl:  function(moduleName) {
                    return moduleName;
                }
            }, function() {

                smartcss.write("smartcss", "style/chunk3.css", function(content) {

                    content.indexOf("\n").should.equal(content.length - 1);
                    content.should.not.contain("\r");

                    requirejs.nodeRequire = old;

                    done();

                });


            }, { isBuild: true } );

        });


    });

});
