'use strict';

const chai = require('chai');
const nock = require('nock');
const path = require('path');
const RssFeedEmitter = require('../../src/FeedEmitter');
const RssFeedError = require('../../src/FeedError');
const Feed = require('../../src/Feed');

process.env.NOCK_OFF = false;

const { expect } = chai;

let feeder;
const defaultUserAgent = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

describe('RssFeedEmitter (unit)', () => {
  beforeEach(() => {
    feeder = new RssFeedEmitter();
  });

  afterEach(() => {
    if (feeder) {
      feeder.destroy();
      feeder = undefined;
    }
    nock.cleanAll();
  });

  describe('when instantiated', () => {
    it('should return an Object', () => {
      expect(feeder).to.be.an('object');
    });
  });

  describe('when instantiated without userAgent option', () => {
    it('uses default "userAgent" value as "user-agent" header when making requests', (done) => {
      nock('https://www.nintendolife.com/', {
        reqheaders: {
          'user-agent': (receivedUserAgent) => {
            expect(receivedUserAgent).to.eql(defaultUserAgent);
            return defaultUserAgent === receivedUserAgent;
          },
        },
      })
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      const itemsReceived = [];

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 20000,
      });

      feeder.on('new-item', (item) => {
        const totalLength = 20;
        itemsReceived.push(item);

        if (itemsReceived.length === totalLength) {
          done();
        }
      });
    });
  });

  describe('when instantiated with userAgent option', () => {
    const definedUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36';

    beforeEach(() => {
      feeder = new RssFeedEmitter({ userAgent: definedUserAgent });
    });

    it('uses any given "userAgent" option as "user-agent" header when making requests', (done) => {
      nock('https://www.nintendolife.com/', {
        reqheaders: {
          'user-agent': (receivedUserAgent) => {
            expect(receivedUserAgent).to.eql(definedUserAgent);
            return definedUserAgent === receivedUserAgent;
          },
        },
      })
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      const itemsReceived = [];

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 20000,
      });

      feeder.on('new-item', (item) => {
        const totalLength = 20;

        itemsReceived.push(item);

        if (itemsReceived.length === totalLength) {
          done();
        }
      });
    });
  });

  describe('#add', () => {
    it('should be a Function', () => {
      expect(feeder.add).to.be.a('function');
    });

    it('should throw when called without configuration object', () => {
      expect(() => feeder.add()).to.throw(RssFeedError, 'You must call #add method with a feed configuration object.');
    });

    it('should throw when configuration object does not contains "url"', () => {
      expect(() => {
        feeder.add({
          refresh: 60000,
        });
      }).to.throw(RssFeedError, 'Your configuration object should have an "url" key with a string or array value');
    });

    it('should throw when configuration object contains "url", but its not a String or Array', () => {
      expect(() => {
        feeder.add({
          url: { thing: 'thing' },
        });
      }).to.throw(RssFeedError, 'Your configuration object should have an "url" key with a string or array value');
    });

    it('should throw when configuration object contains "refresh", but its not a Number', () => {
      expect(() => {
        feeder.add({
          url: 'https://www.nintendolife.com/feeds/latest',
          refresh: 'quickly',
        });
      }).to.throw(RssFeedError, 'Your configuration object should have a "refresh" key with a number value');
    });

    it('should correctly add feeds when configuration object contains only "url"', () => {
      const defaultRefesh = 60000;

      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'))
        .get('/feeds/news')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-news-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
      });

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/news',
      });

      expect(feeder.list).to.have.property('length', 2);
      expect(feeder.list[0]).to.have.property('refresh', defaultRefesh);
      expect(feeder.list[1]).to.have.property('refresh', defaultRefesh);
    });

    it('should correctly add feeds when configuration object contains only "url" array', () => {
      const defaultRefesh = 60000;

      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'))
        .get('/feeds/news')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-news-first-fetch.xml'));

      feeder.add({
        url: ['https://www.nintendolife.com/feeds/latest', 'https://www.nintendolife.com/feeds/news'],
      });

      expect(feeder.list).to.have.property('length', 2);
      expect(feeder.list[0]).to.have.property('refresh', defaultRefesh);
      expect(feeder.list[1]).to.have.property('refresh', defaultRefesh);
    });

    it('should replace default refresh rate if configuration object contains "refresh"', () => {
      const notDefaultRefresh = 120000;

      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: notDefaultRefresh,
      });

      expect(feeder.list[0]).to.have.property('refresh', notDefaultRefresh);
    });

    it('should update feed when "url" already exists in feed list', () => {
      const notDefaultRefresh1 = 120000;

      const notDefaultRefresh2 = 240000;

      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .twice()
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: notDefaultRefresh1,
      });

      expect(feeder.list).to.have.property('length', 1);
      expect(feeder.list[0]).to.have.property('refresh', notDefaultRefresh1);

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: notDefaultRefresh2,
      });

      expect(feeder.list).to.have.property('length', 1);
      expect(feeder.list[0]).to.have.property('refresh', notDefaultRefresh2);
    });

    it('should always keep feed max history the number of feed items times 3', (done) => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'))
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-second-fetch.xml'))
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-third-fetch.xml'))
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-fourth-fetch.xml'));

      const itemsReceived = [];

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 20,
      });

      const maxItemsReceived = 69;
      const maxItemsLength = 61;
      const feed = feeder.list.find((e) => e.url === 'https://www.nintendolife.com/feeds/latest');

      feeder.on('new-item', (item) => {
        itemsReceived.push(item);
        expect(feed.items.length).to.be.below(maxItemsLength);
        if (itemsReceived.length === maxItemsReceived) {
          done();
        }
      });
    }).timeout(3000);

    it('should apply default "userAgent" if none is provided in add or construction', () => {
      const subFeeder = new RssFeedEmitter();
      const list = subFeeder.add({
        url: 'test',
        userAgent: undefined,
      });
      expect(list.length).to.eq(1);
      expect(list[0].userAgent).to.eq('Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)');
    });

    it('should respect constructed "userAgent" if none is provided in add', () => {
      const subFeeder = new RssFeedEmitter({ userAgent: 'testABC' });
      const list = subFeeder.add({
        url: 'test',
        userAgent: undefined,
      });
      expect(list.length).to.eq(1);
      expect(list[0].userAgent).to.eq('testABC');
    });

    it('should respect provided "userAgent"', () => {
      const subFeeder = new RssFeedEmitter({ userAgent: 'testABC' });
      const list = subFeeder.add({
        url: 'test',
        userAgent: 'test123',
      });
      expect(list.length).to.eq(1);
      expect(list[0].userAgent).to.eq('test123');
    });

    it('should add all feeds added at once', () => {
      const defaultRefesh = 60000;

      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'))
        .get('/feeds/news')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-news-first-fetch.xml'));

      const list = feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
      }, {
        url: 'https://www.nintendolife.com/feeds/news',
      });

      expect(list).to.have.property('length', 2);
      expect(list[0]).to.have.property('refresh', defaultRefesh);
      expect(list[1]).to.have.property('refresh', defaultRefesh);
    });
  });

  describe('#emit', () => {
    it('should be a Function', () => {
      expect(feeder.emit).to.be.a('function');
    });

    it('should emit custom events', (done) => {
      feeder.on('custom-event', (eventObject) => {
        expect(eventObject).to.be.an('object');
        expect(eventObject).to.have.property('name', 'rss-feed-emitter');
        done();
      });

      feeder.emit('custom-event', {
        name: 'rss-feed-emitter',
      });
    });

    it('should emit provided custom events', (done) => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 1000,
        eventName: 'nintendo',
      });

      let calledNum = 0;

      feeder.on('nintendo', () => {
        if (calledNum === 0) {
          calledNum += 1;
          feeder.destroy();
          done();
        }
      });
    });

    afterEach(() => {
      feeder.destroy();
    });
  });

  describe('#on', () => {
    it('should be a Function', () => {
      expect(feeder.on).to.be.a('function');
    });

    it('"new-item" should be emitted right after adding new feeds', (done) => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      const itemsReceived = [];

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 1000,
      });

      feeder.on('new-item', (item) => {
        const totalLength = 20;

        itemsReceived.push(item);
        if (itemsReceived.length === totalLength) {
          done();
        }
      });
    });

    /* Marked as pending until nock works with chained get/reply again */
    it('"new-item" should emit only new items in the second fetch', (done) => {
      nock('https://www.nintendolife.com')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'))
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-second-fetch.xml'));

      const itemsReceived = [];

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 100,
      });

      // This is the sum of the first 20 feed items
      // and then 9 more new items from the second
      // fetch totaling 29 items.
      const totalLength = 29;

      feeder.on('new-item', (item) => {
        itemsReceived.push(item);
        if (itemsReceived.length === totalLength) {
          feeder.destroy();
          expect(itemsReceived[19].title).to.equal('Feature: Super Mario Maker’s Weekly Course Collection - 20th November');
          expect(itemsReceived[19].date.toISOString()).to.equal('2015-11-20T15:00:00.000Z');
          expect(itemsReceived[20].title).to.equal('Feature: Memories of Court Battles in Mario Tennis');
          expect(itemsReceived[20].date.toISOString()).to.equal('2015-11-20T15:30:00.000Z');
          expect(itemsReceived[28].title).to.equal('Nintendo Life Weekly: Huge Pokémon Reveal Next Month, Arguably the Rarest Nintendo Game, and More');
          expect(itemsReceived[28].date.toISOString()).to.equal('2015-11-21T18:00:00.000Z');

          done();
        }
      });
    }).timeout(10000);

    it('"new-item" should emit items in ascending order', (done) => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      const itemsReceived = [];

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 10,
      });

      feeder.on('new-item', (item) => {
        itemsReceived.push(item);

        if (itemsReceived.length === 1) {
          expect(item.title).to.equal('Random: Sega And Nintendo Go To War Over Facial Hair');
          expect(item.date.toISOString()).to.equal('2015-11-19T10:00:00.000Z');
        }

        if (itemsReceived.length === 10) {
          expect(item.title).to.equal('Feature: Our Top 10 Wii U eShop Games - Third Anniversary Edition');
          expect(item.date.toISOString()).to.equal('2015-11-19T20:30:00.000Z');
        }

        if (itemsReceived.length === 20) {
          expect(item.title).to.equal('Feature: Super Mario Maker’s Weekly Course Collection - 20th November');
          expect(item.date.toISOString()).to.equal('2015-11-20T15:00:00.000Z');
          done();
        }
      });
    });

    it('"new-item" should contain an Object with at minimum fields', (done) => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      const itemsReceived = [];

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 10,
      });

      feeder.on('new-item', (item) => {
        const totalLength = 20;

        itemsReceived.push(item);

        expect(item).to.have.property('title');
        expect(item).to.have.property('description');
        expect(item).to.have.property('summary');
        expect(item).to.have.property('date');
        expect(item).to.have.property('link');
        expect(item).to.have.property('meta');

        if (itemsReceived.length === totalLength) {
          done();
        }
      });
    });

    it('"error" should be emitted when URL returns 404', (done) => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/zelda')
        .reply(404);

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/zelda',
        refresh: 100,
      });

      let errorCalls = 0;

      feeder.on('error', (error) => {
        if (errorCalls === 0) {
          errorCalls += 1;
          expect(error).to.have.property('name', 'fetch_url_error');
          expect(error).to.have.property('message', 'This URL returned a 404 status code');
          expect(error).to.have.property('feed', 'https://www.nintendolife.com/feeds/zelda');
          done();
        }
      });
    });

    it('"error" should be emitted when URL returns 500', (done) => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/link')
        .reply(500);

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/link',
        refresh: 100,
      });

      let errorCalls = 0;

      feeder.on('error', (error) => {
        if (errorCalls === 0) {
          errorCalls += 1;
          expect(error).to.have.property('name', 'fetch_url_error');
          expect(error).to.have.property('message', 'This URL returned a 500 status code');
          expect(error).to.have.property('feed', 'https://www.nintendolife.com/feeds/link');
          done();
        }
      });
    });

    it('"error" should be emitted when URL does not exist', (done) => {
      feeder.add({
        url: 'https://ww.cantconnecttothis.addres/feeed',
        refresh: 120000,
      });

      feeder.on('error', (error) => {
        expect(error).to.have.property('name', 'fetch_url_error');
        expect(error).to.have.property('message', 'Cannot connect to https://ww.cantconnecttothis.addres/feeed');
        expect(error).to.have.property('feed', 'https://ww.cantconnecttothis.addres/feeed');
        done();
      });
    });

    it('"error" should be emitted when the content is not a valid feed', (done) => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/mario')
        .reply(200, '<html><head><body><item><title>Broken XML</title></item></head></body>');

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/mario',
        refresh: 10,
      });

      feeder.on('error', (error) => {
        expect(error).to.have.property('name', 'invalid_feed');
        expect(error).to.have.property('message', 'Cannot parse https://www.nintendolife.com/feeds/mario XML');
        expect(error).to.have.property('feed', 'https://www.nintendolife.com/feeds/mario');
        done();
      });
    }).timeout(10000);
  });

  describe('.list', () => {
    it('should be an Array', () => {
      expect(feeder.list).to.be.an('array');
    });

    it('should return a blank Array by default', () => {
      const { list } = feeder;

      expect(list).to.be.an('array');
      expect(list).to.have.property('length', 0);
    });

    it('should list all registered feeds', () => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'))
        .get('/feeds/news')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-news-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 2000,
      });

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/news',
        refresh: 5000,
      });

      const { list } = feeder;

      expect(list).to.have.property('length', 2);

      expect(list[0]).to.have.property('url', 'https://www.nintendolife.com/feeds/latest');
      expect(list[0]).to.have.property('refresh', 2000);
      expect(list[0]).to.have.property('interval');

      expect(list[1]).to.have.property('url', 'https://www.nintendolife.com/feeds/news');
      expect(list[1]).to.have.property('refresh', 5000);
      expect(list[1]).to.have.property('interval');
    });
  });

  describe('#remove', () => {
    it('should be a Function', () => {
      expect(feeder.remove).to.be.a('function');
    });

    it('should remove a feed from the list with a String containing the feed url', () => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'))
        .get('/feeds/news')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-news-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 2000,
      });

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/news',
        refresh: 5000,
      });

      expect(feeder.list).to.have.property('length', 2);

      feeder.remove('https://www.nintendolife.com/feeds/latest');

      expect(feeder.list).to.have.property('length', 1);
      expect(feeder.list[0]).to.have.property('url', 'https://www.nintendolife.com/feeds/news');
    });

    it('should throw when called with a Number', () => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
      });

      expect(() => {
        const wrongNumberValue = 63289463284;

        feeder.remove(wrongNumberValue);
      }).to.throw(RssFeedError, 'You must call #remove with a string containing the feed url');
    });

    it('should throw when called with an Array', () => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
      });

      expect(() => {
        feeder.remove(['https://www.nintendolife.com/feeds/latest']);
      }).to.throw(RssFeedError, 'You must call #remove with a string containing the feed url');
    });

    it('should throw when called with an Object', () => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
      });

      expect(() => {
        feeder.remove({
          url: 'https://www.nintendolife.com/feeds/latest',
        });
      }).to.throw(RssFeedError, 'You must call #remove with a string containing the feed url');
    });

    it('should not throw when feed could not be found', () => {
      nock('https://www.nintendolife.com/')
        .get('/feeds/latest')
        .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'));

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
      });

      expect(() => {
        feeder.remove('https://www.nintendolife.com/feeds/news');
      }).not.to.throw();
    });
  });

  describe('#destroy', () => {
    nock('https://www.nintendolife.com/')
      .get('/feeds/latest')
      .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-latest-first-fetch.xml'))
      .get('/feeds/news')
      .replyWithFile(200, path.join(__dirname, '/fixtures/nintendo-news-first-fetch.xml'));


    it('should be a Function', () => {
      expect(feeder.destroy).to.be.a('function');
    });

    it('should remove all feeds from the instance', () => {
      feeder.add({
        url: 'https://www.nintendolife.com/feeds/latest',
        refresh: 2000,
      });

      feeder.add({
        url: 'https://www.nintendolife.com/feeds/news',
        refresh: 5000,
      });

      expect(feeder.list).to.have.property('length', 2);

      feeder.destroy();

      expect(feeder.list).to.have.property('length', 0);
    });
  });

  describe('storage Feed', () => {
    describe('#constructor', () => {
      it('should error when no url is provided', () => {
        expect(() => new Feed({ url: undefined })).to.throw(TypeError, 'missing required field `url`');
      });

      it('should default items to an empty list if none is provided', () => {
        const feed = new Feed({ url: 'https://npmjs.org' });
        expect(JSON.stringify(feed.items)).to.eq('[]');
      });

      it('should default refresh to 60000 if none is provided', () => {
        const feed = new Feed({ url: 'https://npmjs.org' });
        expect(feed.refresh).to.eq(60000);
      });

      it('should default refresh to 60000 if none is provided', () => {
        const feed = new Feed({ url: 'https://npmjs.org' });
        expect(feed.refresh).to.eq(60000);
      });

      it('should default user agent to defautl value if none is provided', () => {
        const feed = new Feed({ url: 'https://npmjs.org' });
        expect(feed.userAgent).to.eq('Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)');
      });
    });

    describe('#findItem', () => {
      it('should support matching on entry id', () => {
        const feed = new Feed({ url: 'https://npmjs.org', items: [{ id: '010' }] });
        const result = feed.findItem({ id: '010' });
        expect(result.id).to.eq('010');
      });

      it('should support matching on entry link and title', () => {
        const item = {
          title: 'On Endless Forms Most Beautiful',
          url: 'charles.darwin.co.uk',
        };

        const feed = new Feed({ url: 'https://npmjs.org', items: [item] });
        const result = feed.findItem(item);
        expect(result).to.not.eq(undefined);
        expect(result.id).to.eq(undefined);
        expect(result.title).to.eq('On Endless Forms Most Beautiful');
        expect(result.url).to.eq('charles.darwin.co.uk');
      });
    });
  });
});
