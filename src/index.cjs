'use strict';

/**
 * Legacy CommonJS entry point.
 * The package is authored as ES Modules; Node.js >= 22.12 can require() them
 * natively, so this shim shares the very same module instance as `import`.
 */
const { default: FeedEmitter } = require('./index.js');

module.exports = FeedEmitter;
