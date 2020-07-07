export = FeedItem;
/**
 * @typedef {Object} FeedItem
 * @property {string} title Title of the feed item
 * @property {string} description description of the feed item
 * @property {string} summary summary on the feed item
 * @property {Date|null} date date the item "occurred"
 * @property {Date|null} pubdate Published date of the item
 * @property {string} link link to item relating to the feed
 * @property {string} origlink original link
 * @property {string} author author string
 * @property {string} guid globally unique identifying string
 * @property {string} comments comment string(s)
 * @property {Object} image Image, indeterminant format
 * @property {string} categories categories of the feed
 * @property {Object} enclosures
 * @property {Object} meta
 * @property {any} [x] String-keyed object. Various more are allowed than are representable
 */
declare class FeedItem {
}
declare namespace FeedItem {
    export { FeedItem };
}
type FeedItem = {
    /**
     * Title of the feed item
     */
    title: string;
    /**
     * description of the feed item
     */
    description: string;
    /**
     * summary on the feed item
     */
    summary: string;
    /**
     * date the item "occurred"
     */
    date: Date | null;
    /**
     * Published date of the item
     */
    pubdate: Date | null;
    /**
     * link to item relating to the feed
     */
    link: string;
    /**
     * original link
     */
    origlink: string;
    /**
     * author string
     */
    author: string;
    /**
     * globally unique identifying string
     */
    guid: string;
    /**
     * comment string(s)
     */
    comments: string;
    /**
     * Image, indeterminant format
     */
    image: any;
    /**
     * categories of the feed
     */
    categories: string;
    enclosures: any;
    meta: any;
    /**
     * String-keyed object. Various more are allowed than are representable
     */
    x?: any;
};
