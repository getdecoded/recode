var gulp = require('gulp');
var browserify = require('browserify');
var debowerify = require('debowerify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var server = require('gulp-webserver');
var autoprefixer = require('gulp-autoprefixer');
var derequire = require('gulp-derequire');

gulp.task('js', function () {
  browserify('./src/index.js', {
      standalone: 'Recode'
    })
    .external('codemirror')
    .transform(debowerify)
    .bundle()
    .pipe(source('recode.js'))
    .pipe(derequire())
    .pipe(buffer())
    .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() {
    gulp.src('./src/recode.css')
        .pipe(autoprefixer())
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['build'], function() {
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

gulp.task('build', ['js', 'css']);
gulp.task('default', ['watch', 'serve']);
