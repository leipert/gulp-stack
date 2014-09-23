var _ = require('lodash');

var maxLength = 0;

function log($) {
  return function(task) {
    var ml = maxLength;
    var prefix = '';
    if (task.name.indexOf('.') > 0) {
      prefix = _.padRight(' |', 4, '-');
      ml = ml - 4;
    }
    var name = $.util.colors.bold.cyan(_.padRight(task.name, ml));

    var desc = '',
      deps = '';

    if (!!task.desc) {
      desc = ' ' + task.desc;
    }

    if (!_.isEmpty(task.deps)) {
      if (_.isUndefined(task.work)) {
        deps = '(alias for: ' + $.util.colors.cyan(task.deps.join(', ')) + ')';
      } else {
        deps = 'Dependencies: ' + $.util.colors.yellow(task.deps.join(', '));
      }
    }

    if (!!task.desc && !_.isEmpty(task.deps) && !_.isUndefined(task.work)) {
      $.util.log(prefix, name, desc);
      $.util.log(_.padRight(' |', maxLength + 2), deps);

    } else {
      $.util.log(prefix, name, desc, deps);
    }


  }
}

module.exports = function(allTasks, options) {

  var $ = options.plugins;

  return [
    {
      name: 'tasks',
      work: function() {
        maxLength = _(allTasks).pluck('name').max(_.size).length + 6;
        _.chain(allTasks).sortBy('name').forEach(log($)).value();
      }
    },
    {
      deps: ['help.tasks']
    }

  ]
};
