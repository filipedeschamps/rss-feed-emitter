export = FeedManager;
declare class FeedManager {
    constructor(emitter: any, feed: any);
    instance: any;
    feed: any;
    /**
     * Sort all received items since we want to
     * emit them in ascending order.
     * @param  {Object} data data to sort items on
     */
    sortItemsByDate(data: any): void;
    /**
     * Put all new items inside a "newItems" property
     * @param  {Object} data Data to mutate
     */
    identifyNewItems(data: any): void;
    /**
     * Now that we have all the new items, add them to the
     feed item list.
     * @param  {Object} data data to mutate
     * @param {boolean} firstload Whether or not this is the first laod
     */
    populateNewItemsInFeed(data: any, firstload: boolean): void;
    onError(error: any): void;
    getContent(firstload: any): Promise<void>;
}
