'use strict';

// TinyEmitter is a really nice Event Emitter. We will extend
// our main class from it.
import TinyEmitter from 'tiny-emitter';

// Lodash is an utility library and makes life easy to work
// and iterate over arrays, objects and manipulate values.
import * as _ from 'lodash';

// Request is one of the most popular modules there is to
// make http requests.
import request from 'request';

// Feedparser is the main choice if you want to parse
// rss feeds in XML.
import FeedParser from 'feedparser';

// Bluebird empowers the default Promise with new
// and amazing methods.
import Promise from 'bluebird';


// MAIN CLASS
// This is where we extend from TinyEmitter and absorve
// the #emit and #on methods to emit 'new-item' events
// when we have new feed items.
class RssFeedEmitter extends TinyEmitter {

  // The constructor special method is called everytime
  // we create a new instance of this "Class".
  constructor( options = {} ) {

    // Since this is a "Class", you have to call #super method
    // for the parent class initialize it's internals.
    super();

    // Also, we are creating a blank array to keep all
    // our feed objects.
    this._feedList = [];

    // If the user has specified a User Agent
    // we will use that as the 'user-agent' header when
    // making requests, otherwise we use the default option.
    this._userAgent = options.userAgent || 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';

    // This module manages automatically how many feed items
    // it will keep in memory, and basically it will have a
    // maximum history which is how many items the feed has
    // multiplied by this number below. So, if the feed have
    // 10 items, we will keep 30 items max in the history.
    this._historyLengthMultiplier = 3;

  }


  // PUBLIC METHODS
  // Now we are creating the public methods, these are the
  // ones developers will use in their softwares.
  // Remember: if you change a method signature in a way
  // it's not backwards compatible, you created a breaking
  // change, so design them very well.


  // ADD
  // The #add method is one of the main ones. Basically it
  // receives one parameter with the feed options, for example:
  // {
  //   url: 'http://www.nintendolife.com/feeds/news',
  //   refresh: 2000
  // }

  add( userFeedConfig ) {

    // We are going to use a private method to validate
    // the feed object. If it's valid, everything is ok,
    // otherwise it will throw an exception.
    this._validateFeedObject( userFeedConfig );

    // The developer doesn't need to specify the "refresh"
    // property, for example, so this object have the default
    // value.
    let defaultFeedConfig = {
      refresh: 60000
    };

    // With the #defaults method of Lodash, we can merge the user defined
    // values with the default value we defined before.
    let finalFeedConfig = _.defaults( userFeedConfig, defaultFeedConfig );

    // This is a cool private method which will add this new feed if
    // it doesn't exist in our feedList or if it does exist,
    // we will update it.
    this._addOrUpdateFeedList( finalFeedConfig );

    // In the end, return the feedList to the developer.
    return this._feedList;

  }


  // REMOVE
  // This is a very simple method and its functionality is
  // remove a feed from the feedList.

  remove( url ) {

    // Check if the "url" parameter is a string,
    // otherwise throw.
    if ( typeof url !== 'string' ) {

      throw {
        type: 'type_error',
        message: 'You must call #remove with a string containing the feed url'
      };

    }

    // Try to find the feed object using the
    // private method #_findFeed
    let feed = this._findFeed( {
      url
    } );

    // And then remove the feed object from
    // the feedList.
    return this._removeFromFeedList( feed );

  }


  // LIST
  // Just return the feedList array.

  list() {

    return this._feedList;

  }


  // DESTROY
  // Remove all feeds from feedList.

  destroy() {

    // There's a gotcha here since we are iterating over an array
    // while removing its properties. To do this, we have to use
    // a little trick where you iterate backwards to not scramble
    // the index while you're removing the properties.
    for ( let i = this._feedList.length - 1; i >= 0; i-- ) {

      let feed = this._feedList[ i ];

      this._removeFromFeedList( feed );

    }

  }


  // PRIVATE METHODS
  // These methods are not suposed to be used by the developer
  // and you can change them without worrying about compatibilities
  // of the public methods.

  // This is used by the public method #add and will receive
  // a feed object and check if all its properties are valid.
  // If the validation you wan't to make is more complex, I
  // recommend you to use a validation library.
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


