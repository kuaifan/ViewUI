const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const less = require('gulp-less');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const fs = require('fs');
const path = require('path');

// 编译less
gulp.task('css', function () {
    gulp.src('../src/styles/index.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie > 8']
        }))
        .pipe(cleanCSS())
        .pipe(rename('iview.css'))
        .pipe(gulp.dest('../dist/styles'))
        .on('end', function() {
            // 在CSS生成完成后进行注释替换
            const cssFilePath = path.join(__dirname, '../dist/styles/iview.css');
            try {
                // 同步读取文件
                const data = fs.readFileSync(cssFilePath, 'utf8');
                // 替换 /*! @replace xxxx */ 为 xxxx
                const result = data.replace(/\/\*!\s*@replace\s+([^*]+?)\s*\*\//g, '$1');
                // 同步写入文件
                fs.writeFileSync(cssFilePath, result, 'utf8');
            } catch (err) {
                // 静默处理错误
            }
        });
});

// 拷贝字体文件
gulp.task('fonts', function () {
    gulp.src('../src/styles/common/iconfont/fonts/*.*')
        .pipe(gulp.dest('../dist/styles/fonts'));
});

gulp.task('default', ['css', 'fonts']);
