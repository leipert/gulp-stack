var _ = require('lodash');
var rp = require('request-promise');
var browserSync = require('browser-sync');

module.exports = function (gulp, options) {

    var $ = options.plugins;

    var serveDistDeps = _.intersection(options.taskArray, ['html', 'rev']);

    return [
        {
            name: '$build',
            deps: _.union(serveDistDeps, ['jshint'])
        },
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

                options.webserver.server = _.assign(options.webserver.server, {
                    baseDir: options.paths.root
                });

                startWebserver(options.webserver, 'Serving develop!');


            }
        }, {
            name: '$serve',
            deps: serveDistDeps,
            work: function () {

                options.webserver.server = _.assign(options.webserver.server, {
                    baseDir: options.paths.root
                });

                startWebserver(options.webserver, 'Serving compiled!');

            }
        }, {
            name: 'inject',
            work: function () {
                return gulp.src(options.files.html)
                    .pipe($.inject($.streamqueue({
                            objectMode: true
                        },

                        gulp.src(options.files.jsNoVendor)
                            .pipe($.plumber())
                            .pipe($.jshint('.jshintrc'))
                            .pipe($.jshint.reporter('jshint-stylish'))
                            .pipe($.angularFilesort())
                            .pipe($.plumber.stop()),
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
                    .pipe(gulp.dest('.tmp/'))
                    .pipe($.reload({stream: true}))
                    ;
            }
        },
        {
            name: 'watch',
            work: function () {

                var watch = options.files.js
                    .concat(options.files.css)
                    .concat(options.files.watch)

                $.watch(
                    watch,
                    {
                        read: false,
                        events: ['add', 'unlink']
                    }, function () {
                        gulp.start('develop.inject');
                    }
                );

                gulp.watch(watch).on('change', function (events) {
                    if (events.type === 'changed') {
                        $.reload(events.path)
                    }

                });

                $.watch(
                    options.files.jsNoVendor,
                    {
                        events: ['change']
                    }
                )
                    .pipe($.plumber())
                    .pipe($.jshint('.jshintrc'))
                    .pipe($.jshint.reporter('jshint-stylish'))
                    .pipe($.plumber.stop())
                ;

                $.watch(
                    options.files.html,
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

    function startWebserver(config, message) {
        console.warn(config);
        var foo = browserSync(config)
        setTimeout(function () {
            browserSync.notify(message, 5000);
        }, 2000)
    }


};
