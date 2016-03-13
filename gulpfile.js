'use strict';

// Плагины
var gulp         = require('gulp'),
		plumber      = require('gulp-plumber'),
		runSequence  = require('run-sequence'),
		del          = require('del'),
		fs           = require('fs'),
		watch        = require('gulp-watch'),
		bower        = require('gulp-bower'),
		prefixer     = require('gulp-autoprefixer'),
		uglify       = require('gulp-uglify'),
		less         = require('gulp-less'),
		pixrem       = require('gulp-pixrem'),
		rename       = require("gulp-rename"),
		rigger       = require('gulp-rigger'),
		cssnano      = require('gulp-cssnano'),
		csscomb      = require('gulp-csscomb'),
		imagemin     = require('gulp-imagemin'),
		pngquant     = require('imagemin-pngquant'),
		browserSync  = require("browser-sync"),
		reload       = browserSync.reload;


// Настройки путей
var path = {
	build: { // Релиз
			html: 'build/',
			js: 'build/js/',
			css: 'build/css/',
			style: 'build/css/*.css',
			img: 'build/img/',
			fonts: 'build/fonts/'
	},
	src: { // Исходники
			html: 'src/*.html',
			js: 'src/js/main.js',
			style: 'src/style/*.less',
			img: 'src/img/**/*.*',
			fonts: 'src/fonts/**/*.*'
	},
	watch: { // Изменяющиеся
			html: 'src/**/*.html',
			js: 'src/js/**/*.js',
			style: 'src/style/**/*.less',
			img: 'src/img/**/*.*',
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

// Bower
gulp.task('bower', function() {
	return bower();
});


// ###Собираем HTML###
gulp.task('html:build', function () {
	gulp.src(path.src.html)
		.pipe(plumber())
		.pipe(rigger())
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({stream: true}));
});


// ###Собираем CSS###
gulp.task('css:build', function () {
	gulp.src(path.src.style)
		.pipe(plumber())
		.pipe(less())
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}));
});
	// Префиксы и стилизация
	gulp.task('css:comb', function () {
		gulp.src(path.build.style)
			.pipe(prefixer({ browsers: ['last 5 versions', '> 2%', 'ie 8'] }))
			.pipe(pixrem({ rootValue: '10px' }))
			.pipe(csscomb())
			.pipe(gulp.dest(path.build.css))
	});
		// Сжатие
		gulp.task('css:nano', function () {
			gulp.src(path.build.style)
				.pipe(cssnano()) // Сжимаем
				.pipe(rename({ suffix: '.min' }))
				.pipe(gulp.dest(path.build.css)) // Сохраняем сжатую версию
		});
		// Таски вместе
		gulp.task('css:final', function(callback) {
			runSequence('css:build', 'css:comb', 'css:nano', callback);
		});


// ###Собираем JS###
gulp.task('js:build', function () {
	gulp.src(path.src.js) // Ищем main файл
		.pipe(plumber())
		.pipe(rigger())
		.pipe(gulp.dest(path.build.js))
		.pipe(reload({stream: true}));
});
	// Сжатие
	gulp.task('js:min', function () {
		gulp.src(path.src.js)
			.pipe(rigger())
			.pipe(gulp.dest(path.build.js))
			.pipe(uglify())
			.pipe(rename('main.min.js'))
			.pipe(gulp.dest(path.build.js))
			.pipe(reload({stream: true}));
	});
	// Таски вместе
	gulp.task('js:final', function(callback) {
		runSequence('js:build', 'js:min', callback);
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


// Все задачи в массиве
gulp.task('build', [
	'clean',
	'html:build',
	'js:build',
	'css:build',
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
			gulp.start('css:build');
	});
	watch([path.watch.js], function(event, cb) {
			gulp.start('js:build');
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