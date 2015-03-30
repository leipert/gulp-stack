var _ = require('lodash');

module.exports = {
    deps: ['clean'],
    task: function (gulp, options) {

        var $ = options.plugins;

        return _.map(options.files.static, function (c) {
            return {
                name: c.name,
                deps: ['clean'],
                work: function () {

                    var filter = $.filter('**');
                    if (c.src === '$vendor') {
                        c.src = options.files.vendor;
                    }
                    if (!!c.filter) {
                        filter = $.filter(c.filter);
                    }
                    if (!_.isString(c.folder)) {
                        c.folder = '';
                    }
                    c.rev = c.rev && options.rev;
                    var output = $.generateOutPipe(options.paths.build, c.folder, c.name, c.rev, c.pipe);
                    return gulp.src(c.src).pipe(filter).pipe(output());
                }
            }
        }).concat([
            {
                deps: _.chain(options.files.static).pluck('name').map(function (c) {
                    return 'static.' + c;
                }).value(),
                desc: 'Copies all static files'
            }
        ]);

    }
};
