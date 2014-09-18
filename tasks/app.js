var _ = require('lodash');
var gulp = require('gulp');

module.exports = function(options) {
  var $ = options.plugins;

  return [
    // Creates 'app' task with given dependencies
    {
      deps: ['app.js', 'app.css']
    },
    // Creates 'app.js' task with dependencies and work function
    {
      name: 'js',
      deps: ['clean'],
      // Takes all app javascript files, angular templates and concats and minifies them
      work: function() {
        var stream = $.mergeStream();


        // App files without vendor files
        stream.add(gulp.src(options.files.jsNoVendor));

        //Angular template files
        stream.add(
        gulp.src(options.files.partials)
        .pipe($.htmlMinify())
        .pipe($.angularTemplatecache(options.templateCacheOptions))
        );


        //Optionally injected additional javascript sourcecode
        _.forEach(options.injectInto.js, function(c) {
          if (_.isFunction(c)) {
            stream.add(c());
          } else {
            stream.add(c);
          }
        });

        return stream
        .pipe($.angularFilesort())
        .pipe($.concat(options.output.js.app))
        .pipe(gulp.dest('.tmp/testing')) //TODO: refactor tests
        .pipe($.jsMinify())
        .pipe(gulp.dest(options.paths.build + options.output.js.path));
      }
    },
    {
      name: 'css',
      deps: ['clean'],
      // Takes all app css files and concats and minfies them
      work: function() {

        var stream = $.mergeStream();

        // App files without vendor files
        stream.add(gulp.src(options.files.cssNoVendor));

        //Optionally injected additional css sourcecode
        _.forEach(options.injectInto.css, function(c) {
          if (_.isFunction(c)) {
            stream.add(c());
          } else {
            stream.add(c);
          }
        });

        return stream
        .pipe($.concat(options.output.css.app))
        .pipe($.cssMinify())
        .pipe(gulp.dest(options.paths.build + options.output.css.path));
      }
    }

  ];
};
