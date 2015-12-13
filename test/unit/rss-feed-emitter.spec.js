'use strict';

import chai from 'chai';
import nock from 'nock';
import RssFeedEmitter from '../../src/rss-feed-emitter.js';
import * as _ from 'lodash';

let expect = chai.expect;

describe('RssFeedEmitter', () => {

	describe('quando instanciado', () => {

		let feeder = new RssFeedEmitter();

		it('deve retornar um objeto', () => {
			expect( feeder ).to.be.an('object');
		});

		it('#emit deve ser uma função', () => {
			expect( feeder.emit ).to.be.a('function');
		});
		
	})


	describe('#add', () => {

		let feeder;

		beforeEach( () => {

			feeder = new RssFeedEmitter();

		})

		it('deve ser uma função', () => {

			expect( feeder.add ).to.be.a('function');

		});

		it('deve retornar erro quando chamado sem objeto de configuração', () => {

			expect( () => feeder.add() ).to.throw(Error);

		});

		it('deve retornar erro quando objeto de configuração não possuir "url"', () => {

			expect( () => {
				
				feeder.add({
					refresh: 60000
				})

			}).to.throw(Error);

		});

		it('deve retornar erro quando objeto de configuração possuir "url" mas não é uma string', () => {

			expect( () => {

				feeder.add({
					url: [1, 2, 3]
				})

			}).to.throw(Error);

		});

		it('deve retornar erro quando objeto de configuração possuir "refresh" mas não é um número', () => {

			expect( () => { 

				feeder.add({
					url: 'http://www.nintendolife.com/feeds/latest',
					refresh: 'quickly'
				});

			}).to.throw(Error);

		});

		it('deve adicionar corretamente feeds quando possuir somente "url"', () => {

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

		it('deve substituir a taxa de atualização padrão quando possuir "refresh"', () => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 120000
			});

			expect( feeder.list()[0] ).to.have.property('refresh', 120000);

		});

		it('deve atualizar o feed quando "url" já existir na lista de feeds', () => {

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

		it('deve sempre manter o histórico máximo igual a quantidade de itens do feed vezes 3', (done) => {

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
				refresh: 10
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

		it('deve ser uma função', () => {

			expect( feeder.on ).to.be.a('function');

		});

		it('"new-item" deve ser emitido logo após adicionar um novo feed', (done) => {

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

		it('"new-item" deve emitir somente os novos itens no segundo fetch', (done) => {

			nock('http://www.nintendolife.com/')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-first-fetch.xml')
				.get('/feeds/latest')
				.replyWithFile(200, __dirname + '/fixtures/nintendo-latest-second-fetch.xml')

			let itemsReceived = [];

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 10
			});

			feeder.on('new-item', (item) => {

				itemsReceived.push(item);

				// Esta é a soma dos primeiros 20 feeds
				// e depois mais 9 novos feeds do segundo
				// fetch totalizando 29 items
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

		it('"new-item" deve emitir os itens em ordem crescente', (done) => {

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

		it('deve ser uma função', () => {

			expect( feeder.list ).to.be.a('function');

		});

		it('deve retornar um array em branco por default', () => {

			let list = feeder.list();

			expect( list ).to.be.an('array');
			expect( list ).to.have.property('length', 0);

		});


		it('deve listar todos os feeds cadastrados', () => {

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
			}).to.throw(Error);

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
			}).to.throw(Error);

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
			}).to.throw(Error);

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
