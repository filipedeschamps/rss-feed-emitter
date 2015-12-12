'use strict';

import TinyEmitter from 'tiny-emitter';
import * as _ from 'lodash';
import request from 'request';
import FeedParser from 'feedparser';
import Promise from 'bluebird';

class RssFeedEmitter extends TinyEmitter {

	constructor() {
		super();
		this._feedList = [];
	}


	// PUBLIC METHODS

	add(feed) {
		this._validateFeedObject(feed);

		let defaults = {
			refresh: 60000
		}

		feed = _.defaults(feed, defaults);

		this._addOrUpdateFeedList(feed);
		return this._feedList;
	}

	remove(url) {

		if ( typeof url !== 'string' ) {
			throw new Error('You must call #remove with a string containing the feed url');
		}

		let feed = this._findFeed({
			url: url
		});

		return this._removeFromFeedList(feed);

	}

	list() {
		return this._feedList;
	}

	destroy() {
		for (let i = this._feedList.length -1; i >=0; i--) {
			let feed = this._feedList[i];
			this._removeFromFeedList(feed);
		}
	}


	// PRIVATE METHODS

	_validateFeedObject(feed) {
		if ( !feed ) {
			throw new Error('You must call #add method with a feed configuration object.');
		}

		if ( !feed.url || typeof feed.url !== 'string' || feed.url === '' ) {
			throw new Error('Your configuration object should have an "url" key with a string value');
		}

		if ( feed.refresh && typeof feed.refresh !== 'number' ) {
			throw new Error('Your configuration object should have a "refresh" key with a number value');
		}
	}

	_addOrUpdateFeedList(feed) {

		let feedInList = this._findFeed(feed);

		if ( feedInList ) {
			this._removeFromFeedList(feedInList);
		}

		return this._addToFeedList(feed);
	
	}

	_findFeed(feed) {
		return _.find(this._feedList, { url: feed.url });
	}

	_findItem(feed, item) {
		if (!feed) {
			return;
		}

		return _.find(feed.items, { link: item.link });
	}

	_addToFeedList(feed) {

		if (!feed.items) {
			feed.items = [];
		}

		feed.setInterval = this._createSetInterval(feed);
		this._feedList.push(feed);

		return this._feedList;
	}

	_removeFromFeedList(feed) {

		if ( !feed || !feed.setInterval ) {
			return;
		}

		clearInterval(feed.setInterval);
		_.remove(this._feedList, { url: feed.url } );

	}

	_createSetInterval(feed) {

		let getContent = () => {
			this._fetchFeed(feed.url)
				.bind(this)
				.tap(findFeedObject)
				.tap(redefineItemHistoryMaxLength)
				.tap(sortItemsByDate)
				.tap(identifyOnlyNewItems)
				.tap(populateNewItemsInFeed)
				.catch( (error) => {

					if (error.message === 'Feed not found') {
						return;
					}

					console.log('Error inside _createSetInterval() -> this._fetchFeed() chain');
					console.log(error.stack)

				})

				function findFeedObject(data) {

					let feed = this._findFeed({
						url: data.feedUrl
					});

					if (!feed) {
						throw new Error('Feed not found');
					}

					data.feed = feed;

					return data;
					
				}

				function redefineItemHistoryMaxLength(data) {

					let feedLength = data.items.length;

					data.feed.maxHistoryLength = feedLength * 3;

				}

				function sortItemsByDate(data) {

					data.items = _.sortBy(data.items, 'date');

				}

				function identifyOnlyNewItems(data) {

					data.newItems = data.items.filter((fetchedItem) => {

						let foundItemInsideFeed = this._findItem(data.feed, fetchedItem);

						if (foundItemInsideFeed) {
							return false;
						} else {
							return fetchedItem;
						}

					});

				}

				function populateNewItemsInFeed(data) {

					data.newItems.forEach((item) => {
						this._addItemToItemList(data.feed, item);
					});

				}


		}

		getContent();

		return setInterval( getContent, feed.refresh );
	}


	_addItemToItemList(feed, item) {

		feed.items.push(item);
		feed.items = _.takeRight(feed.items, feed.maxHistoryLength);

		this.emit('new-item', item);

	}


	_fetchFeed(feedUrl) {

		return new Promise( (resolve, reject) => {

			let feedparser = new FeedParser();

			let data = {
				feedUrl: feedUrl,
				items: []
			}

			request.get({
				url: feedUrl,
				headers: {
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
					'accept': 'text/html,application/xhtml+xml'
				}
			})
			.pipe(feedparser)
			.on('end', () => resolve(data) );

			feedparser.on('readable', () => {
				let item;

				while(item = feedparser.read()) {

					// Force the feed URL inside the feed item
					item.meta.link = feedUrl;
					data.items.push(item);

				}

				return data;
			});

			feedparser.on('error', (error) => {
				reject(error);
			});


		})
	}


}

export default RssFeedEmitter;
