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
var flatten = require('gulp-flatten');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');

var templates = {};

var paths = {
  images: '**/img/*',
  html: 'extension/**/*.html',
  css: ['extension/**/*.css'],
  js: ['extension/**/*.js','!extension/**/*jquery.*'],
  jsc: ['extension/**/controller.js','!extension/**/*jquery.*'],
  lint: ['extension/**/*.js','!extension/**/jquery*.js','!extension/**/lib/*.js','!extension/**/lame.js']
};

gulp.task('default', ['template-build','ext-build']);

gulp.task('clean', ['clean-scripts','clean-images']);

gulp.task('ext-build', ['copy-images', 'copy-build']);




// JS
gulp.task('js-compress',['clean-scripts'], function () {
    return gulp.src(paths.js)
    .pipe(uglify())
    .pipe(flatten())
    .pipe(gulp.dest('build/scripts'));
});

gulp.task('js-build',['js-compress'], function () {
    return gulp.src('build/scripts/*')
    .pipe(tap(function (file, t) {
        var filePath = file.relative;
        var fileNameWithExt = path.basename(filePath);
        var fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf("."));
        if (!templates[fileName]) templates[fileName] = {};
        gutil.log('processing ' + filePath);
        var raw = fs.readFileSync('build/scripts/' + filePath, 'utf8');
        templates[fileName].js = raw.replace(/(?:\r\n|\r|\\n|\t)/g,"");
    }));
});
// 'get-html', 'get-css', 
gulp.task('template-build', ['js-build'], function () {
    return file('templates.js', '', {src:true})
    .pipe(tap(function () {
        fs.writeFile('build/templates.js'
            , "var peppermint = " + stringify(templates)
        );
    }));
});

gulp.task('copy-build', function () {
  return gulp
    .src('build/templates.js')
    .pipe(rename('build.js'))
    .pipe(gulp.dest('build/extension'));
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



gulp.task('images', ['clean-images'], function() {
  return gulp.src(paths.images)
    .pipe(flatten())
    // .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('build/img'));
});

gulp.task('copy-images', function () {
  return gulp
    .src('build/img/*')
    .pipe(gulp.dest('build/extension/img'));
})



// this runs the `bundle-templates` task before starting the watch (initial bundle)
// gulp.task('watch', ['template-build'], function () {
//     gulp.watch(['app/templates/*/*.html'], ['template-build']);
// });










// HTML
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

// CSS
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












gulp.task('print-js', function() {
  return gulp.src(paths.js)
    .pipe(gprint());
});

gulp.task('print-images', function() {
  return gulp.src(paths.images)
    .pipe(gprint());
});

gulp.task('clean-scripts', function() {
  return del(['build/scripts/*','build/templates.js']);
});

gulp.task('clean-images', function(){
    return del(['build/img/*','build/extension/img/*']);
});

gulp.task('lint', function() {
    return gulp.src(paths.lint)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});
