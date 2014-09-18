var _ = require('lodash');
var gulp = require('gulp');

module.exports = function(options) {

  var $ = options.plugins;
  return [
    {
      deps: ['clean', 'vendor', 'app', 'static'],
      work: function() {
        return gulp.src(options.files.html)
        .pipe($.inject(gulp.src([options.paths.build + options.output.css.path + '/*', options.paths.build + options.output.js.path + '/*']), {
          ignorePath: [options.paths.build + '/'],
          addRootSlash: false
        }))
        .pipe($.htmlMinify())
        .pipe(gulp.dest(options.paths.build));
      }
    }
  ];
};
