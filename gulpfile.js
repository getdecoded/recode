var gulp = require('gulp');
var browserify = require('browserify');
var debowerify = require('debowerify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('js', function () {
  browserify('./src/index.js')
    .transform(debowerify)
    .bundle()
    .pipe(source('recode.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['js']);
});

gulp.task('default', ['watch']);
