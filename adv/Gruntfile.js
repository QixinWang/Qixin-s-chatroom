/**
 * Created by realnoname on 8/26/2016.
 */
module.exports = function (grunt) {
    grunt.initConfig({
        execute: {
            target: {
                src: ['app.js']
            }
        },
        watch: {
            scripts: {
                files: ['app.js'],
                tasks: ['execute'],
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-execute');
};