  // This is also used by the public method #add and will
  // add a new feed to feedList or update it if it's
  // already in the list.
  _addOrUpdateFeedList( feed ) {

    // First, try to find the feed in the feedList.
    let feedInList = this._findFeed( feed );

    // If there's a feed, remove it from the list,
    // since we will add it later again.
    if ( feedInList ) {

      this._removeFromFeedList( feedInList );

    }

    // Now add the feed in the list.
    return this._addToFeedList( feed );

  }


  // Very simple private method: given a feed object
  // try to find it in the feedList using its "url".
  _findFeed( feed ) {

    return _.find( this._feedList, {
      url: feed.url
    } );

  }


  // Given a feed and item, try to find
  // it inside the feed item list. We will use
  // this to see if there's already an item inside
  // the feed item list. If there is, we know it's
  // not a new item.
  _findItem( feed, item ) {

    // default object with 'link' and 'title'
    let object = {
      link: item.link,
      title: item.title
    };

    // if feed is RSS 2.x, check existence of 'guid'
    if ( item.guid ) {

      object = {
        guid: item.guid
      };

    }

    // if feed is Atom 1.x, check existence of 'id'
    if ( item.id ) {

      object = {
        'id': item.id
      };

    }

    return _.find( feed.items, object );

  }


  // This is where we create the feed itself and
  // add it to the feedList
  _addToFeedList( feed ) {

    // First, we add a blank array called "items"
    // to the feed object. This is where we will keep the
    // items history.
    feed.items = [];

    // After this, we will create a setInterval and
    // keep a copy of its reference to be able
    // to clean it later when we remove it.
    // This interval will keep fetching the feed's
    // url for new contents.
    feed.setInterval = this._createSetInterval( feed );

    // In the end, we need to push this object
    // to the feedList array.
    this._feedList.push( feed );

  }


  // This method is a little bit complex
  // but also the most important one. It is
  // responsible to keep fetching the RSS
  // for content and emitting events
  // when new items are found.
  _createSetInterval( feed ) {

    // First, lets keep the "this" reference.
    let instance = this;

    // The getContent function will:
    //
    // 1. call the _fetchFeed to get the content
    //    from the RSS feed.
    //
    // 2. Locate the feed object inside the feedList.
    //
    // 3. Redefine the feed history length (using
    //    the _historyLengthMultiplier variable.
    //
    // 4. Sort the received items by date so we always
    //    work with the items in ascending order
    //
    // 5. Given the items received from the last fetch
    //    and the current items in the feed item list,
    //    select only the new ones.
    //
    // 6. Now take the new ones, push them to the
    //    feed item list and emit while emitting events.
    function getContent() {

      instance._fetchFeed( feed.url )
        .tap( findFeed )
        .tap( redefineItemHistoryMaxLength )
        .tap( sortItemsByDate )
        .tap( identifyOnlyNewItems )
        .tap( populateNewItemsInFeed )
        .catch( ( error ) => {

          // If this chain is iterating over a recently
          // deleted feed, it will not be found in the
          // feedList. If this happens, just ignore
          // silently.
          if ( error.type === 'feed_not_found' ) {

            return;

          }

          // Otherwise, emit an "error" event
          instance.emit( 'error', error );

        } );


      // 2. This happens after we got the results from
      // the private method _fetchFeed. Basically we
      // are going to receive a "data" object with
      // the feed URL and the feed content.
      function findFeed( data ) {

        // Try to find the feed object inside this instance
        // using the feed url from the fetch.
        let foundFeed = instance._findFeed( {
          url: data.feedUrl
        } );

        // If nothing is found, probably we destroyed
        // it in the middle of a fetch. Let's throw an
        // error to get out of this Promise chain, since
        // we can't keep going further.
        if ( !foundFeed ) {

          throw {
            type: 'feed_not_found',
            message: 'Feed not found.'
          };

        }

        // If we found the feed, everything is ok and
        // lets add it to the "data" object.
        data.feed = foundFeed;

      }


      // Since we are managing the max history length,
      // this is a good time to get the items length
      // from the fetched feed, multiply it by the
      // _historyLengthMultiplier and update the
      // feed maxHistoryLength value. This is cool
      // because if the source feed starts to increase
      // or decrese its items quantity, we will ajust
      // automatically how many items we keep in memory.
      function redefineItemHistoryMaxLength( data ) {

        let feedLength = data.items.length;

        data.feed.maxHistoryLength = feedLength * instance._historyLengthMultiplier;

      }


      // Sort all received items since we want to
      // emit them in ascending order.
      function sortItemsByDate( data ) {

        data.items = _.sortBy( data.items, 'date' );

      }


      // Put all new items inside a "newItems" property
      function identifyOnlyNewItems( data ) {

        // We can do this using the "filter" method of the array.
        // The logic behind this is, if you return a "false" value,
        // that item will be skipped, but if you return a "true"
        // value, it will be added to the final array.
        data.newItems = data.items.filter( ( fetchedItem ) => {

          // So, try to find the suposed new item inside the current feed item list.
          let foundItemInsideFeed = instance._findItem( data.feed, fetchedItem );

          // If you found it, that item is not new, so skip it
          // returning a false value.
          if ( foundItemInsideFeed ) {

            return false;

          }

          // But if we couldn't find it, this means it is a new item and we need
          // to add it to the newItems array. To do this, just return a truthy value.
          return fetchedItem;

        } );

      }


      // Now that we have all the new items, add them to the
      // feed item list.
      function populateNewItemsInFeed( data ) {

        data.newItems.forEach( ( item ) => {

          instance._addItemToItemList( data.feed, item );

        } );

      }

    }

    // Call the getContent function to already start getting
    // content, otherwise you will have to wait for a
    // setInterval cicle.
    getContent();

    // Create and return the setInterval itself.
    return setInterval( getContent, feed.refresh );

  }

