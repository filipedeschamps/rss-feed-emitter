import { expect } from 'chai';
import nock from 'nock';
import RssFeedEmitter, { FeedEmitter, FeedError } from 'rss-feed-emitter';
import SourceFeedEmitter from '../../src/FeedEmitter.js';
import SourceFeedError from '../../src/FeedError.js';

describe('ES Module public API', () => {
  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('exposes the FeedEmitter class as the default export', () => {
    expect(RssFeedEmitter).to.eq(SourceFeedEmitter);
  });

  it('exposes FeedEmitter and FeedError as named exports', () => {
    expect(FeedEmitter).to.eq(SourceFeedEmitter);
    expect(FeedError).to.eq(SourceFeedError);
  });

  it('emits new items when consumed through the package entry point', (done) => {
    nock('https://example.com')
      .get('/feed.xml')
      .replyWithFile(200, `${import.meta.dirname}/fixtures/nintendo-latest-first-fetch.xml`);

    const feeder = new RssFeedEmitter();
    feeder.once('new-item', (item) => {
      feeder.destroy();
      expect(item).to.have.property('title').that.is.a('string');
      expect(item.meta).to.have.property('link', 'https://example.com/feed.xml');
      done();
    });
    feeder.add({ url: 'https://example.com/feed.xml', refresh: 120000 });
  });

  it('throws FeedError instances on invalid configuration', () => {
    const feeder = new RssFeedEmitter();
    expect(() => feeder.add()).to.throw(FeedError);
  });
});
