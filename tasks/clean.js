// Rimraf: A deep deletion module for node (like `rm -rf`)

module.exports = function (gulp, options) {

    var $ = options.plugins;

    return function (cb) {
        $.del(options.paths.build, cb);
    }
};
