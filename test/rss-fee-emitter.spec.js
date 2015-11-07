'use strict';

import chai from 'chai';
import RssFeedEmitter from '../src/rss-feed-emitter.js';

let expect = chai.expect;

describe('RssFeedEmitter', () => {

	describe('quando instanciado', () => {

		let feeder = new RssFeedEmitter();

		it('deve retornar um objeto', () => {
			expect( feeder ).to.be.an('object');
		});

		it('#on deve ser uma função', () => {
			expect( feeder.on ).to.be.a('function');
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

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/reviews',
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/news',
			});

			expect( feeder.list() ).to.have.property('length', 2);
			expect( feeder.list()[0] ).to.have.property('refresh', 60000);
			expect( feeder.list()[1] ).to.have.property('refresh', 60000);

		});

		it('deve substituir a taxa de atualização padrão quando possuir "refresh"', () => {

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/comments',
				refresh: 120000
			});

			expect( feeder.list()[0] ).to.have.property('refresh', 120000);

		});

		it('deve atualizar o feed quando "url" já existir na lista de feeds', () => {

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/forums',
				refresh: 120000
			});

			expect( feeder.list() ).to.have.property('length', 1);
			expect( feeder.list()[0] ).to.have.property('refresh', 120000);

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/forums',
				refresh: 240000 
			});

			expect( feeder.list() ).to.have.property('length', 1);
			expect( feeder.list()[0] ).to.have.property('refresh', 240000);

		});

		afterEach( () => {
			feeder.destroy();
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

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/mario',
				refresh: 2000
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/zelda',
				refresh: 5000
			});

			let list = feeder.list();

			expect( list ).to.have.property('length', 2);

			expect( list[0] ).to.have.property('url', 'http://www.nintendolife.com/feeds/mario');
			expect( list[0] ).to.have.property('refresh', 2000);
			expect( list[0] ).to.have.property('setInterval');

			expect( list[1] ).to.have.property('url', 'http://www.nintendolife.com/feeds/zelda');
			expect( list[1] ).to.have.property('refresh', 5000);
			expect( list[1] ).to.have.property('setInterval');

		})

		afterEach( () => {
			feeder.destroy();
		})

	})


	describe('#remove', () => {

		let feeder;

		beforeEach( () => {
			feeder = new RssFeedEmitter();
		})


		it('#remove deve ser uma função', () => {
			expect( feeder.remove ).to.be.a('function');
		});

		it('deve remover um feed da lista utilizando uma "string" contendo a url do feed', () => {

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/yoshi',
				refresh: 2000
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/wario',
				refresh: 5000
			});

			expect( feeder.list() ).to.have.property('length', 2);

			feeder.remove('http://www.nintendolife.com/feeds/yoshi');

			expect( feeder.list() ).to.have.property('length', 1);
			expect( feeder.list()[0] ).to.have.property('url', 'http://www.nintendolife.com/feeds/wario');

		});
		
		it('deve retornar erro quando o método é invocado com um "number"', () => {

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest'
			});

			expect( () => { 
				feeder.remove(1000);
			}).to.throw(Error);

		});

		it('deve retornar erro quando o método é invocado com um "array"', () => {

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest'
			});

			expect( () => { 
				feeder.remove(['http://www.nintendolife.com/feeds/latest']);
			}).to.throw(Error);

		});

		it('deve retornar erro quando o método é invocado com um "object"', () => {

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

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest'
			});

			expect( () => { 
				feeder.remove('http://www.nintendolife.com/feeds/zelda');
			}).not.to.throw(Error);

		});

		afterEach( () => {
			feeder.destroy();
		})

	})


	describe('#destroy', () => {

		it('deve ser uma função', () => {
			let feeder = new RssFeedEmitter();
			expect( feeder.destroy ).to.be.a('function');
		});

		it('deve limpar todos os feeds da instância', () => {
			let feeder = new RssFeedEmitter();

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/link',
				refresh: 2000
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/luigi',
				refresh: 5000
			});

			expect( feeder.list() ).to.have.property('length', 2);

			feeder.destroy();

			expect( feeder.list() ).to.have.property('length', 0);

		});
		
	})

})
