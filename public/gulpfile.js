var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
     uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache'),
    jshint = require('gulp-jshint');

gulp.task('less', function() {
    console.log("change");
    gulp.src('css/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('css'));
});

gulp.task('styles', function() {  
  return gulp.src('css/style.css')
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('styles'))
    .pipe(notify({ message: 'Styles task complete' }));
});


gulp.task('lint', function() {
    return gulp.src(['js/*.js', 'js/*/*.js', 'js/*/*/*.js'])
               .pipe(jshint())
               .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {  
  return gulp.src(['js/*.js', 'js/*/*.js', 'js/*/*/*.js'])
    .pipe(gulp.dest('scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('scripts'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('watch', function() {
    gulp.watch('css/less/*.less', ['less']);
});