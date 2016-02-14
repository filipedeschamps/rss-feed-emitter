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

  add( userFeedConfig ) {

    this._validateFeedObject( userFeedConfig );

    let defaultFeedConfig = {
      refresh: 60000
    };

    let finalFeedConfig = _.defaults( userFeedConfig, defaultFeedConfig );

    this._addOrUpdateFeedList( finalFeedConfig );
    return this._feedList;

  }


  remove( url ) {

    if ( typeof url !== 'string' ) {

      throw {
        type: 'type_error',
        message: 'You must call #remove with a string containing the feed url'
      };

    }

    let feed = this._findFeed( {
      url: url
    } );

    return this._removeFromFeedList( feed );

  }


  list() {

    return this._feedList;

  }


  destroy() {

    for ( let i = this._feedList.length - 1; i >= 0; i-- ) {

      let feed = this._feedList[ i ];

      this._removeFromFeedList( feed );

    }

  }


  // PRIVATE METHODS

  _validateFeedObject( feed ) {

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


  _addOrUpdateFeedList( feed ) {

    let feedInList = this._findFeed( feed );

    if ( feedInList ) {

      this._removeFromFeedList( feedInList );

    }

    return this._addToFeedList( feed );

  }


  _findFeed( feed ) {

    return _.find( this._feedList, {
      url: feed.url
    } );

  }


  _findItem( feed, item ) {

    return _.find( feed.items, {
      link: item.link,
      title: item.title
    } );

  }


  _addToFeedList( feed ) {

    feed.items = [];
    feed.setInterval = this._createSetInterval( feed );
    this._feedList.push( feed );

  }


  _removeFromFeedList( feed ) {

    if ( !feed ) {

      return;

    }

    clearInterval( feed.setInterval );
    _.remove( this._feedList, { url: feed.url } );

  }


  _createSetInterval( feed ) {

    let instance = this;

    function getContent() {

      instance._fetchFeed( feed.url )
        .tap( findFeed )
        .tap( redefineItemHistoryMaxLength )
        .tap( sortItemsByDate )
        .tap( identifyOnlyNewItems )
        .tap( populateNewItemsInFeed )
        .catch( ( error ) => {


          if ( error.type === 'feed_not_found' ) {

            return;

          }

          instance.emit( 'error', error );

        } );


      function findFeed( data ) {

        let foundFeed = instance._findFeed( {
          url: data.feedUrl
        } );

        if ( !foundFeed ) {

          throw {
            type: 'feed_not_found',
            message: 'Feed not found.'
          };

        }

        data.feed = foundFeed;

      }


      function redefineItemHistoryMaxLength( data ) {

        let feedLength = data.items.length;

        data.feed.maxHistoryLength = feedLength * instance._historyLengthMultiplier;

      }


      function sortItemsByDate( data ) {

        data.items = _.sortBy( data.items, 'date' );

      }


      function identifyOnlyNewItems( data ) {

        data.newItems = data.items.filter( ( fetchedItem ) => {

          let foundItemInsideFeed = instance._findItem( data.feed, fetchedItem );

          if ( foundItemInsideFeed ) {

            return false;

          }

          return fetchedItem;

        } );

      }


      function populateNewItemsInFeed( data ) {

        data.newItems.forEach( ( item ) => {

          instance._addItemToItemList( data.feed, item );

        } );

      }

    }

    getContent();

    return setInterval( getContent, feed.refresh );

  }


  _addItemToItemList( feed, item ) {

    feed.items.push( item );
    feed.items = _.takeRight( feed.items, feed.maxHistoryLength );

    this.emit( 'new-item', item );

  }


  _fetchFeed( feedUrl ) {

    return new Promise( ( resolve, reject ) => {

      let feedparser = new FeedParser();

      let data = {
        feedUrl: feedUrl,
        items: []
      };

      request.get( {
        url: feedUrl,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36', // eslint-disable-line max-len
          'accept': 'text/html,application/xhtml+xml'
        }
      } )
      .on( 'response', requestOnResponse )
      .on( 'error', requestOnError )
      .pipe( feedparser )
      .on( 'end', finish );

      function requestOnResponse( res ) {

        let statusOk = 200;

        if ( res.statusCode !== statusOk ) {

          let error = {
            type: 'fetch_url_error',
            message: `This URL returned a ${res.statusCode} status code`,
            feed: feedUrl
          };

          reject( error );

        }

      }

      function requestOnError( responseError ) {

        if ( responseError.code === 'ENOTFOUND' ) {

          let error = {
            type: 'fetch_url_error',
            message: `Cannot connect to ${feedUrl}`,
            feed: feedUrl

          };

          reject( error );

        }

      }

      function finish() {

        resolve( data );

      }


      feedparser.on( 'readable', () => {

        let item = feedparser.read();

        // Force the feed URL inside the feed item
        item.meta.link = feedUrl;
        data.items.push( item );

      } );

      feedparser.on( 'error', () => {

        let error = {
          type: 'invalid_feed',
          message: `Cannot parse ${feedUrl} XML`,
          feed: feedUrl

        };

        reject( error );

      } );


    } );

  }

}

export default RssFeedEmitter;
