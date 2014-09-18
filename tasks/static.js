var _ = require('lodash');
var gulp = require('gulp');

module.exports = function(options) {

  var $ = options.plugins;

  return _.map(options.files.static, function(c) {
    return {
      name: c.name,
      deps: ['clean'],
      work: function() {
        var filter = $.filter('**');
        if (c.src === '$vendor') {
          c.src = options.files.vendor;
        }
        if (!!c.filter) {
          filter = $.filter(c.filter);
        }
        if (!!c.pipe) {
          return gulp.src(c.src).pipe(filter).pipe(c.pipe()).pipe(gulp.dest(c.folder));
        } else {
          return gulp.src(c.src).pipe(filter).pipe(gulp.dest(c.folder));
        }
      }
    }
  }).concat([
    {
      deps: _.chain(options.files.static).pluck('name').map(function(c) {
        return 'static.' + c;
      }).value(),
      desc: 'Copies all static files'
    }
  ]);
};
