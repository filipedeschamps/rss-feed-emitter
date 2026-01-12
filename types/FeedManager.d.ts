export = FeedManager;
/**
 * Management class for feeds
 * @property {FeedEmitter} instance feed emitter instance to handle events
 * @property {Feed} feed feed to store configuration and items
 */
declare class FeedManager {
    /**
     * Manage a feed from a specific emitter
     * Side effect:
     *  - Sets the error handler for the feed.
     * @param {FeedEmitter} emitter emitter that will create events per item
     * @param {Feed} feed    feed to store items and retrieve configuration from
     */
    constructor(emitter: FeedEmitter, feed: Feed);
    /**
     * Instance to manage
     * @type {FeedEmitter}
     */
    instance: FeedEmitter;
    /**
     * Feed to emit items for
     * @type {Feed}
     */
    feed: Feed;
    /**
     * Sort all received items since we want to
     * emit them in ascending order.
     * @private
     * @param  {Object} data data to sort items on
     */
    private sortItemsByDate;
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
    private identifyNewItems;
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
    private populateNewItemsInFeed;
    /**
     * Handle errors during processing
     * @private
     * @param  {FeedError} error handle error
     */
    private onError;
    /**
     * Get content from the managed feed
     * @public
     * @async
     * @param  {boolean}  firstload whether or not this is the first load on the manager
     */
    public getContent(firstload: boolean): Promise<void>;
}
