var _ = require('lodash');
var gulp = require('gulp');
var options = require('./options.js');
var allTasks = [];

function toArray(value) {
    return _([value]).flatten().compact().value();
}

function createTask(task) {

    task.deps = toArray(task.deps);

    if (task.deps) {
        gulp.task(task.name, task.deps, task.work);
    } else {
        gulp.task(task.name, task.work);
    }

    allTasks.push(task);
}

function $createTasksFromFile(prefix) {
    return function (task) {
        if (_.startsWith(task.name, '$')) {
            task.name = task.name.substr(1);
        } else if (_.isString(prefix)) {
            task.name = _.isString(task.name) ? prefix + '.' + task.name : prefix;
        }
        createTask(task);
    };
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

module.exports = function (taskArray, ops) {

    options.files = _.mapValues(options.files, toArray);

    options = _.merge(options, ops);

    var $ = options.plugins;

    options.paths.root = options.paths.root.concat(process.cwd());

    options.files = _.mapValues(options.files, toArray);

    var negatedVendors = negateMiniMatch(options.files.vendor);

    if (!!options.files.test) {
        options.files.js = options.files.js.concat(negateMiniMatch(options.files.test));
    }

    if (!!options.bower) {
        negatedVendors = negatedVendors.concat(negateMiniMatch(options.bower));
        options.files.vendor = $.mainBowerFiles({
            read: false
        }).concat(options.files.vendor);
    }

    options.files.jsNoVendor = options.files.js.concat(negatedVendors);
    options.files.cssNoVendor = options.files.css.concat(negatedVendors);

    options.injectInto = _.mapValues(options.injectInto, function (injectables) {
        if (_.isObject(injectables) && (injectables.hasOwnProperty('pre') || injectables.hasOwnProperty('post'))) {
            return {
                pre: toArray(injectables.pre),
                post: toArray(injectables.post)
            }
        }
        return {
            pre: [],
            post: toArray(injectables)
        }
    });

    _.forEach(taskArray, function (name) {
        var task = require('./tasks/' + name);

        if (_.isFunction(task)) {
            task = task(options);
        }

        if (!_.isArray(task)) {
            task = [{
                work: task
            }];
        }
        _.forEach(task, $createTasksFromFile(name, task));
    });

    var task = require('./tasks/help')(allTasks, options);

    _.forEach(task, $createTasksFromFile('help'));

    gulp.newTask = function (name, deps, work, description) {
        createTask({
            name: name,
            deps: deps,
            desc: description,
            work: work
        });
    };

    gulp.options = options;

    return gulp;
};
