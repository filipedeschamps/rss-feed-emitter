export = Feed;
/**
 * Storage object for properties of a feed
 * @typedef {Object} Feed
 * @property {string} url Feed url
 * @property {FeedItem[]} items items currently retrieved from the feed
 * @property {number} refresh timeout between refreshes
 * @property {string} userAgent User Agent string to fetch the feed with
 * @property {string} eventName event name to use when emitting this feed
 */
declare class Feed {
    constructor(data: any);
    items: any;
    refresh: number;
    userAgent: string;
    /**
     * event name for this feed to emit when a new item becomes available
     * @type {String}
     */
    eventName: String;
    /**
     * Given a feed and item, try to find
     * it inside the feed item list. We will use
     * this to see if there's already an item inside
     * the feed item list. If there is, we know it's
     * not a new item.
     * @param {FeedItem} item item specitics
     * @returns {FeedItem}      the matched element
     */
    findItem(item: import("./FeedItem")): import("./FeedItem");
    /**
     * Update the maximum history length based on the length of a feed retrieval
     * @param  {FeedItem[]} newItems new list of items to base the history length on
     * @mutator
     */
    updateHxLength(newItems: import("./FeedItem")[]): void;
    maxHistoryLength: number;
    /**
     * Add an item to the feed
     * @param {FeedItem} item Feed item. Indeterminant structure.
     */
    addItem(item: import("./FeedItem")): void;
    /**
     * Fetch the data for this feed
     * @returns {Promise} array of new feed items
     */
    fetchData(): Promise<any>;
    /**
     * Perform the feed parsing
     * @param  {FeedParser} feedparser feedparser instance to use for parsing a retrieved feed
     */
    get(feedparser: import("feedparser")): void;
    /**
     * Private: handle errors inside the feed retrieval process
     * @param  {Error} error error to be handled
     */
    handleError(error: Error): void;
    /**
     * Destroy feed
     */
    destroy(): void;
}
declare namespace Feed {
    export { Feed };
}
/**
 * Storage object for properties of a feed
 */
type Feed = {
    /**
     * Feed url
     */
    url: string;
    /**
     * items currently retrieved from the feed
     */
    items: import("./FeedItem")[];
    /**
     * timeout between refreshes
     */
    refresh: number;
    /**
     * User Agent string to fetch the feed with
     */
    userAgent: string;
    /**
     * event name to use when emitting this feed
     */
    eventName: string;
};
