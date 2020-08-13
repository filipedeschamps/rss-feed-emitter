'use strict';

/**
 * Generic feed error
 * @extends Error
 * @classdesc Wraps feed errors allowing specification of the feed that errored.
 * @property {string} name name of the error
 * @property {string} message Standardized error message
 * @property {string} feed Feed URL producing the error
 */
class FeedError extends Error {
  /**
   * Create a Feed error
   * @param {string} message error message
   * @param {string} type    Type of error, provides Error#name
   * @param {string} feed    Feed url that originated the error
   */
  constructor(message, type, feed) {
    super(message);
    /**
     * Type of error
     * @type {string}
     */
    this.name = type;
    /**
     * Feed url causing the error
     * @type {string}
     */
    this.feed = feed;
  }

  toString() {
    return `${this.name} : ${this.message}\n${this.feed}`;
  }
}

module.exports = FeedError;
