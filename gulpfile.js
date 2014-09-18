var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('test', ['jshint']);

gulp.task('jshint', function() {
  return gulp.src('**.js')
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});
