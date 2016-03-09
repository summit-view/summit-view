var gulp = require('gulp');
var stylus = require('gulp-stylus');

gulp.task('themes-css', function() {
    gulp.src(['./themes/**/*.styl'])
        .pipe(stylus({
            compress: true
        }))
        .pipe(gulp.dest('./themes'));
});

gulp.task('watch', function() {
    gulp.watch('themes/**/*.styl', ['themes-css']);
    gulp.start('themes-css');
});
