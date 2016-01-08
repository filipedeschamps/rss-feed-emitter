'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tinyEmitter = require('tiny-emitter');

var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _feedparser = require('feedparser');

var _feedparser2 = _interopRequireDefault(_feedparser);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RssFeedEmitter = function (_TinyEmitter) {
	_inherits(RssFeedEmitter, _TinyEmitter);

	function RssFeedEmitter() {
		_classCallCheck(this, RssFeedEmitter);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RssFeedEmitter).call(this));

		_this._feedList = [];
		_this._historyLengthMultiplier = 3;
		return _this;
	}

	// PUBLIC METHODS

	_createClass(RssFeedEmitter, [{
		key: 'add',
		value: function add(feed) {
			this._validateFeedObject(feed);

			var defaults = {
				refresh: 60000
			};

			feed = _.defaults(feed, defaults);

			this._addOrUpdateFeedList(feed);
			return this._feedList;
		}
	}, {
		key: 'remove',
		value: function remove(url) {

			if (typeof url !== 'string') {
				throw {
					type: 'type_error',
					message: 'You must call #remove with a string containing the feed url'
				};
			}

			var feed = this._findFeed({
				url: url
			});

			return this._removeFromFeedList(feed);
		}
	}, {
		key: 'list',
		value: function list() {
			return this._feedList;
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			for (var i = this._feedList.length - 1; i >= 0; i--) {
				var feed = this._feedList[i];
				this._removeFromFeedList(feed);
			}
		}

		// PRIVATE METHODS

	}, {
		key: '_validateFeedObject',
		value: function _validateFeedObject(feed) {
			if (!feed) {
				throw {
					type: 'type_error',
					message: 'You must call #add method with a feed configuration object.'
				};
			}

			if (!feed.url || typeof feed.url !== 'string' || feed.url === '') {
				throw {
					type: 'type_error',
					message: 'Your configuration object should have an "url" key with a string value'
				};
			}

			if (feed.refresh && typeof feed.refresh !== 'number') {
				throw {
					type: 'type_error',
					message: 'Your configuration object should have a "refresh" key with a number value'
				};
			}
		}
	}, {
		key: '_addOrUpdateFeedList',
		value: function _addOrUpdateFeedList(feed) {

			var feedInList = this._findFeed(feed);

			if (feedInList) {
				this._removeFromFeedList(feedInList);
			}

			return this._addToFeedList(feed);
		}
	}, {
		key: '_findFeed',
		value: function _findFeed(feed) {
			return _.find(this._feedList, { url: feed.url });
		}
	}, {
		key: '_findItem',
		value: function _findItem(feed, item) {
			if (!feed || !item) {
				return;
			}

			return _.find(feed.items, { link: item.link, title: item.title });
		}
	}, {
		key: '_addToFeedList',
		value: function _addToFeedList(feed) {

			if (!feed.items) {
				feed.items = [];
			}

			feed.setInterval = this._createSetInterval(feed);
			this._feedList.push(feed);

			return this._feedList;
		}
	}, {
		key: '_removeFromFeedList',
		value: function _removeFromFeedList(feed) {

			if (!feed || !feed.setInterval) {
				return;
			}

			clearInterval(feed.setInterval);
			_.remove(this._feedList, { url: feed.url });
		}
	}, {
		key: '_createSetInterval',
		value: function _createSetInterval(feed) {
			var _this2 = this;

			var getContent = function getContent() {
				_this2._fetchFeed(feed.url).bind(_this2).tap(findFeedObject).tap(redefineItemHistoryMaxLength).tap(sortItemsByDate).tap(identifyOnlyNewItems).tap(populateNewItemsInFeed).catch(function (error) {

					if (error.type === 'feed_not_found') {
						return;
					}

					_this2.emit('error', error);
				});

				function findFeedObject(data) {

					var feed = this._findFeed({
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

					var feedLength = data.items.length;

					data.feed.maxHistoryLength = feedLength * this._historyLengthMultiplier;
				}

				function sortItemsByDate(data) {

					data.items = _.sortBy(data.items, 'date');
				}

				function identifyOnlyNewItems(data) {
					var _this3 = this;

					data.newItems = data.items.filter(function (fetchedItem) {

						var foundItemInsideFeed = _this3._findItem(data.feed, fetchedItem);

						if (foundItemInsideFeed) {
							return false;
						} else {
							return fetchedItem;
						}
					});
				}

				function populateNewItemsInFeed(data) {
					var _this4 = this;

					data.newItems.forEach(function (item) {
						_this4._addItemToItemList(data.feed, item);
					});
				}
			};

			getContent();

			return setInterval(getContent, feed.refresh);
		}
	}, {
		key: '_addItemToItemList',
		value: function _addItemToItemList(feed, item) {

			feed.items.push(item);
			feed.items = _.takeRight(feed.items, feed.maxHistoryLength);

			this.emit('new-item', item);
		}
	}, {
		key: '_fetchFeed',
		value: function _fetchFeed(feedUrl) {
			var _this5 = this;

			return new _bluebird2.default(function (resolve, reject) {

				var feedparser = new _feedparser2.default();

				var data = {
					feedUrl: feedUrl,
					items: []
				};

				_request2.default.get({
					url: feedUrl,
					headers: {
						'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
						'accept': 'text/html,application/xhtml+xml'
					}
				}).on('response', requestOnResponse.bind(_this5)).on('error', requestOnError.bind(_this5)).pipe(feedparser).on('end', function () {
					return resolve(data);
				});

				function requestOnResponse(res) {

					if (res.statusCode !== 200) {
						var error = {
							type: 'fetch_url_error',
							message: 'This URL returned a ' + res.statusCode + ' status code',
							feed: feedUrl
						};

						reject(error);
					}
				}

				function requestOnError(responseError) {

					if (responseError.code === 'ENOTFOUND') {

						var error = {
							type: 'fetch_url_error',
							message: 'Cannot connect to ' + feedUrl,
							feed: feedUrl

						};

						reject(error);
					}
				}

				feedparser.on('readable', function () {
					var item = undefined;

					while (item = feedparser.read()) {

						// Force the feed URL inside the feed item
						item.meta.link = feedUrl;
						data.items.push(item);
					}

					return data;
				});

				feedparser.on('error', function (parserError) {

					var error = {
						type: 'invalid_feed',
						message: 'Cannot parse ' + feedUrl + ' XML',
						feed: feedUrl

					};

					reject(error);
				});
			});
		}
	}]);

	return RssFeedEmitter;
}(_tinyEmitter2.default);

exports.default = RssFeedEmitter;
module.exports = exports['default'];