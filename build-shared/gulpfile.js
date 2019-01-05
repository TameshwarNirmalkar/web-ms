const gulp = require('gulp');


gulp.task('copy-shared-files', function () {

  return gulp
    .src(['../src/app/shared/**'])
    .pipe(gulp.dest('src/shared'));

});

gulp.task('copy-core-files', function () {

  return gulp
    .src(['../src/app/core/**'])
    .pipe(gulp.dest('src/core'))

})

gulp.task('default', ['copy-shared-files', 'copy-core-files']);
