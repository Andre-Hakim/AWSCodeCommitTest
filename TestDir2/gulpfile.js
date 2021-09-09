var gulp = require('gulp'),
    sourcemaps = require ('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require("gulp-rename"),
    watch = require('gulp-watch'),
    del = require('del');

const paths = {
  src: 'src/**/*',
  srcJS: 'src/wp-content/themes/**/js',
  srcSASS: 'src/wp-content/themes/**/sass',
  srcCSS: 'src/wp-content/themes/**/css',

  dest: 'public',

  modules: 'node_modules'
};

gulp.task('clean', () => {
  return del([paths.dest+'/**/*', '!'+paths.dest]);
});

gulp.task('copy', (cb) => {
  // move static/compiled files
  return gulp.src([paths.src, '!'+paths.srcSASS, '!'+paths.srcSASS+'/**'])
    .pipe(gulp.dest(paths.dest))
    .on('end', () => { cb(); });
});

// Shouldn't need to call this directly. Use sass task, which calls this.
gulp.task('sass-minify', () => {
  // compile sass, minify, and write sourcemaps
  return gulp.src([paths.srcSASS+'/style.scss'], { base: './src'})
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: ['node_modules/normalize.css']}).on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace('sass', 'css');
      path.extname = '.min.css';
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dest));
});

gulp.task('sass', gulp.parallel('sass-minify', () => {
  // compile sass and write sourcemaps
  return gulp.src([paths.srcSASS+'/style.scss'], { base: './src'})
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: ['node_modules/normalize.css']}).on('error', sass.logError))
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace('sass', 'css');
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dest));
}));

gulp.task('js', (cb) => {
  // minify js files and rename to .min
  // exclude already .min files
  return gulp.src([paths.srcJS+'/**/*.js', '!'+paths.srcJS+'/**/*.min.js'], { base: './src'})
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dest))
    .on('end', () => { cb(); });
});

// gulp.task('watch', () => {
//   gulp.watch(paths.srcSASS+'/**/*.scss', gulp.series('sass'));
//   gulp.watch([paths.srcJS+'/**/*.js', '!'+paths.srcJS+'/**/*.min.js'], gulp.series('js'));

//   // watch and move only modified file, instead of all files
//   gulp.src([paths.src, '!'+paths.srcSASS, '!'+paths.srcSASS+'/**', '!'+paths.srcJS])
//     .pipe(watch([paths.src, '!'+paths.srcSASS, '!'+paths.srcSASS+'/**', '!'+paths.srcJS]))
//     .pipe(gulp.dest(paths.dest));
// });

// compile and copy everything
gulp.task('compile', gulp.series('copy', 'sass', 'js'));

//gulp.task('default', gulp.series('compile', 'watch'));