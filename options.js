
var _ = require('lodash');
var options = require('./options.default.js');

function toArray(value) {
    return _([value]).flatten().compact().value();
}

function negateMiniMatch(input) {
    if (_.isArray(input)) {
        return _.chain(input).map(negateMiniMatch).flatten().compact().value();
    }
    if (_.isString(input)) {
        if (_.startsWith(input, '!')) {
            return input.substr(1);
        }
        return '!' + input;
    }
    return negateMiniMatch(toArray(input));
}

module.exports = function(gulp, $, taskArray, ops){

    options.taskArray = taskArray;
    options.files = _.mapValues(options.files, toArray);
    if(!_.contains(options.taskArray,'rev')){
        options.rev = false;
    }
    options = _.merge(options, ops);

    options.plugins = $;

    options.files = _.mapValues(options.files, toArray);

    var negatedVendors = negateMiniMatch(options.files.vendor);

    if (!!options.files.test) {
        options.files.js = options.files.js.concat(negateMiniMatch(options.files.test));
    }

    if (!!options.bower) {
        negatedVendors = negatedVendors.concat(negateMiniMatch(options.bower));
        var bowerFiles;
        try {
            bowerFiles = $.mainBowerFiles({
                read: false
            });
        }catch (e){
            $.util.log($.util.colors.magenta('WARNING!!!'), e);
            bowerFiles = [];
        }
        options.files.vendor = bowerFiles.concat(options.files.vendor);
    }

    options.files.jsNoVendor = options.files.js.concat(negatedVendors);
    options.files.cssNoVendor = options.files.css.concat(negatedVendors);

    options.injectInto = _.mapValues(options.injectInto, function (injectables) {
        if (_.isObject(injectables) && (injectables.hasOwnProperty('pre') || injectables.hasOwnProperty('post'))) {
            return {
                pre: toArray(injectables.pre),
                post: toArray(injectables.post)
            };
        }
        return {
            pre: [],
            post: toArray(injectables)
        };
    });

    return options;

};
