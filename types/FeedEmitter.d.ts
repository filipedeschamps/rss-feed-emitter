/// <reference types="node" />
export = FeedEmitter;
declare const FeedEmitter_base: typeof import("events").EventEmitter;
/**
 * MAIN CLASS
 * This is where we extend from TinyEmitter and absorve
 * the #emit and #on methods to emit 'new-item' events
 * when we have new feed items.
 * @extends EventEmitter
 */
declare class FeedEmitter extends FeedEmitter_base {
    /**
     * Checks that the feed object is valid
     * @param       {Object} feed to validate
     * @param       {string} ua User Agent string to pass to feeds
     */
    static validateFeedObject(feed: any, ua: string): void;
    /**
     * The constructor special method is called everytime
     * we create a new instance of this "Class".
     * @param {Object} [options={ userAgent: defaultUA }] [description]
     */
    constructor(options?: any);
    feedList: any[];
    /**
     * If the user has specified a User Agent
     * we will use that as the 'user-agent' header when
     * making requests, otherwise we use the default option.
     * @type {string}
     */
    userAgent: string;
    /**
     * Whether or not to skip the normal emit event on first load
     * @type {boolean}
     */
    skipFirstLoad: boolean;
    /**
     * UserFeedConfig typedef
     * @typedef {Object} UserFeedConfig
     * @property {(string|string[])} url Url string or string array. Cannot be null or empty
     * @property {Number} refresh Refresh cycle duration for the feed.
     */
    /**
     * ADD
     * The #add method is one of the main ones. Basically it
     * receives one parameter with the feed options, for example:
     * {
     *    url: "http://www.nintendolife.com/feeds/news",
     *    refresh: 2000
     *  }
     * @param {UserFeedConfig[]} userFeedConfig user feed config
     * @returns {Feed[]}
     */
    add(...userFeedConfig: {
        /**
         * Url string or string array. Cannot be null or empty
         */
        url: (string | string[]);
        /**
         * Refresh cycle duration for the feed.
         */
        refresh: number;
    }[]): import("./Feed")[];
    /**
     * REMOVE
     * This is a very simple method and its functionality is
     * remove a feed from the feedList.
     * @param  {string} url   URL to add
     * @returns {Feed}     item removed from list
     */
    remove(url: string): import("./Feed");
    get list(): any[];
    /**
     * DESTROY
     * Remove all feeds from feedList
     */
    destroy(): void;
    addOrUpdateFeedList(feed: any): void;
    findFeed(feed: any): any;
    addToFeedList(feed: any): void;
    /**
     * Set up a recurring task to check for new items
     * @param  {Object} feed Feed to be removed
     * @returns {Interval}      interval for updating the feed
     */
    createSetInterval(feed: any): any;
    removeFromFeedList(feed: any): void;
}
