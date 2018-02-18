'use strict';

import chai from 'chai';
import RssFeedEmitter from '../../src/rss-feed-emitter.js';

let expect = chai.expect;

describe( 'RssFeedEmitter ( integration )', () => {

  /* eslint max-statements: 0 */

  describe( '#on', () => {


    let feeder;

    beforeEach( () => {

      feeder = new RssFeedEmitter();

    } );

    it( 'should emit items from "Nintendo Life"', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'http://www.nintendolife.com/feeds/latest';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );

    it( 'should emit items from "BBC News"', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );


    it( 'should emit items from "Time"', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'http://feeds.feedburner.com/time/topstories?format=xml';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );


    it( 'should emit items from "The Guardian"', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'http://www.theguardian.com/world/rss';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );


    it( 'should emit items from "The Huffington Post"', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'http://www.huffingtonpost.com/feeds/index.xml';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );


    it( 'should emit items from "The New York Times"', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );


    it( 'should emit items from "Reddit"', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'https://www.reddit.com/.rss';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );

    it( 'should emit items from "Milliyet Gazetesi"', ( done ) => {

      // This feed only accept requets with 'text/xml' request reader

      let itemsReceived = [];
      let feedUrl = 'http://www.milliyet.com.tr/rss/rssNew/gundemRss.xml';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );

    it( 'should emit items from "CNN"', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'http://rss.cnn.com/rss/edition.rss';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        // The description is not always a string, it can be null in CNN's feed:
        // expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );


    it( 'should emit items from feed url involving redirects', ( done ) => {

      let itemsReceived = [];
      let feedUrl = 'http://feeds.nczonline.net/blog/';

      feeder.add( {
        url: feedUrl,
        refresh: 60000
      } );

      feeder.on( 'new-item', ( item ) => {

        itemsReceived.push( item );
        expect( item.title ).to.be.a( 'string' );
        expect( item.description ).to.be.a( 'string' );
        expect( item.date ).to.be.a( 'date' );
        expect( item.meta ).to.have.property( 'link', feedUrl );

        if ( itemsReceived.length === 1 ) {

          done();

        }

      } );

    } );


    afterEach( () => {

      feeder.destroy();

    } );

  } );

} );
