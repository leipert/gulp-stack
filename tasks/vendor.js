var _ = require('lodash');

module.exports = {
    deps: ['clean'],
    task: function (gulp, options) {

        var $ = options.plugins;

        return [
            {
                deps: ['vendor.css', 'vendor.js']
            },
            {
                name: 'js',
                deps: ['clean'],
                work: function () {

                    //var output = $.revvedOutput($.jsMinify, options.paths.build, options.output.js.path);

                    return gulp.src(options.files.vendor)
                        .pipe($.filter('**.js'))
                        .pipe($.concat(options.output.js.vendor))
                        .pipe($.generateOutPipe(options.paths.build, options.output.js.path, 'vendor.js', options.rev, $.jsMinify)());
                }
            },
            {
                name: 'css',
                deps: ['clean'],
                work: function () {

                    //var output = $.revvedOutput($.cssMinify, options.paths.build, options.output.css.path);

                    return gulp.src(options.files.vendor)
                        .pipe($.filter('**.css'))
                        .pipe($.concat(options.output.css.vendor))
                        .pipe($.generateOutPipe(options.paths.build, options.output.css.path, 'vendor.css', options.rev, $.cssMinify)());
                }
            }
        ];
    }
};
