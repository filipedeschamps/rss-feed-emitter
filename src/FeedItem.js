'use strict';

/**
 * FeedItem for storing feed data
 * @class
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
class FeedItem {}

module.exports = FeedItem;
