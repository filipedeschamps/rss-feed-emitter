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

		return _.find(feed.items, { url: item.url });
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
			this._fetchFeed(feed)
				.bind(this)
				.then(this._mapItemsData)
				.then(this._sortItemsByDate)
				.then(this._identifyOnlyNewItems)
				.then(this._populateItemsInFeed)
				.catch((error) => {
					console.log('Error in getContent() chain inside _createSetInterval()');
					console.log(error.stack)
				})
		}

		getContent();

		return setInterval( getContent, feed.refresh );
	}

	_sortItemsByDate(items) {
		return _.sortBy(items, 'date');
	}

	_populateItemsInFeed(items) {

		items.forEach((item) => {
			this._addItemToItemList(item);
		});

	}

	_addItemToItemList(item) {
		let feed = this._findFeed({
			url: item.feed.url
		});

		if (!feed) {
			return;
		}

		feed.items.push(item);
		this.emit('new-item', item);

	}

	_identifyOnlyNewItems(items) {
		return items.filter((item) => {
			let feed = this._findFeed({
				url: item.feed.url
			});

			let itemFound = this._findItem(feed, item);

			return !itemFound;

		});
	}

	_mapItemsData(items) {
		return items.map((oldItem) => {
			let newItem = {
				title: oldItem.title,
				description: oldItem.description,
				summary: oldItem.summary,
				date: oldItem.pubdate,
				url: oldItem.link,
				author: oldItem.author,
				image: oldItem.image,
				feed: {
					url: oldItem.meta.xmlurl,
					title: oldItem.meta.title
				}
			}

			return newItem;
		})
	}


	_fetchFeed(feed) {

		return new Promise( (resolve, reject) => {
		
			let feedparser = new FeedParser();
			let items = [];

			request.get({
				url: feed.url,
				headers: {
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
					'accept': 'text/html,application/xhtml+xml'
				}
			})
			.pipe(feedparser)
			.on('end', () => resolve(items) );

			feedparser.on('readable', () => {
				let item;

				while(item = feedparser.read()) {
					items.push(item);
				}

				return items;
			});

			feedparser.on('error', (error) => {
				reject(error);
			});


		})
	}


}

export default RssFeedEmitter;
