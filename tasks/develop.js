var _ = require('lodash');
var rp = require('request-promise');

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

                options.webserver.livereload = {
                    enable: true,
                    port: 35729
                };
                options.webserver.path = options.paths.root;

                getWebserverOptions(options)
                    .then(startWebserver);

            }
        }, {
            name: '$serve.dist',
            deps: serveDistDeps,
            work: function () {

                var webServerOptions = getWebserverOptions(options);

                options.webserver.livereload = false;
                options.webserver.port += 1;
                options.webserver.path = options.paths.build;

                getWebserverOptions(options)
                    .then(startWebserver);
            }
        }, {
            name: 'inject',
            work: function () {
                return gulp.src('app/index.html')
                    .pipe($.inject($.streamqueue({
                            objectMode: true
                        },
                        //gulp.src(options.files.jsNoVendor),
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
                    }, function (vinyl) {
                        console.warn(vinyl);
                        gulp.start('develop.inject');
                    }
                );

                $.watch(
                    options.files.jsNoVendor,
                    {
                        events: ['change']
                    }
                ).pipe($.plumber())
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

    function getWebserverOptions(options) {

        var url = buildURL(options.webserver);

        var promise = rp(url)
            .then(function () {
                options.webserver.port += 2;
                if (_.isObject(options.webserver.livereload)) {
                    options.webserver.livereload.port += 2;
                }
                return getWebserverOptions(options);
            })
            .catch(function () {
                return options.webserver;
            });

        return promise;
    }

    function buildURL(options) {

        var protocol = options.https ? 'https:' : 'http:';

        return protocol + '//localhost:' + options.port;

    }

    function startWebserver(wsOptions) {
        gulp.src(wsOptions.path)
            .pipe($.webserver(wsOptions));

        $.open(buildURL(wsOptions));
    }


};