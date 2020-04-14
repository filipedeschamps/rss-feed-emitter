'use strict';

class FeedError extends Error {
  constructor(message, type, feed) {
    super(message);
    this.name = type;
    this.feed = feed;
  }

  toString() {
    return `${this.name} : ${this.message}\n${this.feed}`;
  }
}

module.exports = FeedError;
