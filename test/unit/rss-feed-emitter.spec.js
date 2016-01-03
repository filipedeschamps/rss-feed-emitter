'use strict';

import chai from 'chai';
import nock from 'nock';
import RssFeedEmitter from '../../src/rss-feed-emitter.js';
import * as _ from 'lodash';

let expect = chai.expect;

describe('RssFeedEmitter (unit)', () => {

	describe('when instantiated', () => {

		let feeder = new RssFeedEmitter();

		it('should return an object', () => {
			expect( feeder ).to.be.an('object');
		});

		it('#emit should be a function', () => {
			expect( feeder.emit ).to.be.a('function');
		});
		
	})


	describe('#add', () => {

		let feeder;

		beforeEach( () => {

			feeder = new RssFeedEmitter();

		})

		it('should be a function', () => {

			expect( feeder.add ).to.be.a('function');

		});

		it('should return an error when called without configuration object', () => {

			expect( () => feeder.add() ).to.throw().to.eql({
				type: 'type_error',
				message: 'You must call #add method with a feed configuration object.'
			});

		});

		it('should throw when configuration object does not contains "url"', () => {

			expect( () => {
				
				feeder.add({
					refresh: 60000
				})

			}).to.throw().to.eql({
				type: 'type_error',
				message: 'Your configuration object should have an "url" key with a string value'
			});

		});

		it('should throw when configuration object contains "url", but its not a string', () => {

			expect( () => {

				feeder.add({
					url: [1, 2, 3]
				})

			}).to.throw().to.eql({
				type: 'type_error',
				message: 'Your configuration object should have an "url" key with a string value'
			});

		});

		it('should throw when configuration object contains "refresh", but its not a number', () => {

			expect( () => { 

				feeder.add({
					url: 'http://www.nintendolife.com/feeds/latest',
					refresh: 'quickly'
				});

			}).to.throw({
				type: 'type_error',
				message: 'Your configuration object should have a "refresh" key with a number value'
			});

		});

		it('should correctly add feeds when configuration object contains only "url"', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')
				.get('/feeds/news')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-news-first-fetch.xml');

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/news',
			});

			expect( feeder.list() ).to.have.property('length', 2);
			expect( feeder.list()[0] ).to.have.property('refresh', 60000);
			expect( feeder.list()[1] ).to.have.property('refresh', 60000);

		});

		it('should replace default refresh rate if configuration object contains "refresh"', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 120000
			});

			expect( feeder.list()[0] ).to.have.property('refresh', 120000);

		});

		it('should update feed when "url" already exists in feed list', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.twice()
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 120000
			});

			expect( feeder.list() ).to.have.property('length', 1);
			expect( feeder.list()[0] ).to.have.property('refresh', 120000);

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 240000 
			});

			expect( feeder.list() ).to.have.property('length', 1);
			expect( feeder.list()[0] ).to.have.property('refresh', 240000);

		});

		it('should always keep feed max history the number of feed items times 3', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-second-fetch.xml')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-third-fetch.xml')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-fourth-fetch.xml')

			let itemsReceived = [];

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 50
			});

			feeder.on('new-item', (item) => {
				itemsReceived.push(item);

				let feed = _.find(feeder.list(), { url: 'http://www.nintendolife.com/feeds/latest' });
				expect(feed.items.length).to.be.below(61);

				if (itemsReceived.length === 69) {
					done();
				}
			})

		});

		afterEach( () => {
			feeder.destroy();
			nock.cleanAll();
		})

	})


	describe('#on', () => {

		let feeder;

		beforeEach( () => {

			feeder = new RssFeedEmitter();
			
		})

		it('should be a function', () => {

			expect( feeder.on ).to.be.a('function');

		});

		it('"new-item" should be emitted right after adding a new feed', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')

			let itemsReceived = [];

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 10000
			});

			feeder.on('new-item', (item) => {
				itemsReceived.push(item);

				if (itemsReceived.length === 20) {
					done();
				}
			});

		})

		it('"new-item" should emit only new items in the second fetch', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-second-fetch.xml')

			let itemsReceived = [];

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 50
			});

			feeder.on('new-item', (item) => {

				itemsReceived.push(item);

				// This is the sum of the first 20 feed items
				// and then 9 more new items from the second
				// fetch totaling 29 items.
				if (itemsReceived.length === 29) {
					expect(itemsReceived[19].title).to.equal('Feature: Super Mario Maker’s Weekly Course Collection - 20th November');
					expect(itemsReceived[19].date.toISOString()).to.equal('2015-11-20T15:00:00.000Z');
					expect(itemsReceived[20].title).to.equal('Feature: Memories of Court Battles in Mario Tennis');
					expect(itemsReceived[20].date.toISOString()).to.equal('2015-11-20T15:30:00.000Z');
					expect(itemsReceived[28].title).to.equal('Nintendo Life Weekly: Huge Pokémon Reveal Next Month, Arguably the Rarest Nintendo Game, and More');
					expect(itemsReceived[28].date.toISOString()).to.equal('2015-11-21T18:00:00.000Z');

					done();
				}
			});

		})

		it('"new-item" should emit items in crescent order', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml');

			let itemsReceived = [];

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 20000
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
				}

				if (itemsReceived.length === 20) {
					done();
				}
			});

		})

		it('"new-item" should contain an object with "title", "description", "summary", "date", "link" and "meta"', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml');

			let itemsReceived = [];

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 20000
			});

			feeder.on('new-item', (item) => {

				itemsReceived.push(item);

				expect(item).to.have.property('title');
				expect(item).to.have.property('description');
				expect(item).to.have.property('summary');
				expect(item).to.have.property('date');
				expect(item).to.have.property('link');
				expect(item).to.have.property('meta');

				if (itemsReceived.length === 20) {
					done();
				}
			});

		})

		it('"error" should be emitted when URL returns 404', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/zelda')
				.reply(404);

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/zelda',
				refresh: 120000
			});

			feeder.on('error', (error) => {
				expect(error).to.have.property('type', 'fetch_url_error');
				expect(error).to.have.property('message', 'This URL returned a 404 status code');
				expect(error).to.have.property('feed', 'http://www.nintendolife.com/feeds/zelda');
				done();
			})
		});

		it('"error" should be emitted when URL returns 500', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/link')
				.reply(500);

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/link',
				refresh: 120000
			});

			feeder.on('error', (error) => {
				expect(error).to.have.property('type', 'fetch_url_error');
				expect(error).to.have.property('message', 'This URL returned a 500 status code');
				expect(error).to.have.property('feed', 'http://www.nintendolife.com/feeds/link');
				done();
			})

		});

		it('"error" should be emitted when URL does not exist', (done) => {

			feeder.add({
				url: 'http://ww.cantconnecttothis.addres/feeed',
				refresh: 120000
			});

			feeder.on('error', (error) => {
				expect(error).to.have.property('type', 'fetch_url_error');
				expect(error).to.have.property('message', 'Cannot connect to http://ww.cantconnecttothis.addres/feeed');
				expect(error).to.have.property('feed', 'http://ww.cantconnecttothis.addres/feeed');
				done();
			})
		});


		it('"error" should be emitted when the content is not a valid feed', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/mario')
				.reply(200, '<html><head><body><item><title>Broken xml</title></item></head></body>');

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/mario',
				refresh: 120000
			});

			feeder.on('error', (error) => {
				expect(error).to.have.property('type', 'invalid_feed');
				expect(error).to.have.property('message', 'Cannot parse http://www.nintendolife.com/feeds/mario XML');
				expect(error).to.have.property('feed', 'http://www.nintendolife.com/feeds/mario');
				done();
			})

		});


		afterEach( () => {
			feeder.destroy();
			nock.cleanAll();
		})

	})


	describe('#list', () => {

		let feeder;

		beforeEach( () => {

			feeder = new RssFeedEmitter();

		})

		it('should be a function', () => {

			expect( feeder.list ).to.be.a('function');

		});

		it('should return a blank array by default', () => {

			let list = feeder.list();

			expect( list ).to.be.an('array');
			expect( list ).to.have.property('length', 0);

		});


		it('should list all registered feeds', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')
				.get('/feeds/news')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-news-first-fetch.xml');


			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 2000
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/news',
				refresh: 5000
			});

			let list = feeder.list();

			expect( list ).to.have.property('length', 2);

			expect( list[0] ).to.have.property('url', 'http://www.nintendolife.com/feeds/latest');
			expect( list[0] ).to.have.property('refresh', 2000);
			expect( list[0] ).to.have.property('setInterval');

			expect( list[1] ).to.have.property('url', 'http://www.nintendolife.com/feeds/news');
			expect( list[1] ).to.have.property('refresh', 5000);
			expect( list[1] ).to.have.property('setInterval');

		})

		afterEach( () => {
			feeder.destroy();
			nock.cleanAll();
		})

	})


	describe('#remove', () => {

		let feeder;

		beforeEach( () => {

			feeder = new RssFeedEmitter();

		})


		it('deve ser uma função', () => {

			expect( feeder.remove ).to.be.a('function');

		});

		it('deve remover um feed da lista utilizando uma "string" contendo a url do feed', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')
				.get('/feeds/news')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-news-first-fetch.xml');

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 2000
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/news',
				refresh: 5000
			});

			expect( feeder.list() ).to.have.property('length', 2);

			feeder.remove('http://www.nintendolife.com/feeds/latest');

			expect( feeder.list() ).to.have.property('length', 1);
			expect( feeder.list()[0] ).to.have.property('url', 'http://www.nintendolife.com/feeds/news');

		});
		
		it('deve retornar erro quando o método é invocado com um "number"', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest'
			});

			expect( () => { 
				feeder.remove(1000);
			}).to.throw().to.eql({
				type: 'type_error',
				message: 'You must call #remove with a string containing the feed url'
			});

		});

		it('deve retornar erro quando o método é invocado com um "array"', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest'
			});

			expect( () => { 
				feeder.remove(['http://www.nintendolife.com/feeds/latest']);
			}).to.throw().to.eql({
				type: 'type_error',
				message: 'You must call #remove with a string containing the feed url'
			});

		});

		it('deve retornar erro quando o método é invocado com um "object"', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest'
			});

			expect( () => { 
				feeder.remove({
					url: 'http://www.nintendolife.com/feeds/latest'
				});
			}).to.throw().to.eql({
				type: 'type_error',
				message: 'You must call #remove with a string containing the feed url'
			});

		});

		it('não deve retornar um erro quando não encontrar o feed', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest'
			});

			expect( () => { 
				feeder.remove('http://www.nintendolife.com/feeds/news');
			}).not.to.throw(Error);

		});

		afterEach( () => {
			feeder.destroy();
			nock.cleanAll();
		})

	})


	describe('#destroy', () => {

		// Este teste não possui beforeEach e afterEach, pois é necessário
		// executar o feeder.destroy() dentro do teste para conseguir
		// mensurar se a lista de feeds foi zerada.
		
		nock('http://www.nintendolife.com/')
			.get('/feeds/latest')
			.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')
			.get('/feeds/news')
			.replyWithFile(200, __dirname + '/fixtures/nintendo-news-first-fetch.xml');


		it('deve ser uma função', () => {
			let feeder = new RssFeedEmitter();
			expect( feeder.destroy ).to.be.a('function');
		});

		it('deve limpar todos os feeds da instância', () => {
			let feeder = new RssFeedEmitter();

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 2000
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/news',
				refresh: 5000
			});

			expect( feeder.list() ).to.have.property('length', 2);

			feeder.destroy();

			expect( feeder.list() ).to.have.property('length', 0);

		});
		
	})

})
