'use strict';

var gulp = require('gulp'),
  watch = require('gulp-watch'),
  prefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  rigger = require('gulp-rigger'),
  cssmin = require('gulp-cssnano'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  rimraf = require('rimraf'),
  browserSync = require('browser-sync'),
  lint = require('gulp-sass-lint'),
  csscomb = require('gulp-csscomb'),
  plumber = require('gulp-plumber'),
  svgSprite = require('gulp-svg-sprite'),
  svgmin = require('gulp-svgmin'),
  cheerio = require('gulp-cheerio'),
  reload = browserSync.reload;

// Basic svg-sprite configuration
var svgSpriteConfig                = {
  mode                : {
    symbol             : {     // Activate the «symbol» mode
      dest : '.',
      sprite : 'sprite.symbol.html'
    }
  }
};

var path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    pic: 'build/pic/',
    fonts: 'build/fonts/'
  },
  src: {
    html: 'src/*.html',
    js: 'src/js/main.js',
    style: 'src/style/main.scss',
    img: 'src/img/*.*',
    imgSvg: 'src/img/sprite-svg/*.svg',
    pic: 'src/pic/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  watch: {
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    style: 'src/style/**/*.scss',
    img: 'src/img/*.*',
    imgSvg: 'src/img/sprite-svg/*.svg',
    pic: 'src/pic/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  clean: './build'
};

var config = {
  server: {
    baseDir: './build'
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  logPrefix: 'Sedona'
};
 
gulp.task('csscomb', function() {
  return gulp.src('src/style/main.scss')
    .pipe(csscomb())
    .pipe(gulp.dest('src/style/main.scss'));
});

gulp.task('stylelint', function () {
  gulp.src('src/style/**/*.s+(a|c)ss')
    .pipe(lint())
    .pipe(lint.format())
    .pipe(lint.failOnError())
});

gulp.task('webserver', function () {
  browserSync(config);
});

gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
  gulp.src(path.src.html) 
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
  gulp.src(path.src.js) 
    .pipe(rigger()) 
    .pipe(sourcemaps.init()) 
    .pipe(uglify()) 
    .pipe(sourcemaps.write()) 
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
  gulp.src(path.src.style) 
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({
      includePaths: ['src/style/'],
      outputStyle: 'compressed',
      sourceMap: true,
      errLogToConsole: true
    }))
    .pipe(prefixer())
    .pipe(cssmin())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
  gulp.src(path.src.img) 
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false},{removeFill: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});

gulp.task('svg:build', function () {
  gulp.src(path.src.imgSvg) 
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgSprite(svgSpriteConfig))
    .pipe(gulp.dest('src/template/'))
    .pipe(reload({stream: true}));
});

gulp.task('picture:build', function () {
  gulp.src(path.src.pic) 
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.pic))
    .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
  'svg:build',
  'js:build',
  'style:build',
  'fonts:build',
  'image:build',
  'picture:build',
  'html:build'
]);

gulp.task('watch', function(){
  watch([path.watch.imgSvg], function(event, cb) {
    gulp.start('svg:build');
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start('style:build');
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start('js:build');
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start('image:build');
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start('picture:build');
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start('fonts:build');
  });
   watch([path.watch.html], function(event, cb) {
    gulp.start('html:build');
  });
});


gulp.task('default', ['build', 'webserver', 'watch']);