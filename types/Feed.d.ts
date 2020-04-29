export = Feed;
declare class Feed {
    constructor(data: any);
    items: any;
    refresh: number;
    userAgent: string;
    eventName: string;
    /**
     * Given a feed and item, try to find
     * it inside the feed item list. We will use
     * this to see if there's already an item inside
     * the feed item list. If there is, we know it's
     * not a new item.
     * @param       {Object} item item specitics
     * @returns      {Object}      the matched element
     */
    findItem(item: any): any;
    updateHxLength(newItems: any): void;
    maxHistoryLength: number;
    addItem(item: any): void;
    fetchData(): any;
    get(feedparser: any): void;
    handleError(error: any): void;
    destroy(): void;
}
