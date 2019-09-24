class RssFeedError extends Error {
  constructor(message, type) {
    super(message);
    this.name = type;
  }
}

module.exports = RssFeedError;
