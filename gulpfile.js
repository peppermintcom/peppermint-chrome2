var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');
var gprint = require('gulp-print');
var fs = require('fs');
var tap = require('gulp-tap');
var path = require('path');
var file = require('gulp-file');
var stringify = require('stringify-object');

// var sourcemaps = require('gulp-sourcemaps');
// var sass = require('gulp-sass');

var paths = {
  scripts: ['extension/**/*.js'  
  , '!extension/gmail_content/**/*.js'
  , '!extension/options/*.js'
  , '!extension/popup/**/*.js'
  , '!extension/record_popup/**/*.js'
  ],
  images: '**/img/*',
  html: 'extension/**/*.html',
  css: ['extension/**/*.css'],
  js: ['extension/**/*.js']
};

var templates = {};

gulp.task('clean', function() {
  return del(['build/*']);
});

gulp.task('print-scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(gprint());
});

gulp.task('print-images', function() {
  return gulp.src(paths.images)
    .pipe(gprint());
});

gulp.task('lint', function() {
    return gulp.src(['extension/gmail_content/**/*.js','!extension/**/jquery*.js','!extension/**/lib/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('get-html', function () {
    return gulp.src(paths.html)
    .pipe(tap(function (file, t) {
        var filePath = file.relative;
        var fileNameWithExt = path.basename(filePath);
        var fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf("."));
        
        if (!templates[fileName]) templates[fileName] = {};
        templates[fileName].html = fs.readFileSync('extension/' + filePath, 'utf8')
          .replace(/(?:\r\n|\r|\n|\t)/g,"");
    }));
});

gulp.task('get-css', function () {
    return gulp.src(paths.css)
    .pipe(tap(function (file, t) {
        var filePath = file.relative;
        var fileNameWithExt = path.basename(filePath);
        var fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf("."));
        if (!templates[fileName]) templates[fileName] = {};
        templates[fileName].css = fs.readFileSync('extension/' + filePath, 'utf8')
          .replace(/(?:\r\n|\r|\n|\t)/g,"");
    }));
});

gulp.task('get-js', function () {
    return gulp.src(paths.js)
    // .pipe(uglify())
    .pipe(tap(function (file, t) {
        var filePath = file.relative;
        var fileNameWithExt = path.basename(filePath);
        var fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf("."));
        if (!templates[fileName]) templates[fileName] = {};
        templates[fileName].js = fs.readFileSync('extension/' + filePath, 'utf8')
          .replace(/(?:\r\n|\r|\n|\t)/g,"");
    }));
});

gulp.task('template-build', ['clean', 'get-html', 'get-css', 'get-js'], function () {
     file('templates.js', '', {src:true})
    .pipe(gulp.dest('build'))
    .pipe(tap(function () {
        fs.writeFile('build/templates.js', "var templates =  " + stringify(templates));
    }));
});

// gulp.task('scripts', ['clean'], function() {
//   return gulp.src(paths.scripts)
//     // .pipe(sourcemaps.init())
//     // .pipe(coffee())
//     .pipe(concat('all.js'))
//     // .pipe(sourcemaps.write())
//     .pipe(gulp.dest('build/js'))
//     .pipe(rename('all.min.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('build/js'));
// });

gulp.task('images', ['clean'], function() {
  return gulp.src(paths.images)
    // .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('build/img'));
});

// this runs the `bundle-templates` task before starting the watch (initial bundle)
// gulp.task('watch', ['template-build'], function () {
//     gulp.watch(['app/templates/*/*.html'], ['template-build']);
// });

// Rerun the task when a file changes
// gulp.task('watch', function() {
//   gulp.watch(paths.scripts, ['scripts']);
//   gulp.watch(paths.images, ['images']);
// });

// The default task (called when you run `gulp` from cli)
// gulp.task('default', ['watch', 'template-build']);
gulp.task('default', ['template-build']);