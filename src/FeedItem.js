'use strict';

/**
 * FeedItem for storing feed data
 * Note: This class is not directly instantiated. Feed items are created by feedparser
 * and may contain additional properties beyond those documented here.
 * @class
 * @property {string} [title] Title of the feed item
 * @property {string} [description] Description of the feed item
 * @property {string} [summary] Summary on the feed item
 * @property {Date} [date] Date the item "occurred"
 * @property {Date} [pubdate] Published date of the item
 * @property {string} [link] Link to item relating to the feed
 * @property {string} [origlink] Original link
 * @property {string} [author] Author string
 * @property {string} [guid] Globally unique identifying string
 * @property {string} [comments] Comment string(s)
 * @property {Object} [image] Image, indeterminant format
 * @property {string} [categories] Categories of the feed
 * @property {Object} [enclosures] Enclosures
 * @property {Object} [meta] Metadata
 */
class FeedItem {}

module.exports = FeedItem;
