'use strict';

const { EventEmitter } = require('events');

const FeedError = require('./FeedError');
const FeedManager = require('./FeedManager');
const Feed = require('./Feed');

/**
 * Default UserAgent string
 * Since static stuff doesn't work in older versions, keep using global const
 * @type {String}
 */
const DEFAULT_UA = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';

/**
 * Validate if the feed exists
 * @param  {Feed} feed feed configuration
 */
const checkFeed = (feed) => {
  if (!feed) {
    throw new FeedError('You must call #add method with a feed configuration object.', 'type_error');
  }
};

/**
 * Validate feed url is a string or array of strings
 * @param  {Feed} feed feed to validate url(s) for
 */
const checkUrl = (feed) => {
  if (!feed.url || !(typeof feed.url === 'string' || Array.isArray(feed.url))) {
    throw new FeedError('Your configuration object should have an "url" key with a string or array value', 'type_error');
  }
};

/**
 * Validate that the feed refresh is valid
 * @param  {Feed} feed feed to validate refresh timeout for
 */
const checkRefresh = (feed) => {
  if (feed.refresh && typeof feed.refresh !== 'number') {
    throw new FeedError('Your configuration object should have a "refresh" key with a number value', 'type_error');
  }
};

/**
 * MAIN CLASS
 * This is where we extend from TinyEmitter and absorve
 * the #emit and #on methods to emit 'new-item' events
 * when we have new feed items.
 * @extends EventEmitter
 * @class
 */
class FeedEmitter extends EventEmitter {
  /**
   * Checks that the feed object is valid
   * @param       {Object} feed to validate
   * @param       {string} ua User Agent string to pass to feeds
   */
  static validateFeedObject(feed, ua) {
    checkFeed(feed);
    checkUrl(feed);
    checkRefresh(feed);
    feed.userAgent = feed.userAgent || ua || DEFAULT_UA;
  }

  /**
   * The constructor special method is called everytime
   * we create a new instance of this "Class".
   * @param {Object} [options={ userAgent: defaultUA }] [description]
   */
  constructor(options = { userAgent: DEFAULT_UA, skipFirstLoad: false }) {
    super();

    /**
     * Array of feeds that are tracked
     * @private
     * @type {Feed[]}
     */
    this.feedList = [];

    /**
     * If the user has specified a User Agent
     * we will use that as the 'user-agent' header when
     * making requests, otherwise we use the default option.
     * @private
     * @type {string}
     */
    this.userAgent = options.userAgent;

    /**
     * Whether or not to skip the normal emit event on first load
     * @private
     * @type {boolean}
     */
    this.skipFirstLoad = options.skipFirstLoad;
  }


  /**
   * UserFeedConfig typedef
   * @typedef {Object} UserFeedConfig
   * @property {(string|string[])} url Url string or string array. Cannot be null or empty
   * @property {Number} refresh Refresh cycle duration for the feed.
   * @property {string} [eventName] Event name for a new feed item. Default "new-item".
   */

  /**
   * ADD
   * The #add method is one of the main ones. Basically it
   * receives one parameter with the feed options, for example:
   * {
   *    url: "http://www.nintendolife.com/feeds/news",
   *    refresh: 2000
   *  }
   * @public
   * @param {UserFeedConfig[]} userFeedConfig user feed config
   * @returns {Feed[]}
   */
  add(...userFeedConfig) {
    if (userFeedConfig.length > 1) {
      userFeedConfig.forEach((f) => this.add(f));
      return this.feedList;
    }

    const config = userFeedConfig[0];

    FeedEmitter.validateFeedObject(config, this.userAgent);

    if (Array.isArray(config.url)) {
      config.url.forEach((url) => {
        this.add({
          ...config,
          url,
        });
      });
      return this.feedList;
    }

    const feed = new Feed(config);

    this.addOrUpdateFeedList(feed);

    return this.feedList;
  }

  /**
   * REMOVE
   * This is a very simple method and its functionality is
   * remove a feed from the feedList.
   * @public
   * @param  {string} url   URL to add
   * @returns {Feed}     item removed from list
   */
  remove(url) {
    if (typeof url !== 'string') {
      throw new FeedError('You must call #remove with a string containing the feed url', 'type_error');
    }

    const feed = this.findFeed({
      url,
    });

    return this.removeFromFeedList(feed);
  }

  /**
   * List of feeds this emitter is handling
   * @public
   * @returns {Feed[]} Feed arrray
   */
  get list() {
    return this.feedList;
  }

  /**
   * Remove all feeds from feedList
   * @public
   */
  destroy() {
    this.feedList.forEach((feed) => feed.destroy());
    delete this.feedList;
    this.feedList = [];
  }

  /**
   * Add or remove a feed in the feed list
   * @private
   * @param {Feed} feed feed to be removed if it's present or added if it's not
   */
  addOrUpdateFeedList(feed) {
    const feedInList = this.findFeed(feed);
    if (feedInList) {
      this.removeFromFeedList(feedInList);
    }

    this.addToFeedList(feed);
  }

  /**
   * Find and return a feed
   * @private
   * @param  {UserFeedConfig} feed Feed to look up
   * @returns {Feed | null}
   */
  findFeed(feed) {
    return this.feedList.find((feedEntry) => feedEntry.url === feed.url);
  }

  /**
   * Add a feed to the feed list
   * Side effects:
   *  - Clear feed items list
   *  - Create an interval for the feed
   * @private
   * @param {Feed} feed feed to be added
   */
  addToFeedList(feed) {
    feed.items = [];
    feed.interval = this.createSetInterval(feed);

    this.feedList.push(feed);
  }

  /**
   * Set up a recurring task to check for new items
   * @private
   * @param  {Object} feed Feed to be removed
   * @returns {Interval}      interval for updating the feed
   */
  createSetInterval(feed) {
    const feedManager = new FeedManager(this, feed);
    feedManager.getContent(true);
    return setInterval(feedManager.getContent.bind(feedManager), feed.refresh);
  }

  /**
   * Remove feed from the feed list
   * Side effects:
   * - Destroys the feed first
   * @private
   * @param  {Feed} feed feed to be removed
   */
  removeFromFeedList(feed) {
    if (!feed) return;

    feed.destroy();
    const pos = this.feedList.findIndex((e) => e.url === feed.url);
    this.feedList.splice(pos, 1);
  }
}

module.exports = FeedEmitter;
