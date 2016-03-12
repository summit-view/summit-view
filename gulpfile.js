var gulp = require('gulp');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var gulpWebpack = require('webpack-stream');
var webpack = require('webpack');

gulp.task('core-css', function() {
    gulp.src(['./public/styles/*.styl'])
        .pipe(stylus({
            compress: true
        }))
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./dist/styles'));
});

gulp.task('themes-css', function() {
    gulp.src(['./themes/**/*.styl'])
        .pipe(stylus({
            compress: true
        }))
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./themes'));
});

gulp.task('webpack', function() {
    var webpackOptions = {
        entry: {
            'app': './public/js/app.js',
        },
        watch: false,
        output: {
            path: '/',
            filename: '[name]-bundle.js',
            sourceMapFilename: '[file].map',
        },
        module: {
            loaders: [
                { test: /\.css$/, loader: 'style-loader!css-loader' },
                { test: /\.png$/, loader: 'url-loader?limit=100000' },
                { test: /\.gif$/, loader: 'url-loader?limit=100000' },
                { test: /\.jpg$/, loader: 'file-loader' },
                { test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/, loader: 'file-loader' },
            ]
        },
        resolve: {
            modulesDirectories: ['node_modules'],
            alias: {
            },
        },
        devtool: 'source-map',
    };

    var opt = Object.assign({}, webpackOptions, { plugins : [new webpack.optimize.UglifyJsPlugin({minimize: true, compress: true})] });
    return gulp.src([ './public/js/**.*' ])
        .pipe(gulpWebpack(opt))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('watch', function() {
    gulp.watch('themes/**/*.styl', ['themes-css']);
    gulp.watch('public/**/*.styl', ['core-css']);
    gulp.watch('public/js/**/*.js', ['webpack']);
    gulp.start('themes-css');
    gulp.start('core-css');
    gulp.start('webpack');
});

gulp.task('build', function() {
    gulp.start('themes-css');
    gulp.start('core-css');
    gulp.start('webpack');
});
