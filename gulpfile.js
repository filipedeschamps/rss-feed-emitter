var gulp = require('gulp');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');


gulp.task('run:unit-test', function() {

  return gulp.src(['test/unit/**/*.spec.js'], { read: false })
    .pipe(plumber())
    .pipe(mocha({
      reporter: 'spec'
    }));

});
