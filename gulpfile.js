var gulp = require('gulp');
var browserify = require('browserify');
var debowerify = require('debowerify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var server = require('gulp-webserver');
var autoprefixer = require('gulp-autoprefixer');
var derequire = require('gulp-derequire');
var serveStatic = require('serve-static');
var bs = require('browser-sync').create();

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
    .pipe(gulp.dest('./dist'))
    .pipe(bs.reload({ stream: true }));
});

gulp.task('css', function() {
  gulp.src('./src/recode.css')
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist'))
    .pipe(bs.reload({ stream: true }));
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*.js', ['js']);
  gulp.watch('src/**/*.css', ['css']);
  gulp.watch('test/**', bs.reload);
});

gulp.task('serve', function() {
  bs.init({
    server: './test',
    open: false,
    middleware: serveStatic('./dist')
  });
});

gulp.task('build', ['js', 'css']);
gulp.task('default', ['watch', 'serve']);
