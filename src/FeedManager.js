'use strict';

/* eslint-disable class-methods-use-this */

// eslint-disable-next-line no-nested-ternary
const sortBy = (key) => (a, b) => ((a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0));

/**
 * Management class for feeds
 * @property {FeedEmitter} instance feed emitter instance to handle events
 * @property {Feed} feed feed to store configuration and items
 */
class FeedManager {
  /**
   * Manage a feed from a specific emitter
   * Side effect:
   *  - Sets the error handler for the feed.
   * @param {FeedEmitter} emitter emitter that will create events per item
   * @param {Feed} feed    feed to store items and retrieve configuration from
   */
  constructor(emitter, feed) {
    /**
     * Instance to manage
     * @type {FeedEmitter}
     */
    this.instance = emitter;
    /**
     * Feed to emit items for
     * @type {Feed}
     */
    this.feed = feed;

    this.feed.handler = {
      handle: this.onError.bind(this),
    };
  }

  /**
   * Sort all received items since we want to
   * emit them in ascending order.
   * @private
   * @param  {Object} data data to sort items on
   */
  sortItemsByDate(data) {
    data.items.sort(sortBy('date'));
  }


  /**
   * Truncated feed data fetched from web
   * @typedef {Object} FeedTrunc
   * @property {FeedItem[]} items new feed items to be added
   * @property {string} url feed url that is fetched
   */

  /**
   * Put all new items inside a "newItems" property
   * @private
   * @param  {FeedTrunc} data Data to mutate
   */
  identifyNewItems(data) {
    data.newItems = data.items.filter((fetchedItem) => {
      const foundItemInsideFeed = this.feed.findItem(fetchedItem);
      if (foundItemInsideFeed) {
        return false;
      }
      return fetchedItem;
    });
  }

  /**
   * New data to add to f a feed
   * @typedef {Object} FeedData
   * @property {Feed[]} newItems
   */

  /**
   * Now that we have all the new items, add them to the
   feed item list.
   * @private
   * @param  {FeedData} data data to mutate
   * @param {boolean} firstload Whether or not this is the first laod
   */
  populateNewItemsInFeed(data, firstload) {
    data.newItems.forEach((item) => {
      this.feed.addItem(item);
      if ((firstload && !this.instance.skipFirstLoad) || !firstload) {
        this.instance.emit(this.feed.eventName, item);
      }
    });
  }

  /**
   * Handle errors during processing
   * @private
   * @param  {FeedError} error handle error
   */
  onError(error) {
    console.error(error.stack);
    this.instance.emit('error', error);
  }

  /**
   * Get content from the managed feed
   * @public
   * @async
   * @param  {boolean}  firstload whether or not this is the first load on the manager
   */
  async getContent(firstload) {
    const items = await this.feed.fetchData();
    const data = {
      items,
      url: this.feed.url,
    };
    this.feed.updateHxLength(items);
    this.sortItemsByDate(data);
    this.identifyNewItems(data);

    const innerFirst = firstload || (!firstload && this.feed.failedFirstLoad);

    this.populateNewItemsInFeed(data, innerFirst);
    if (firstload && !this.instance.skipFirstLoad) {
      this.instance.emit(`initial-load:${this.feed.url}`, { url: this.feed.url, items: this.feed.items });
      this.feed.failedFirstLoad = false;
    }
  }
}

module.exports = FeedManager;
