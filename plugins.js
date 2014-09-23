var gulp = require('gulp');
var _ = require('lodash');

var through = require('through');
module.exports = function(config) {

  config = _.merge({
    lazy: true
  }, config);

  if (config.lazy !== false) {
    config.lazy = true;
  }

  console.log(config);

  var $ = require('gulp-load-plugins')({
    pattern: [
      'gulp-*',
      'main-bower-files',
      'merge-stream',
      'lazypipe',
      'open'
    ],
    lazy: config.lazy
  });

  $.jsMinify = $.lazypipe()
  .pipe($.ngAnnotate)
  .pipe($.uglify)
  .pipe($.rev);

  $.cssMinify = $.lazypipe()
  .pipe($.autoprefixer, {
    browsers: ['> 1%', 'last 4 versions', 'Firefox ESR', 'Opera 12.1'],
    cascade: true
  })
  .pipe($.minifyCss, {
    keepSpecialComments: 0
  })
  .pipe($.rev);

  $.htmlMinify = $.lazypipe()
  .pipe($.htmlmin, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true
  });


  $.filterVinylFSByStatus = function(statuses) {
    var count = false;

    if (!_.isArray(statuses)) {
      statuses = [statuses];
    }

    function countFiles(file) {
      count = count || _.contains(statuses, file.event);
    }

    function endStream() {
      this.emit('data', count);
      count = false;
      this.emit('end');
    }

    return through(countFiles, endStream);
  };
  return $;
};
