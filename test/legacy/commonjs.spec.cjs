'use strict';

/*
 * Legacy CommonJS consumers: `require('rss-feed-emitter')` keeps returning
 * the FeedEmitter class, exactly like rss-feed-emitter@3.
 */

const path = require('node:path');
const { expect } = require('chai');
const { default: nock } = require('nock');
const RssFeedEmitter = require('rss-feed-emitter');

describe('CommonJS legacy entry point', () => {
  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns the FeedEmitter class from require()', () => {
    expect(RssFeedEmitter).to.be.a('function');
    expect(RssFeedEmitter.name).to.eq('FeedEmitter');
  });

  it('shares the same class instance as the ES Module entry point', async () => {
    const esm = await import('rss-feed-emitter');
    expect(RssFeedEmitter).to.eq(esm.default);
  });

  it('emits new items', (done) => {
    nock('https://example.com')
      .get('/legacy.xml')
      .replyWithFile(200, path.join(__dirname, '../unit/fixtures/nintendo-latest-first-fetch.xml'));

    const feeder = new RssFeedEmitter();
    feeder.once('new-item', (item) => {
      feeder.destroy();
      expect(item).to.have.property('title').that.is.a('string');
      done();
    });
    feeder.add({ url: 'https://example.com/legacy.xml', refresh: 120000 });
  });
});