  // This is the inverse of the _addToFeedList method
  // and we will destroy the setInterval and remove
  // the feed from the feedList.
  _removeFromFeedList( feed ) {

    if ( !feed ) {

      return;

    }

    clearInterval( feed.setInterval );
    _.remove( this._feedList, { url: feed.url } );

  }


  // Add a feed item to its item list.
  _addItemToItemList( feed, item ) {

    // Push them to the items array.
    feed.items.push( item );

    // Keep the max history length in control.
    feed.items = _.takeRight( feed.items, feed.maxHistoryLength );

    // And emit the "new-item" event of this item.
    this.emit( 'new-item', item );

  }


  // This is where the http request happens.
  _fetchFeed( feedUrl ) {

    // Remember the above Promise chain? Everything starts here.
    return new Promise( ( resolve, reject ) => {

      // Create a FeedParser instance.
      let feedparser = new FeedParser();

      // Create that "data" object we used over and over inside
      // the getContent Promise chain. It starts with a feed url
      // property and a blank item array.
      let data = {
        feedUrl,
        items: []
      };

      // Now let's request that feed URL sending a very nice header
      // because some servers doesn't like requests without it.
      request.get( {
        url: feedUrl,
        headers: {
          'user-agent': this._userAgent,
          'accept': 'text/html,application/xhtml+xml,application/xml,text/xml'
        }
      } )
      // Run this once we get a response from the server.
      .on( 'response', requestOnResponse )
      // If the request is rejected, call this function.
      .on( 'error', requestOnError )
      // If everything is ok, let's parse the feed.
      .pipe( feedparser )
      // and in the end, let's call the finish function.
      .on( 'end', finish );

      // Basically what we do here is, if we doesn't get a "200" status
      // code from the request, reject the promise because probably we
      // received something like a "404" or "500" error.
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

      // This will happen when Node.js itself couldn't connet
      // to the host to get something from it.
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


      // Everytime the Feedparser emits a "readable" event
      // we have a new feed item, so we need to add it to the
      // data.item list.
      feedparser.on( 'readable', () => {

        // Read the item itself.
        let item = feedparser.read();

        // Force the feed URL inside the feed item because
        // some times the RSS doesn't have the feed url inside
        // every item.
        item.meta.link = feedUrl;

        // Add to the data.items.
        data.items.push( item );

      } );

      // Feedparser will also emit an "error" event
      // if it's not able to parse the XML. If this
      // happens, we need to interrupt the Promise chain
      // since we can't keep going further.
      feedparser.on( 'error', () => {

        let error = {
          type: 'invalid_feed',
          message: `Cannot parse ${feedUrl} XML`,
          feed: feedUrl

        };

        reject( error );

      } );


      // Once finished, let's resolve the Promise
      // with the "data" object.
      function finish() {

        resolve( data );

      }

    } );

  }

}

// In the end, just export the RssFeedEmitter class.
export default RssFeedEmitter;
