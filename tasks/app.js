var _ = require('lodash');

function injectIntoStream(stream, injectables) {

    _.forEach(injectables, function (c) {
        if (_.isFunction(c)) {
            stream.queue(c());
        } else {
            stream.queue(c);
        }
    });
}

module.exports = function (gulp, options) {

    var $ = options.plugins;

    return [
        // Creates 'app' task with given dependencies
        {
            deps: ['app.css', 'app.js']
        },
        // Creates 'app.js' task with dependencies and work function
        {
            name: 'js',
            deps: ['clean'],
            // Takes all app javascript files, angular templates and concats and minifies them
            work: function () {
                var stream = new $.streamqueue({
                    objectMode: true
                });

                //Optionally injected additional javascript sourcecode
                injectIntoStream(stream, options.injectInto.js.pre);

                // App files without vendor files
                stream.queue(gulp.src(options.files.jsNoVendor));

                //Angular template files
                stream.queue(
                    gulp.src(options.files.partials)
                        .pipe($.htmlMinify())
                        .pipe($.angularTemplatecache(options.templateCacheOptions))
                );

                //Optionally injected additional javascript sourcecode
                injectIntoStream(stream, options.injectInto.js.post);

                return stream
                    .done()
                    .pipe($.angularFilesort())
                    .pipe($.concat(options.output.js.app))
                    .pipe($.generateOutPipe(options.paths.build, options.output.js.path, 'app.js', options.rev, $.jsMinify)());
            }
        },
        {
            name: 'css',
            deps: ['clean'],
            // Takes all app css files and concats and minfies them
            work: function () {

                var stream = new $.streamqueue({
                    objectMode: true
                });

                //Optionally injected additional css sourcecode
                injectIntoStream(stream, options.injectInto.css.pre);

                // App files without vendor files
                stream.queue(gulp.src(options.files.cssNoVendor));

                //Optionally injected additional css sourcecode
                injectIntoStream(stream, options.injectInto.css.post);

                return stream
                    .done()
                    .pipe($.concat(options.output.css.app))
                    .pipe($.generateOutPipe(options.paths.build, options.output.css.path, 'app.css', options.rev, $.cssMinify)());
            }
        }

    ];
};
