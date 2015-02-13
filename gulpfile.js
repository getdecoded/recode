var gulp = require('gulp');
var browserify = require('browserify');
var debowerify = require('debowerify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var server = require('gulp-webserver');

gulp.task('js', function () {
  browserify('./src/index.js')
    .transform(debowerify)
    .bundle()
    .pipe(source('recode.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() {
    gulp.src('./src/recode.css')
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['js']);
    gulp.watch('src/**/*.css', ['css']);
});

gulp.task('serve', function() {
  gulp.src('./')
    .pipe(server({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});

gulp.task('default', ['watch', 'serve']);
