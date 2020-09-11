const baseConfig = require('lyne-helper-eslint-config');

baseConfig.globals = {
  __dirname: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly'
};

baseConfig.plugins = ['yaml'];

module.exports = baseConfig;
