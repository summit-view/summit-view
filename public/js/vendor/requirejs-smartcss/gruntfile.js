/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: '<json:package.json>',

        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */'
        },

        mocha: {
            all: {
                src: [ 'test/*.html' ],
                options: {
                    log: true
                }
            }
        },

        simplemocha: {
            all: {
                src: 'test/optimizer/**/*.js',
                options: {
                    timeout: 5000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'tap'
                }
            }
        },

        watch: {
            files: ['test/**/*.*'],
            tasks:'mocha'
        },

        requirejs: {
            compile: {
                options: {
                    appDir: "./test/scripts",
                    baseUrl: "./",
                    optimize: "none",
                    findNestedDependecies: true,
                    dir: "./test/scripts-prod",
                    paths: {
                        css: "../../smartcss",
                        text: "../../text",
                        style: "../style"
                    },
                    modules: [
                        { name: "test-module" }
                    ],
                    smartcss: {
                        urlArgs: function() {
                            return "ver=77";
                        }
                    }
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mocha');

    // Default task.
    grunt.registerTask('test', ['mocha', 'requirejs', 'simplemocha']);
    grunt.registerTask('watch', 'watch');

};
