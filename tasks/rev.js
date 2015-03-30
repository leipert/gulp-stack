var _ = require('lodash');
var path = require('path');

module.exports = {
    deps: ['clean'],
    task: function (gulp, options) {
        var mergeDeps = _.intersection(options.taskArray, ['static', 'html', 'vendor', 'app']);
        mergeDeps.push('clean');
        var $ = options.plugins;
        return [
            {
                deps: ['rev.clean', 'rev.replace']
            },
            {
                name: 'clean',
                deps: ['rev.merge', 'rev.replace'],
                work: function () {

                    var filter = $.filter('*.json');

                    return getRawRev()
                        .pipe($.vinylPaths($.del));

                }
            },
            {
                name: 'replace',
                deps: ['rev.merge'],
                work: function () {

                    var manifestPath = path.join(options.paths.build, 'rev-manifest.json');

                    var manifest = gulp.src(manifestPath);

                    return gulp.src([options.paths.build + '/**', '!' + manifestPath])
                        .pipe($.revReplace({manifest: manifest}))
                        .pipe(gulp.dest(options.paths.build));

                }
            },
            {
                name: 'merge',
                deps: mergeDeps,
                work: function () {
                    return getRawRev()
                        .pipe($.extend('rev-manifest.json', true, 2))
                        .pipe(gulp.dest(options.paths.build))
                }
            }
        ];


        function getRawRev() {
            return gulp.src([options.paths.build + '/**/rev-*.json']);
        }
    }
};
