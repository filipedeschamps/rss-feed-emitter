export = FeedError;
declare class FeedError extends Error {
    constructor(message: any, type: any, feed: any);
    name: any;
    feed: any;
}
