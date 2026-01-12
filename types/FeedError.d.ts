export = FeedError;
/**
 * Generic feed error
 * @extends Error
 * @classdesc Wraps feed errors allowing specification of the feed that errored.
 * @property {string} name name of the error
 * @property {string} message Standardized error message
 * @property {string} feed Feed URL producing the error
 */
declare class FeedError extends Error {
    /**
     * Create a Feed error
     * @param {string} message error message
     * @param {string} type    Type of error, provides Error#name
     * @param {string} feed    Feed url that originated the error
     */
    constructor(message: string, type: string, feed: string);
    /**
     * Feed url causing the error
     * @type {string}
     */
    feed: string;
}
