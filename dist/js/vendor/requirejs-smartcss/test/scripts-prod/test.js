requirejs.config({
    baseUrl: "../"
});

define(function(require){

    require('test/scripts/inner-functions');

    mocha.run();

});
