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
		this._historyLengthMultiplier = 3;
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
			throw {
				type: 'type_error',
				message: 'You must call #remove with a string containing the feed url'
			}
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
			throw {
				type: 'type_error',
				message: 'You must call #add method with a feed configuration object.'
			};
		}

		if ( !feed.url || typeof feed.url !== 'string' || feed.url === '' ) {
			throw {
				type: 'type_error',
				message: 'Your configuration object should have an "url" key with a string value'
			};
		}

		if ( feed.refresh && typeof feed.refresh !== 'number' ) {
			throw {
				type: 'type_error',
				message: 'Your configuration object should have a "refresh" key with a number value'
			};
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
		return _.find(feed.items, { link: item.link, title: item.title });
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
				.catch((error) => {


					if (error.type === 'feed_not_found') {
						return;
					}

					this.emit('error', error);

				})

				function findFeedObject(data) {

					let feed = this._findFeed({
						url: data.feedUrl
					});

					if (!feed) {
						throw {
							type: 'feed_not_found',
							message: 'Feed not found.'
						};
					}

					data.feed = feed;

					return data;
					
				}

				function redefineItemHistoryMaxLength(data) {

					let feedLength = data.items.length;

					data.feed.maxHistoryLength = feedLength * this._historyLengthMultiplier;

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
			.on('response', requestOnResponse.bind(this))
			.on('error', requestOnError.bind(this))
			.pipe(feedparser)
			.on('end', () => resolve(data) );

			function requestOnResponse(res) {

				if (res.statusCode !== 200) {
					let error = {
						type: 'fetch_url_error',
						message: `This URL returned a ${res.statusCode} status code`,
						feed: feedUrl
					}

					reject(error);
				}
			}

			function requestOnError(responseError) {

				if (responseError.code === 'ENOTFOUND') {

					let error = {
						type: 'fetch_url_error',
						message: `Cannot connect to ${feedUrl}`,
						feed: feedUrl

					}

					reject(error);

				}
			}

			feedparser.on('readable', () => {
				let item = feedparser.read();

				// Force the feed URL inside the feed item
				item.meta.link = feedUrl;
				data.items.push(item);
			});

			feedparser.on('error', (parserError) => {

				let error = {
					type: 'invalid_feed',
					message: `Cannot parse ${feedUrl} XML`,
					feed: feedUrl

				};

				reject(error);
			});


		})
	}


}

export default RssFeedEmitter;
