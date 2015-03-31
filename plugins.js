var _ = require('lodash');

var through = require('through');

var path = require('path');

var browserSync = require('browser-sync');

module.exports = function (gulp) {
    var $ = require('gulp-load-plugins')({
        pattern: [
            'gulp-*',
            'main-bower-files',
            'streamqueue',
            'lazypipe',
            'del',
            'vinyl-paths'
        ]
    });

    $.reload = browserSync.reload;

    $.errorHandler = function(error) {
        // Output an error message
        $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
        // emit the end event, to properly end the task
        this.emit('end');
    };

    $.jsMinify = $.lazypipe()
        .pipe($.ngAnnotate)
        .pipe($.uglify);

    $.cssMinify = $.lazypipe()
        .pipe($.autoprefixer, {
            browsers: ['> 1%', 'last 4 versions', 'Firefox ESR', 'Opera 12.1'],
            cascade: true
        })
        .pipe($.minifyCss, {
            keepSpecialComments: 0
        });

    $.generateOutPipe = function (baseDir, relDir, name, rev, pipe) {
        var dir = path.join(baseDir, relDir);

        var output;

        if (rev) {
            output = generateRevOutPipe(dir, baseDir, name);
        } else {
            output = $.lazypipe().pipe(gulp.dest, dir);
        }
        if (!!pipe) {
            output = $.lazypipe().pipe(pipe).pipe(output);
        }

        return output;

    };

    function generateRevOutPipe(dir, baseDir, name) {
        return $.lazypipe()
            .pipe($.rev)
            .pipe(gulp.dest, dir)
            .pipe($.rev.manifest, 'rev-' + name + '.json', {
                merge: true
            })
            .pipe(gulp.dest, baseDir);
    }

    $.htmlMinify = $.lazypipe()
        .pipe($.htmlmin, {
            collapseBooleanAttributes: false,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true
        });


    $.filterVinylFSByStatus = function (statuses) {
        var count = false;

        if (!_.isArray(statuses)) {
            statuses = [statuses];
        }

        function countFiles(file) {
            count = count || _.contains(statuses, file.event);
        }

        function endStream() {
            this.emit('data', count);
            count = false;
            this.emit('end');
        }

        return through(countFiles, endStream);
    };

    return $;
};
