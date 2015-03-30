var _ = require('lodash');
var options = require('./options.js');
var allTasks = [];

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

module.exports = function (gulp, taskArray, ops) {
    options.taskArray = taskArray;
    options.files = _.mapValues(options.files, toArray);
    if(!_.contains(options.taskArray,'rev')){
        options.rev = false;
    }
    options = _.merge(options, ops);

    var $ = require('./plugins.js')(gulp);

    options.plugins = $;

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
            };
        }
        return {
            pre: [],
            post: toArray(injectables)
        };
    });

    var tasksToBeLoaded = {};

    _.forEach(options.taskArray, requireTaskAndDeps);

    _.forEach(tasksToBeLoaded, function (task, name) {
        if (_.isFunction(task)) {
            task = task(gulp, options);
        }

        if (!_.isArray(task)) {
            task = [{
                work: task
            }];
        }

        _.forEach(task, $createTasksFromFile(name, task));
    });

    var helpTask = require('./tasks/help')(allTasks, options);

    _.forEach(helpTask, $createTasksFromFile('help'));

    return gulp;

    function requireTaskAndDeps(name){
        if(!tasksToBeLoaded.hasOwnProperty(name)){
            var task = require('./tasks/' + name);
            if(_.isObject(task) && !_.isFunction(task)){
                _.forEach(toArray(task.deps),requireTaskAndDeps);
                task = task.task;
            }
            tasksToBeLoaded[name] = task;
        }
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

    function createTask(task) {

        task.deps = _.union(toArray(task.deps),toArray(options.deps[task.name]));

        if (task.deps) {
            gulp.task(task.name, task.deps, task.work);
        } else {
            gulp.task(task.name, task.work);
        }

        allTasks.push(task);
    }

};
