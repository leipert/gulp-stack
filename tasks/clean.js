// Rimraf: A deep deletion module for node (like `rm -rf`)
var rimraf = require('rimraf');

module.exports = function(options) {
  return function(callback) {
    //Deletes build path which is defined in options
    //Callback function is called so that gulp knows
    //when we finished
    rimraf(options.paths.build, callback);
  }
};
