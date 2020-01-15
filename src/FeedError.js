'use strict';

class FeedError extends Error {
  constructor(message, type, feed) {
    super(message);
    this.name = type;
    this.feed = feed;
  }
}

module.exports = FeedError;
