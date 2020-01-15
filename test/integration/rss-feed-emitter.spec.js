'use strict';

const chai = require('chai');
const RssFeedEmitter = require('../../src/FeedEmitter');

const { expect } = chai;

const expectedlength = 1;
const refresh = 100;

process.env.NOCK_OFF = true;

const feeds = [
  {
    name: 'Nintendo Life',
    url: 'https://www.nintendolife.com/feeds/latest',
  },
  {
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
  },
  {
    name: 'Time',
    url: 'http://feeds.feedburner.com/time/topstories?format=xml',
  },
  {
    name: 'The Guardian',
    url: 'http://www.theguardian.com/world/rss',
  },
  {
    name: 'The Huffington Post',
    url: 'http://www.huffingtonpost.com/feeds/index.xml',
  },
  {
    name: 'The New York Times',
    url: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  },
  {
    name: 'Reddit',
    url: 'https://www.reddit.com/.rss',
  },
  {
    name: 'Milliyet Gazetesi',
    url: 'http://www.milliyet.com.tr/rss/rssNew/gundemRss.xml',
  },
  {
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
  },
];


// I've had issues with these, but if someone wants to rewrite it fully, they're welcome to.
// I can get them to notify in a tester, but not in here, sadly.
xdescribe('RssFeedEmitter (integration)', () => {
  describe('#on', () => {
    let feeder;

    beforeEach(() => { feeder = new RssFeedEmitter(); });

    feeds.forEach(({ name, url }) => {
      it(`should emit items from "${name}"`, (done) => {
        const itemsReceived = [];

        feeder.add({ url, refresh });

        feeder.on('new-item', (item) => {
          itemsReceived.push(item);
          expect(item.title).to.be.a('string');
          expect(item.description).to.be.a('string');
          expect(item.date).to.be.a('date');
          expect(item.meta).to.have.property('link', url);
          expect(itemsReceived.length).to.be(expectedlength);
          done();
        });
      });
    });

    // this doesn't work for me, as the feed doesn't redirect even in a browser
    xit('should emit items from feed url involving redirects', (done) => {
      const itemsReceived = [];

      const feedUrl = 'https://feeds.nczonline.net/blog/';

      feeder.add({ url: feedUrl, refresh });

      feeder.on('new-item', (item) => {
        itemsReceived.push(item);
        expect(item.title).to.be.a('string');
        expect(item.description).to.be.a('string');
        expect(item.date).to.be.a('date');
        expect(item.meta).to.have.property('link', feedUrl);
        expect(itemsReceived.length).to.be(expectedlength);
        done();
      });
    });

    afterEach(() => {
      feeder.destroy();
    });
  });
});
