var _ = require('lodash');
var gulp = require('gulp');

module.exports = function (options) {

    var $ = options.plugins;

    return [
        {
            name: '$jshint',
            work: function () {
                return gulp.src(options.files.jsNoVendor)
                    .pipe($.jshint('.jshintrc'))
                    .pipe($.jshint.reporter('jshint-stylish'))
                    .pipe($.jshint.reporter('fail'));
            }
        }, {
            name: 'serve',
            deps: ['develop.watch', 'develop.inject'],
            work: function () {
                gulp.src(options.paths.root).pipe(
                    $.webserver({
                        host: '0.0.0.0',
                        port: 8123,
                        livereload: true,
                    }));
                $.open('http://localhost:8123');
            }
        }, {
            name: '$serve.dist',
            deps: ['build'],
            work: function () {
                gulp.src(options.paths.build).pipe(
                    $.webserver({
                        port: 8124,
                        livereload: false
                    }));
                $.open('http://localhost:8124');
            }
        }, {
            name: 'inject',
            work: function () {
                return gulp.src('app/index.html')
                    .pipe($.inject($.streamqueue({
                            objectMode: true
                        },
                        gulp.src(options.files.jsNoVendor).pipe($.angularFilesort()),
                        gulp.src(options.files.cssNoVendor, {
                            read: false
                        })
                    ), {
                        ignorePath: options.paths.root
                    }))
                    .pipe($.inject(gulp.src(options.files.vendor), {
                        ignorePath: options.paths.root,
                        starttag: '<!-- inject:vendor:{{ext}} -->'
                    }))
                    .pipe(gulp.dest('.tmp/'));
            }
        },
        {
            name: 'watch',
            work: function () {

                $.watch(
                    options.files.js.concat(options.files.css),
                    {
                        read: false,
                        events: ['add', 'unlink']
                    }, function () {
                        gulp.start('develop.inject');
                    }
                );

                $.watch(
                    options.files.jsNoVendor,
                    {
                        events: ['change']
                    }
                )
                    .pipe($.jshint('.jshintrc'))
                    .pipe($.jshint.reporter('jshint-stylish'))
                    .pipe($.plumber.stop());

                $.watch(
                    'app/index.html',
                    {
                        read: false,
                        events: ['change']
                    }, function () {
                        gulp.start('develop.inject');
                    });
            }
        },
        {
            deps: ['develop.serve', 'develop.inject']
        }
    ];
};
