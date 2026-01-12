export = Feed;
/**
 * Storage object for properties of a feed
 * @class
 * @property {string} url Feed url
 * @property {FeedItem[]} items items currently retrieved from the feed
 * @property {number} refresh timeout between refreshes
 * @property {string} userAgent User Agent string to fetch the feed with
 * @property {string} eventName event name to use when emitting this feed
 */
declare class Feed {
    /**
     * Create a feed
     * @param {Feed} data object with feed data
     */
    constructor(data: Feed);
    /**
     * Array of item
     * @type {FeedItem[]}
     */
    items: FeedItem[];
    /**
     * Feed url for retrieving feed items
     * @type {string}
     */
    url: string;
    /**
     * Duration between feed refreshes
     * @type {number}
     */
    refresh: number;
    /**
     * If the user has specified a User Agent
     * we will use that as the 'user-agent' header when
     * making requests, otherwise we use the default option.
     * @type {string}
     */
    userAgent: string;
    /**
     * event name for this feed to emit when a new item becomes available
     * @type {String}
     */
    eventName: string;
    /**
     * Maximum history length
     * @type {number}
     */
    maxHistoryLength: number;
    /**
     * Track first load failing so skipFirstLoad can be honored on the first passing load
     * @type {Boolean}
     */
    failedFirstLoad: boolean;
    /**
     * Given a feed and item, try to find
     * it inside the feed item list. We will use
     * this to see if there's already an item inside
     * the feed item list. If there is, we know it's
     * not a new item.
     * @public
     * @param {FeedItem} item item specifics
     * @returns {FeedItem}      the matched element
     */
    public findItem(item: FeedItem): FeedItem;
    /**
     * Update the maximum history length based on the length of a feed retrieval
     * @public
     * @param  {FeedItem[]} newItems new list of items to base the history length on
     */
    public updateHxLength(newItems: FeedItem[]): void;
    /**
     * Add an item to the feed
     * @public
     * @param {FeedItem} item Feed item. Indeterminant structure.
     */
    public addItem(item: FeedItem): void;
    /**
     * Fetch the data for this feed
     * @public
     * @async
     * @returns {Promise} array of new feed items
     */
    public fetchData(): Promise<any>;
    /**
     * Perform the feed parsing
     * @private
     * @param  {FeedParser} feedparser feedparser instance to use for parsing a retrieved feed
     * @param  {Function} resolve Promise resolve function to call on fetch error
     */
    private get;
    /**
     * Handle errors inside the feed retrieval process
     * @param  {Error} error error to be handled
     * @private
     */
    private handleError;
    /**
     * Destroy feed
     * @public
     */
    public destroy(): void;
}
import FeedItem = require("./FeedItem");
