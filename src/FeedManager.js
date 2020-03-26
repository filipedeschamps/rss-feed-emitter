'use strict';

/* eslint-disable class-methods-use-this */

// eslint-disable-next-line no-nested-ternary
const sortBy = (key) => (a, b) => ((a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0));

class FeedManager {
  constructor(emitter, feed) {
    this.instance = emitter;
    this.feed = feed;

    this.feed.handler = {
      handle: this.onError.bind(this),
    };
  }

  /**
   * Sort all received items since we want to
   * emit them in ascending order.
   * @param  {Object} data data to sort items on
   */
  sortItemsByDate(data) {
    data.items.sort(sortBy('date'));
  }

  /**
   * Put all new items inside a "newItems" property
   * @param  {Object} data Data to mutate
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
   * Now that we have all the new items, add them to the
   feed item list.
   * @param  {Object} data data to mutate
   * @param {boolean} firstload Whether or not this is the first laod
   */
  populateNewItemsInFeed(data, firstload) {
    data.newItems.forEach((item) => {
      this.feed.addItem(item);
      if (!(firstload && this.instance.skipFirstLoad)) {
        this.instance.emit(this.feed.eventName, item);
      }
    });
  }

  onError(error) {
    this.instance.emit('error', error);
  }

  async getContent(firstload) {
    this.feed.fetchData()
      .then((items) => {
        const data = {
          items,
          url: this.feed.url,
        };
        this.feed.updateHxLength(items);
        this.sortItemsByDate(data);
        this.identifyNewItems(data);
        this.populateNewItemsInFeed(data);
        if (firstload && !this.instance.skipFirstLoad) {
          this.instance.emit(`initial-load:${this.feed.url}`, { url: this.feed.url, items: this.feed.items });
        }
      })
      .catch(this.onError.bind(this));
  }
}

module.exports = FeedManager;
