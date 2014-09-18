var _ = require('lodash');
var gulp = require('gulp');

module.exports = function(options) {

  var $ = options.plugins;

  return [
    {
      name: 'js',
      deps: ['clean'],
      work: function() {
        return gulp.src(options.files.vendor)
        .pipe($.filter('**.js'))
        .pipe($.concat(options.output.js.vendor))
        .pipe(gulp.dest('.tmp/testing'))
        .pipe($.jsMinify())
        .pipe(gulp.dest(options.paths.build + options.output.js.path));
      }
    },
    {
      name: 'css',
      deps: ['clean'],
      work: function() {
        return gulp.src(options.files.vendor)
        .pipe($.filter('**.css'))
        .pipe($.concat(options.output.css.vendor))
        .pipe($.cssMinify())
        .pipe(gulp.dest(options.paths.build + options.output.css.path));
      }
    },
    {
      deps: ['vendor.js', 'vendor.css']
    }
  ];
};
