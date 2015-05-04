var _ = require('lodash');
var urljoin = require('path');

module.exports = function (gulp, options) {
    var $ = options.plugins;
    return [
        {
            //deps: ['clean', 'vendor', 'static','rev.'],
            deps: ['clean', 'vendor', 'app', 'static'],
            work: function () {

                var template = {
                    vendorCSS: genTemplate('css', options.output.css.path, options.output.css.vendor),
                    vendorJS: genTemplate('js', options.output.js.path, options.output.js.vendor),
                    appCSS: genTemplate('css', options.output.css.path, options.output.css.app),
                    appJS: genTemplate('js', options.output.js.path, options.output.js.app)
                }


                return gulp.src(options.files.html)
                    .pipe($.template(template))
                    .pipe($.htmlMinify())
                    .pipe(gulp.dest(options.paths.build));

                function genTemplate(type, dir, file) {

                    dir = urljoin(dir, file).replace(/^\//, '');

                    if (type === 'css') {
                        dir = '<link rel="stylesheet" href="' + dir + '">'
                    } else if (type === 'js') {
                        dir = '<script src="' + dir + '"></script>';
                    } else {
                        dir = '';
                    }

                    return '--> ' + dir + ' <!--'
                }
            }
        }
    ];

};
