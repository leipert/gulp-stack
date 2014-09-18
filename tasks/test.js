var _ = require('lodash');
var karma = require('karma').server;

var karmaCommonConf = {
  browsers: ['PhantomJS'],
  frameworks: ['jasmine'],
  files: [
    '.tmp/testing/assets.js',
    'app/**/angular-mocks.js',
    '.tmp/testing/scripts.js',
    'app/**/*.spec.js'
  ]
};

module.exports = [
  {
    name: 'once',
    deps: ['vendor.js', 'app.js'],
    work: function(done) {
      karma.start(_.assign({}, karmaCommonConf, {
        singleRun: true
      }), done);
    }
  },
  {
    deps: ['test.once']
  }
];
