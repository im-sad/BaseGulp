'use strict';

// Плагины
var gulp         = require('gulp'),
		//gutil        = require('gulp-util'),
		plumber      = require('gulp-plumber'),
		notify       = require('gulp-notify'),
		runSequence  = require('run-sequence'),
		del          = require('del'),
		fs           = require('fs'),
		rename       = require("gulp-rename"),
		useref       = require('gulp-useref'),
		watch        = require('gulp-watch'),
		uglify       = require('gulp-uglify'),
		fileinclude  = require('gulp-file-include'),
		sass         = require('gulp-sass'),
		prefixer     = require('gulp-autoprefixer'),
		cleanCSS     = require('gulp-clean-css'),
		csscomb      = require('gulp-csscomb'),
		pixrem       = require('gulp-pixrem'),
		wiredep      = require('wiredep').stream,
		imagemin     = require('gulp-imagemin'),
		pngquant     = require('imagemin-pngquant'),
		zip          = require('gulp-zip'),
		browserSync  = require('browser-sync'),
		reload       = browserSync.reload;


// Настройки путей
var path = {
	build: { // Релиз
			html: 'build/',
			js: 'build/js/',
			jsfile: ['build/js/*.js', '!build/js/*.min.js'],
			css: 'build/css/',
			style: ['build/css/*.css', '!build/css/*.min.css'],
			img: 'build/img/',
			tmp: 'build/tmp/',
			fonts: 'build/fonts/',
			zip: 'build/*',
	},
	src: { // Исходники
			bower: 'src/*.html',
			html: 'src/*.html',
			js: 'src/js/*.js',
			style: 'src/style/*.scss',
			img: 'src/img/**/*.*',
			tmp: 'src/tmp/**/*.*',
			fonts: 'src/fonts/**/*.*'
	},
	watch: { // Изменяющиеся
			html: 'src/**/*.html',
			js: 'src/js/**/*.js',
			style: 'src/style/**/*.scss',
			img: 'src/img/**/*.*',
			tmp: 'src/tmp/**/*.*',
			fonts: 'src/fonts/**/*.*'
	},
	clean: 'build'
};


// Настройки Browser Sync
var config = {
	server: {
		baseDir: "./build"
	},
	tunnel: false,
	notify: false,
	host: 'localhost',
	port: 9000,
	logPrefix: "Frontend"
};

// Запуск Browser Sync
gulp.task('webserver', function () {
	browserSync(config);
});


// Удаление папки
gulp.task('clean', function () {
	del.sync(path.clean);
});


// ###Собираем HTML###
gulp.task('html:build', function () {
	gulp.src(path.src.html)
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(wiredep({
			optional: 'configuration',
			goes: 'here'
		}))
		.pipe(useref())
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({stream: true}));
});



// ###Собираем CSS###
gulp.task('css:build', function () {
	return gulp.src(path.src.style)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(sass())
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}));
});
// Cтилизация
gulp.task('css:style', function () {
	return gulp.src(path.build.style)
		.pipe(plumber())
		.pipe(prefixer({ browsers: ['last 5 versions', '> 2%', 'ie 8'] }))
		.pipe(pixrem({ rootValue: '10px' }))
		.pipe(csscomb())
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}));
});
// Сжатие
gulp.task('css:min', function () {
	return gulp.src(path.build.style)
		.pipe(plumber())
		.pipe(cleanCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}))
		.pipe(notify('Done! Compile done'));
});


gulp.task('css', function(cb) {
	runSequence('css:build', 'css:style', 'css:min', cb);
});





// ###Собираем JS###
gulp.task('js:build', function () {
	return gulp.src(path.src.js) // Ищем main файл
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(gulp.dest(path.build.js))
		.pipe(reload({stream: true}));
});
// Сжатие
gulp.task('js:min', function () {
	return gulp.src(path.build.jsfile)
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(path.build.js))
		.pipe(reload({stream: true}));
});
// Таски вместе
gulp.task('js', function(cb) {
	runSequence('js:build', 'js:min', cb);
});



// ###Собираем изображения###
gulp.task('img:build', function () {
	gulp.src(path.src.img)
		.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [pngquant()],
				interlaced: true
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe(reload({stream: true}));

		gulp.src(path.src.tmp)
			.pipe(gulp.dest(path.build.tmp))
			.pipe(reload({stream: true}));
});


// ###Копируем шрифты###
gulp.task('fonts:build', function() {
	gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
});


// ###Копируем jQuery###
gulp.task('jq:build', function() {
	gulp.src('./bower_components/jquery/dist/jquery.min.js')
		.pipe(gulp.dest(path.build.js))
});


// ###Архивируем проект###
gulp.task('zip', () => {
    return gulp.src(path.build.zip)
        .pipe(zip('html.zip'))
        .pipe(gulp.dest('./'));
});


// Все задачи в массиве
gulp.task('build', [
	'clean',
	'html:build',
	'js',
	'css',
	'img:build',
	'fonts:build',
	'jq:build'
]);


// Следим за изменениями
gulp.task('watch', function(){
	watch([path.watch.html], function(event, cb) {
			gulp.start('html:build');
	});
	watch([path.watch.style], function(event, cb) {
			gulp.start('css');
	});
	watch([path.watch.js], function(event, cb) {
			gulp.start('js');
	});
	watch([path.watch.img], function(event, cb) {
			gulp.start('img:build');
	});
	watch([path.watch.fonts], function(event, cb) {
			gulp.start('fonts:build');
	});
});


// Собираем файлы, запускаем веб-сервер, следим за изменениями
gulp.task('default', ['build', 'webserver', 'watch']);