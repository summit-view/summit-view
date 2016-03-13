// need to include should directly here to be able to use not
var should = require('should');
var fs = require('fs');
var path = require('path');

describe("The optimizer output", function() {

    beforeEach(function(done) {

        var self = this;

        var file = path.join(__dirname, "../", "scripts-prod", "test-module.js");
        this.optimized = fs.readFileSync(file, "utf8");

        done();

    });

    afterEach(function(done) { done(); });

    it("Url args are included", function(done) {

        this.optimized.should.contain("temp3.png?ver=77");
        this.optimized.should.contain("temp2.png?ver=77");
        this.optimized.should.contain("temp.png?ver=77");
        done();

    });

});
