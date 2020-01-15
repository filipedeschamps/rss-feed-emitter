'use strict';

const FeedParser = require('feedparser');
const request = require('request');
const FeedError = require('./FeedError');

const RESPONSE_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  ISE: 500,
};

/**
 * This module manages automatically how many feed items
 * it will keep in memory, and basically it will have a
 * maximum history which is how many items the feed has
 * multiplied by this number below. So, if the feed have
 * 10 items, we will keep 30 items max in the history.
 * @type {Number}
 */
const historyLengthMultiplier = 3;

/**
 * Default UserAgent string
 * Since static stuff doesn't work in older versions, keep using global const
 * @type {String}
 */
const DEFAULT_UA = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';


class Feed {
  constructor(data) {
    ({
      items: this.items,
      url: this.url,
      refresh: this.refresh,
      userAgent: this.userAgent,
    } = data);

    if (!this.items) {
      this.items = [];
    }

    if (!this.url) {
      throw new TypeError('missing required field `url`');
    }

    if (!this.refresh) {
      this.refresh = 60000;
    }

    /**
     * If the user has specified a User Agent
     * we will use that as the 'user-agent' header when
     * making requests, otherwise we use the default option.
     * @type {string}
     */
    if (!this.userAgent) {
      this.userAgent = DEFAULT_UA;
    }
  }

  /**
   * Given a feed and item, try to find
   * it inside the feed item list. We will use
   * this to see if there's already an item inside
   * the feed item list. If there is, we know it's
   * not a new item.
   * @param       {Object} item item specitics
   * @returns      {Object}      the matched element
   */
  findItem(item) {
    return this.items.find((entry) => {
      // if feed is RSS 2.x, check existence of 'guid'
      if (item.guid) return entry.guid === item.guid;
      // if feed is Atom 1.x, check existence of 'id'
      if (item.id) return entry.id === item.id;
      // default object with 'link' and 'title'
      return entry.link === item.link && entry.title === item.title;
    });
  }

  updateHxLength(newItems) {
    this.maxHistoryLength = newItems.length * historyLengthMultiplier;
  }

  addItem(item) {
    this.items.push(item);
    this.items = this.items.slice(this.items.length - this.maxHistoryLength, this.items.length);
  }

  fetchData() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const items = [];
      const feedparser = new FeedParser();
      feedparser.on('readable', () => {
        const item = feedparser.read();
        item.meta.link = this.url;
        items.push(item);
      });
      feedparser.on('error', () => {
        reject(new FeedError(`Cannot parse ${this.url} XML`, 'invalid_feed', this.url));
      });
      feedparser.on('end', () => {
        resolve(items);
      });

      request
        .get({
          url: this.url,
          headers: {
            'user-agent': this.userAgent,
            accept: 'text/html,application/xhtml+xml,application/xml,text/xml',
          },
        })
        .on('response', (res) => {
          if (res.statusCode !== RESPONSE_CODES.OK) {
            reject(new FeedError(`This URL returned a ${res.statusCode} status code`, 'fetch_url_error', this.url));
          }
        })
        .on('error', () => {
          reject(new FeedError(`Cannot connect to ${this.url}`, 'fetch_url_error', this.url));
        })
        .pipe(feedparser)
        .on('end', () => resolve(items));
    });
  }

  destroy() {
    clearInterval(this.interval);
    delete this.interval;
  }
}

module.exports = Feed;
