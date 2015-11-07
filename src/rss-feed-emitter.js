'use strict';

import TinyEmitter from 'tiny-emitter';
import * as _ from 'lodash';

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

	_addToFeedList(feed) {
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
		return setInterval( () => this._getFeedContent(feed), feed.refresh );
	}

	_getFeedContent(feed) {
		console.log(`Every ${feed.refresh} get ${feed.url}`);
	}


}

export default RssFeedEmitter;
