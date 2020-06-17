export = FeedError;
declare class FeedError extends Error {
    constructor(message: any, type: any, feed: any);
    feed: any;
}
